import React, { useEffect, useMemo, useState } from 'react';
import { Form, Modal, Select, Switch, Input } from 'antd';
import type { FormInstance } from 'antd';
import { Button, TextInput } from '@tremor/react';
import {
  guardrail_provider_map,
  guardrailLogoMap,
  getGuardrailProviders,
  populateGuardrailProviders,
  populateGuardrailProviderMap,
} from './guardrail_info_helpers';
import { getGuardrailProviderSpecificParams, getGuardrailUISettings } from '../networking';
import PiiConfiguration from './pii_configuration';
import GuardrailProviderFields from './guardrail_provider_fields';
import NotificationsManager from '../molecules/notifications_manager';
import Image from 'next/image';

const { Option } = Select;

interface EditGuardrailFormProps {
  visible: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSuccess: () => void;
  guardrailId: string;
  initialValues: {
    guardrail_name: string;
    provider: string;
    mode: string;
    default_on: boolean;
    pii_entities_config?: { [key: string]: string };
    [key: string]: any;
  };
  initialLitellmParams?: Record<string, any>;
}

interface GuardrailSettings {
  supported_entities: string[];
  supported_actions: string[];
  supported_modes: string[];
  pii_entity_categories: Array<{
    category: string;
    entities: string[];
  }>;
}

interface ProviderParam {
  param: string;
  description: string;
  required: boolean;
  default_value?: string;
  options?: string[];
  type?: string;
  fields?: { [key: string]: ProviderParam };
  dict_key_options?: string[];
  dict_value_type?: string;
}

interface ProviderParamsResponse {
  [provider: string]: { [key: string]: ProviderParam };
}

interface ProviderParamStructure {
  [key: string]: ProviderParamStructure | true;
}

const collectAllowedParamKeys = (
  fields: { [key: string]: ProviderParam } | undefined
): ProviderParamStructure => {
  const structure: ProviderParamStructure = {};

  if (!fields) {
    return structure;
  }

  Object.entries(fields).forEach(([fieldKey, fieldConfig]) => {
    if (!fieldConfig || fieldKey === 'ui_friendly_name') {
      return;
    }

    if (fieldKey === 'optional_params') {
      structure[fieldKey] = collectAllowedParamKeys(fieldConfig.fields);
      return;
    }

    if (
      fieldConfig.fields &&
      (fieldConfig.type === 'nested' || fieldConfig.type === 'object' || fieldConfig.type === undefined)
    ) {
      structure[fieldKey] = collectAllowedParamKeys(fieldConfig.fields);
      return;
    }

    structure[fieldKey] = true;
  });

  return structure;
};

const structureHasParams = (structure: ProviderParamStructure): boolean => {
  return Object.values(structure).some((value) => {
    if (value === true) {
      return true;
    }

    if (value && typeof value === 'object') {
      return structureHasParams(value as ProviderParamStructure);
    }

    return false;
  });
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isEmptyObject = (value: unknown): boolean => {
  return isPlainObject(value) && Object.keys(value).length === 0;
};

const isEmptyValue = (value: any): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
};

const getValueForPath = (
  values: Record<string, any>,
  path: string[],
  formInstance: FormInstance
) => {
  let current: any = values;

  for (const segment of path) {
    if (isPlainObject(current) && segment in current) {
      current = current[segment];
    } else {
      current = undefined;
      break;
    }
  }

  if (current !== undefined) {
    return current;
  }

  const joinedPath = path.join('.');

  if (joinedPath in values) {
    return values[joinedPath];
  }

  const valueFromFormArray = formInstance.getFieldValue(path);

  if (valueFromFormArray !== undefined) {
    return valueFromFormArray;
  }

  return formInstance.getFieldValue(joinedPath);
};

const extractStructuredProviderValues = (
  structure: ProviderParamStructure,
  values: Record<string, any>,
  formInstance: FormInstance
): Record<string, any> => {
  const traverse = (
    node: ProviderParamStructure,
    path: string[]
  ): Record<string, any> => {
    const result: Record<string, any> = {};

    Object.entries(node).forEach(([key, child]) => {
      const nextPath = [...path, key];

      if (child === true) {
        const fieldValue = getValueForPath(values, nextPath, formInstance);

        if (!isEmptyValue(fieldValue)) {
          result[key] = fieldValue;
        }

        return;
      }

      if (child && typeof child === 'object') {
        const nestedValue = traverse(child as ProviderParamStructure, nextPath);

        if (!isEmptyObject(nestedValue)) {
          result[key] = nestedValue;
          return;
        }

        const fallbackValue = getValueForPath(values, nextPath, formInstance);

        if (!isEmptyValue(fallbackValue)) {
          result[key] = fallbackValue;
        }
      }
    });

    return result;
  };

  return traverse(structure, []);
};

const deepMerge = (target: Record<string, any>, source: Record<string, any>) => {
  const output: Record<string, any> = { ...target };

  Object.entries(source).forEach(([key, sourceValue]) => {
    if (isPlainObject(sourceValue)) {
      const targetValue = output[key];

      if (isPlainObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        output[key] = deepMerge({}, sourceValue);
      }
    } else if (Array.isArray(sourceValue)) {
      output[key] = [...sourceValue];
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
};

const EditGuardrailForm: React.FC<EditGuardrailFormProps> = ({
  visible,
  onClose,
  accessToken,
  onSuccess,
  guardrailId,
  initialValues,
  initialLitellmParams = {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(initialValues?.provider || null);
  const [guardrailSettings, setGuardrailSettings] = useState<GuardrailSettings | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<{ [key: string]: string }>({});
  const [providerParams, setProviderParams] = useState<ProviderParamsResponse | null>(null);

  useEffect(() => {
    const fetchGuardrailData = async () => {
      try {
        if (!accessToken) return;

        const [settings, providerSpecificParams] = await Promise.all([
          getGuardrailUISettings(accessToken),
          getGuardrailProviderSpecificParams(accessToken),
        ]);

        setGuardrailSettings(settings);
        setProviderParams(providerSpecificParams);
      } catch (error) {
        console.error('Error fetching guardrail settings:', error);
        NotificationsManager.fromBackend('Failed to load guardrail settings');
      }
    };

    fetchGuardrailData();
  }, [accessToken]);

  useEffect(() => {
    if (!providerParams) {
      return;
    }

    populateGuardrailProviders(providerParams);
    populateGuardrailProviderMap(providerParams);
  }, [providerParams]);

  useEffect(() => {
    if (initialValues?.pii_entities_config && Object.keys(initialValues.pii_entities_config).length > 0) {
      setSelectedEntities(Object.keys(initialValues.pii_entities_config));
      setSelectedActions(initialValues.pii_entities_config);
    } else {
      setSelectedEntities([]);
      setSelectedActions({});
    }
  }, [initialValues]);

  useEffect(() => {
    setSelectedProvider(initialValues?.provider || null);
  }, [initialValues?.provider]);

  const formInitialValues = useMemo(
    () => ({
      ...initialLitellmParams,
      ...initialValues,
    }),
    [initialLitellmParams, initialValues]
  );

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(formInitialValues);
  }, [form, formInitialValues]);

  const providerFieldValues = useMemo(() => {
    const fieldValues: Record<string, any> = {};

    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (!['guardrail_name', 'provider', 'mode', 'default_on', 'pii_entities_config'].includes(key)) {
          fieldValues[key] = value;
        }
      });
    }

    if (initialLitellmParams) {
      Object.entries(initialLitellmParams).forEach(([key, value]) => {
        if (!['guardrail', 'mode', 'default_on', 'pii_entities_config'].includes(key)) {
          fieldValues[key] = value;
        }
      });
    }

    return fieldValues;
  }, [initialLitellmParams, initialValues]);

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    form.setFieldsValue({ config: undefined });
    setSelectedEntities([]);
    setSelectedActions({});
  };

  const handleEntitySelect = (entity: string) => {
    setSelectedEntities((prev) => {
      if (prev.includes(entity)) {
        return prev.filter((e) => e !== entity);
      }
      return [...prev, entity];
    });
  };

  const handleActionSelect = (entity: string, action: string) => {
    setSelectedActions((prev) => ({
      ...prev,
      [entity]: action,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const guardrailProvider = guardrail_provider_map[values.provider];

      const existingLitellmParams = {
        ...initialLitellmParams,
      };

      const guardrailData: {
        guardrail_id: string;
        guardrail: {
          guardrail_name: string;
          litellm_params: {
            guardrail: string;
            mode: string;
            default_on: boolean;
            [key: string]: any;
          };
          guardrail_info: any;
        };
      } = {
        guardrail_id: guardrailId,
        guardrail: {
          guardrail_name: values.guardrail_name,
          litellm_params: {
            ...existingLitellmParams,
            guardrail: guardrailProvider,
            mode: values.mode,
            default_on: values.default_on,
          },
          guardrail_info: {},
        },
      };

      if (values.provider === 'PresidioPII' && selectedEntities.length > 0) {
        const piiEntitiesConfig: { [key: string]: string } = {};
        selectedEntities.forEach((entity) => {
          piiEntitiesConfig[entity] = selectedActions[entity] || 'MASK';
        });

        guardrailData.guardrail.litellm_params.pii_entities_config = piiEntitiesConfig;
      } else if (values.config) {
        try {
          const configObj = JSON.parse(values.config);

          if (values.provider === 'Bedrock' && configObj) {
            if (configObj.guardrail_id) {
              guardrailData.guardrail.litellm_params.guardrailIdentifier = configObj.guardrail_id;
            }
            if (configObj.guardrail_version) {
              guardrailData.guardrail.litellm_params.guardrailVersion = configObj.guardrail_version;
            }
          } else {
            guardrailData.guardrail.guardrail_info = configObj;
          }
        } catch (error) {
          NotificationsManager.fromBackend('Invalid JSON in configuration');
          setLoading(false);
          return;
        }
      }

      if (providerParams && selectedProvider) {
        const providerKey = guardrail_provider_map[selectedProvider]?.toLowerCase();
        const providerSpecificParams = providerParams[providerKey];

        if (providerSpecificParams) {
          const allowedParamStructure = collectAllowedParamKeys(providerSpecificParams);
          const structuredProviderValues = extractStructuredProviderValues(
            allowedParamStructure,
            values,
            form
          );

          if (!isEmptyObject(structuredProviderValues)) {
            guardrailData.guardrail.litellm_params = deepMerge(
              guardrailData.guardrail.litellm_params,
              structuredProviderValues
            );
          }
        }
      }

      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log('Sending guardrail update data:', JSON.stringify(guardrailData));

      const url = `/guardrails/${guardrailId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guardrailData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update guardrail');
      }

      NotificationsManager.success('Guardrail updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update guardrail:', error);
      NotificationsManager.fromBackend(
        'Failed to update guardrail: ' + (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPiiConfiguration = () => {
    if (!guardrailSettings || !selectedProvider || selectedProvider !== 'PresidioPII') return null;

    return (
      <PiiConfiguration
        entities={guardrailSettings.supported_entities}
        actions={guardrailSettings.supported_actions}
        selectedEntities={selectedEntities}
        selectedActions={selectedActions}
        onEntitySelect={handleEntitySelect}
        onActionSelect={handleActionSelect}
        entityCategories={guardrailSettings.pii_entity_categories}
      />
    );
  };

  const renderLegacyProviderConfigFields = () => {
    if (!selectedProvider) {
      return null;
    }

    switch (selectedProvider) {
      case 'Aporia':
        return (
          <Form.Item
            label="Aporia Configuration"
            name="config"
            tooltip="JSON configuration for Aporia"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "api_key": "your_aporia_api_key",
  "project_name": "your_project_name"
}`}
            />
          </Form.Item>
        );
      case 'AimSecurity':
        return (
          <Form.Item
            label="Aim Security Configuration"
            name="config"
            tooltip="JSON configuration for Aim Security"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "api_key": "your_aim_api_key"
}`}
            />
          </Form.Item>
        );
      case 'Bedrock':
        return (
          <Form.Item
            label="Amazon Bedrock Configuration"
            name="config"
            tooltip="JSON configuration for Amazon Bedrock guardrails"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "guardrail_id": "your_guardrail_id",
  "guardrail_version": "your_guardrail_version"
}`}
            />
          </Form.Item>
        );
      case 'GuardrailsAI':
        return (
          <Form.Item
            label="Guardrails.ai Configuration"
            name="config"
            tooltip="JSON configuration for Guardrails.ai"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "api_key": "your_guardrails_api_key",
  "guardrail_id": "your_guardrail_id"
}`}
            />
          </Form.Item>
        );
      case 'LakeraAI':
        return (
          <Form.Item
            label="Lakera AI Configuration"
            name="config"
            tooltip="JSON configuration for Lakera AI"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "api_key": "your_lakera_api_key"
}`}
            />
          </Form.Item>
        );
      case 'PromptInjection':
        return (
          <Form.Item
            label="Prompt Injection Configuration"
            name="config"
            tooltip="JSON configuration for prompt injection detection"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "threshold": 0.8
}`}
            />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            label="Custom Configuration"
            name="config"
            tooltip="JSON configuration for your custom guardrail"
          >
            <Input.TextArea
              rows={4}
              placeholder={`{
  "key1": "value1",
  "key2": "value2"
}`}
            />
          </Form.Item>
        );
    }
  };

  const renderProviderSpecificFields = () => {
    if (!selectedProvider) return null;

    if (selectedProvider === 'PresidioPII') {
      return renderPiiConfiguration();
    }

    // Preserve the legacy JSON config textarea for providers that
    // don't yet expose structured metadata via the guardrail params API.
    let shouldRenderLegacyFields = false;

    if (providerParams && selectedProvider) {
      const providerKey = guardrail_provider_map[selectedProvider]?.toLowerCase();
      const providerSpecificParams = providerKey ? providerParams[providerKey] : undefined;

      if (!providerSpecificParams) {
        shouldRenderLegacyFields = true;
      } else {
        const allowedParamStructure = collectAllowedParamKeys(providerSpecificParams);
        shouldRenderLegacyFields = !structureHasParams(allowedParamStructure);
      }
    }

    return (
      <>
        <GuardrailProviderFields
          selectedProvider={selectedProvider}
          accessToken={accessToken}
          providerParams={providerParams}
          value={providerFieldValues}
        />
        {shouldRenderLegacyFields && renderLegacyProviderConfigFields()}
      </>
    );
  };

  return (
    <Modal title="Edit Guardrail" open={visible} onCancel={onClose} footer={null} width={700}>
      <Form form={form} layout="vertical" initialValues={formInitialValues}>
        <Form.Item
          name="guardrail_name"
          label="Guardrail Name"
          rules={[{ required: true, message: 'Please enter a guardrail name' }]}
        >
          <TextInput placeholder="Enter a name for this guardrail" />
        </Form.Item>

        <Form.Item
          name="provider"
          label="Guardrail Provider"
          rules={[{ required: true, message: 'Please select a provider' }]}
        >
          <Select
            placeholder="Select a guardrail provider"
            onChange={handleProviderChange}
            disabled={true}
            optionLabelProp="label"
          >
            {Object.entries(getGuardrailProviders()).map(([key, value]) => (
              <Option key={key} value={key} label={value}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {guardrailLogoMap[value] && (
                    <Image
                      src={guardrailLogoMap[value]}
                      alt=""
                      style={{
                        height: '20px',
                        width: '20px',
                        marginRight: '8px',
                        objectFit: 'contain',
                      }}
                      width={20}
                      height={20}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{value}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="mode"
          label="Mode"
          tooltip="How the guardrail should be applied"
          rules={[{ required: true, message: 'Please select a mode' }]}
        >
          <Select>
            {guardrailSettings?.supported_modes?.map((mode) => (
              <Option key={mode} value={mode}>
                {mode}
              </Option>
            )) || (
              <>
                <Option value="pre_call">pre_call</Option>
                <Option value="post_call">post_call</Option>
              </>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="default_on"
          label="Always On"
          tooltip="If enabled, this guardrail will be applied to all requests by default"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {renderProviderSpecificFields()}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Update Guardrail
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditGuardrailForm;
