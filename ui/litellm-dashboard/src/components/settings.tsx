import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableBody,
  Text,
  Grid,
  Button,
  TextInput,
  Switch,
  TabPanel,
  TabPanels,
  TabGroup,
  TabList,
  Tab,
  SelectItem,
  Icon,
} from "@tremor/react";

import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";

import {
  Modal,
  Typography,
  Form,
  Input,
  Select,
  Button as Button2,
} from "antd";
import NotificationsManager from "./molecules/notifications_manager";
import EmailSettings from "./email_settings";

const { Title, Paragraph } = Typography;

import {
  getCallbacksCall,
  setCallbacksCall,
  serviceHealthCheck,
  deleteCallback,
  deleteConfigFieldSetting,
} from "./networking";
import AlertingSettings from "./alerting/alerting_settings";
import FormItem from "antd/es/form/FormItem";
import {
  callback_map,
  callbackInfo,
  reverse_callback_map,
  Callbacks,
  mapDisplayToInternalNames,
  mapInternalToDisplayNames,
} from "./callback_info_helpers";
import { parseErrorMessage } from "./shared/errorUtils";
interface SettingsPageProps {
  accessToken: string | null;
  userRole: string | null;
  userID: string | null;
  premiumUser: boolean;
}

interface genericCallbackParams {
  litellm_callback_name: string; // what to send in request
  ui_callback_name: string; // what to show on UI
  litellm_callback_params: string[] | null; // known required params for this callback
}

interface AlertingVariables {
  SLACK_WEBHOOK_URL: string | null;
  LANGFUSE_PUBLIC_KEY: string | null;
  LANGFUSE_SECRET_KEY: string | null;
  LANGFUSE_HOST: string | null;
  OPENMETER_API_KEY: string | null;
}

interface AlertingObject {
  name: string;
  variables: AlertingVariables;
}

interface LitellmLoggingSettingsState {
  success_callback: string[];
  failure_callback: string[];
  callbacks: string[];
  turn_off_message_logging: boolean;
  redact_user_api_key_info: boolean;
  langfuse_default_tags: string[];
  enable_preview_features: boolean;
  json_logs: boolean;
}

const createDefaultLoggingSettings = (): LitellmLoggingSettingsState => ({
  success_callback: [],
  failure_callback: [],
  callbacks: [],
  turn_off_message_logging: false,
  redact_user_api_key_info: false,
  langfuse_default_tags: [],
  enable_preview_features: false,
  json_logs: false,
});

const normalizeLoggingSettings = (
  settings?: Record<string, any> | null
): LitellmLoggingSettingsState => {
  const normalized = createDefaultLoggingSettings();

  const toList = (value: any): string[] => {
    if (value == null) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    return [String(value)];
  };

  const toBoolean = (value: any): boolean => {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    if (value == null) {
      return false;
    }
    return Boolean(value);
  };

  if (!settings) {
    return normalized;
  }

  normalized.success_callback = toList(settings.success_callback);
  normalized.failure_callback = toList(settings.failure_callback);
  normalized.callbacks = toList(settings.callbacks);
  normalized.langfuse_default_tags = toList(settings.langfuse_default_tags);
  normalized.turn_off_message_logging = toBoolean(
    settings.turn_off_message_logging
  );
  normalized.redact_user_api_key_info = toBoolean(
    settings.redact_user_api_key_info
  );
  normalized.enable_preview_features = toBoolean(
    settings.enable_preview_features
  );
  normalized.json_logs = toBoolean(settings.json_logs);

  return normalized;
};

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
};

const LOGGING_SETTING_FIELDS: (keyof LitellmLoggingSettingsState)[] = [
  "success_callback",
  "failure_callback",
  "callbacks",
  "turn_off_message_logging",
  "redact_user_api_key_info",
  "langfuse_default_tags",
  "enable_preview_features",
  "json_logs",
];

const loggingSettingValueEquals = (
  a: LitellmLoggingSettingsState[keyof LitellmLoggingSettingsState],
  b: LitellmLoggingSettingsState[keyof LitellmLoggingSettingsState]
): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return arraysEqual(a, b);
  }
  return a === b;
};

const areLoggingSettingsEqual = (
  a: LitellmLoggingSettingsState,
  b: LitellmLoggingSettingsState
): boolean =>
  LOGGING_SETTING_FIELDS.every((field) =>
    loggingSettingValueEquals(a[field], b[field])
  );

const Settings: React.FC<SettingsPageProps> = ({
  accessToken,
  userRole,
  userID,
  premiumUser,
}) => {
  const [callbacks, setCallbacks] = useState<AlertingObject[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedCallback, setSelectedCallback] = useState<string | null>(null);
  const [catchAllWebhookURL, setCatchAllWebhookURL] = useState<string>("");
  const [alertToWebhooks, setAlertToWebhooks] = useState<
    Record<string, string>
  >({});
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  const [showAddCallbacksModal, setShowAddCallbacksModal] = useState(false);
  const [allCallbacks, setAllCallbacks] = useState<genericCallbackParams[]>([]);

  const [selectedCallbackParams, setSelectedCallbackParams] = useState<
    string[]
  >([]);

  const [litellmLoggingSettings, setLitellmLoggingSettings] = useState<
    LitellmLoggingSettingsState
  >(() => createDefaultLoggingSettings());
  const [initialLoggingSettings, setInitialLoggingSettings] = useState<
    LitellmLoggingSettingsState
  >(() => createDefaultLoggingSettings());
  const [isSavingLoggingSettings, setIsSavingLoggingSettings] = useState(false);
  const [isResettingLoggingSettings, setIsResettingLoggingSettings] =
    useState(false);

  const [showEditCallback, setShowEditCallback] = useState(false);
  const [selectedEditCallback, setSelectedEditCallback] = useState<any | null>(
    null
  );
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [callbackToDelete, setCallbackToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (showEditCallback && selectedEditCallback) {
      const normalized = Object.fromEntries(
        Object.entries(selectedEditCallback.variables || {}).map(([k, v]) => [k, v ?? ""])
      );
      editForm.setFieldsValue(normalized)
    }
  }, [showEditCallback, selectedEditCallback, editForm]);

  const handleSwitchChange = (alertName: string) => {
    if (activeAlerts.includes(alertName)) {
      setActiveAlerts(activeAlerts.filter((alert) => alert !== alertName));
    } else {
      setActiveAlerts([...activeAlerts, alertName]);
    }
  };
  const alerts_to_UI_NAME: Record<string, string> = {
    llm_exceptions: "LLM Exceptions",
    llm_too_slow: "LLM Responses Too Slow",
    llm_requests_hanging: "LLM Requests Hanging",
    budget_alerts: "Budget Alerts (API Keys, Users)",
    db_exceptions: "Database Exceptions (Read/Write)",
    daily_reports: "Weekly/Monthly Spend Reports",
    outage_alerts: "Outage Alerts",
    region_outage_alerts: "Region Outage Alerts",
  };

  const loggingSettingsChanged = !areLoggingSettingsEqual(
    litellmLoggingSettings,
    initialLoggingSettings
  );

  const callbackSelectOptions = Object.keys(callback_map).map((displayName) => ({
    label: displayName,
    value: displayName,
  }));

  const langfuseTagSuggestions = [
    "cache_hit",
    "cache_key",
    "proxy_base_url",
    "user_api_key_alias",
    "user_api_key_user_id",
    "user_api_key_user_email",
    "user_api_key_team_alias",
    "semantic-similarity",
  ].map((tag) => ({ label: tag, value: tag }));

  const fetchCallbacksData = useCallback(async () => {
    if (!accessToken || !userRole || !userID) {
      return;
    }
    try {
      const data = await getCallbacksCall(accessToken, userID, userRole);
      setCallbacks(data.callbacks || []);
      setAllCallbacks(data.available_callbacks || []);

      let router_settings = data.router_settings || {};
      if (router_settings && typeof router_settings === "object") {
        router_settings = { ...router_settings };
        if ("model_group_retry_policy" in router_settings) {
          delete router_settings["model_group_retry_policy"];
        }
      }
      setRouterSettings(router_settings);

      const alerts_data = Array.isArray(data.alerts) ? data.alerts : [];
      setAlerts(alerts_data);
      if (alerts_data.length > 0) {
        const alertInfo = alerts_data[0];
        const catchAllWebhook =
          alertInfo?.variables?.SLACK_WEBHOOK_URL ?? "";
        const activeAlertsList = Array.isArray(alertInfo?.active_alerts)
          ? alertInfo.active_alerts
          : [];
        const alertsToWebhook =
          alertInfo?.alerts_to_webhook &&
          typeof alertInfo.alerts_to_webhook === "object"
            ? alertInfo.alerts_to_webhook
            : {};

        setActiveAlerts(activeAlertsList);
        setCatchAllWebhookURL(catchAllWebhook ?? "");
        setAlertToWebhooks(alertsToWebhook);
      } else {
        setCatchAllWebhookURL("");
        setActiveAlerts([]);
        setAlertToWebhooks({});
      }

      const normalizedLogging = normalizeLoggingSettings(
        data.litellm_logging_settings
      );
      setLitellmLoggingSettings(normalizedLogging);
      setInitialLoggingSettings(
        normalizeLoggingSettings(data.litellm_logging_settings)
      );
    } catch (error) {
      NotificationsManager.fromBackend(error);
    }
  }, [accessToken, userRole, userID]);

  useEffect(() => {
    fetchCallbacksData();
  }, [fetchCallbacksData]);

  const updateLoggingSetting = <
    K extends keyof LitellmLoggingSettingsState
  >(
    field: K,
    value: LitellmLoggingSettingsState[K]
  ) => {
    setLitellmLoggingSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveLoggingSettings = async () => {
    if (!accessToken) {
      return;
    }

    const updatedFields = LOGGING_SETTING_FIELDS.filter(
      (field) =>
        !loggingSettingValueEquals(
          litellmLoggingSettings[field],
          initialLoggingSettings[field]
        )
    );

    if (updatedFields.length === 0) {
      NotificationsManager.info("No logging changes to save.");
      return;
    }

    setIsSavingLoggingSettings(true);
    try {
      const updatedLoggingSettings: Partial<LitellmLoggingSettingsState> = {};

      updatedFields.forEach((field) => {
        const value = litellmLoggingSettings[field];
        updatedLoggingSettings[field] = Array.isArray(value)
          ? [...value]
          : value;
      });

      await setCallbacksCall(accessToken, {
        litellm_settings: updatedLoggingSettings,
      });

      NotificationsManager.success("Logging settings updated successfully");
      await fetchCallbacksData();
    } catch (error) {
      NotificationsManager.fromBackend(error);
    } finally {
      setIsSavingLoggingSettings(false);
    }
  };

  const handleResetLoggingSettings = async () => {
    if (!accessToken) {
      return;
    }

    setIsResettingLoggingSettings(true);
    try {
      for (const field of LOGGING_SETTING_FIELDS) {
        try {
          await deleteConfigFieldSetting(accessToken, field, "litellm_settings", {
            suppressNotifications: true,
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message?.toLowerCase().includes("not in config")
          ) {
            continue;
          }
          throw error;
        }
      }
      NotificationsManager.success("Logging settings reset to defaults");
      await fetchCallbacksData();
    } catch (error) {
      NotificationsManager.fromBackend(error);
    } finally {
      setIsResettingLoggingSettings(false);
    }
  };

  const normalizeCallbackSelection = (values: string[]): string[] =>
    Array.from(
      new Set(
        mapDisplayToInternalNames(
          values
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        )
      )
    );

  const isAlertOn = (alertName: string) => {
    return activeAlerts && activeAlerts.includes(alertName);
  };

  const updateCallbackCall = async (formValues: Record<string, any>) => {
    if (!accessToken || !selectedEditCallback) {
      return;
    }

    const callbackName = selectedEditCallback.name;
    let payload: any = {
      environment_variables: {},
      litellm_settings: {
        success_callback: [callbackName],
      },
    };

    if (callbackName === "s3_v2") {
      const {
        s3_bucket_name,
        s3_region_name,
        s3_aws_access_key_id,
        s3_aws_secret_access_key,
        s3_path,
        s3_endpoint_url,
      } = formValues;

      payload.environment_variables = {
        AWS_ACCESS_KEY_ID: s3_aws_access_key_id,
        AWS_SECRET_ACCESS_KEY: s3_aws_secret_access_key,
      };

      payload.litellm_settings.s3_callback_params = {
        s3_bucket_name,
        s3_region_name,
        s3_aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID",
        s3_aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY",
        s3_path,
        s3_endpoint_url,
      };
    } else {
      payload.environment_variables = formValues;
    }

    try {
      await setCallbacksCall(accessToken, payload);
      NotificationsManager.success("Callback updated successfully");
      setShowEditCallback(false);
      editForm.resetFields();
      setSelectedEditCallback(null);

      // Refresh the callbacks list
      if (userID && userRole) {
        const updatedData = await getCallbacksCall(accessToken, userID, userRole);
        setCallbacks(updatedData.callbacks);
      }
    } catch (error) {
      NotificationsManager.fromBackend(error);
    }
  };

  const addNewCallbackCall = async (formValues: Record<string, any>) => {
    if (!accessToken) {
      return;
    }
    let new_callback = formValues?.callback;

    let payload: any = {
      environment_variables: {},
      litellm_settings: {
        success_callback: [new_callback],
      },
    };

    if (new_callback === "s3_v2") {
      const {
        s3_bucket_name,
        s3_region_name,
        s3_aws_access_key_id,
        s3_aws_secret_access_key,
        s3_path,
        s3_endpoint_url,
      } = formValues;

      payload.environment_variables = {
        AWS_ACCESS_KEY_ID: s3_aws_access_key_id,
        AWS_SECRET_ACCESS_KEY: s3_aws_secret_access_key,
      };

      payload.litellm_settings.s3_callback_params = {
        s3_bucket_name,
        s3_region_name,
        s3_aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID",
        s3_aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY",
        s3_path,
        s3_endpoint_url,
      };
    } else {
      payload.environment_variables = formValues;
    }

    try {
      await setCallbacksCall(accessToken, payload);
      NotificationsManager.success(`Callback ${new_callback} added successfully`);
      setShowAddCallbacksModal(false);
      addForm.resetFields();
      setSelectedCallback(null);
      setSelectedCallbackParams([]);

      // Refresh the callbacks list
      const updatedData = await getCallbacksCall(accessToken, userID || "", userRole || "");
      setCallbacks(updatedData.callbacks);
    } catch (error) {
      NotificationsManager.fromBackend(error);
    }
  };

  const handleSelectedCallbackChange = (
    callbackObject: genericCallbackParams
  ) => {
    setSelectedCallback(callbackObject.litellm_callback_name);

    if (callbackObject && callbackObject.litellm_callback_params) {
      setSelectedCallbackParams(callbackObject.litellm_callback_params);
    } else {
      setSelectedCallbackParams([]);
    }
  };

  const handleSaveAlerts = async () => {
    if (!accessToken) {
      return;
    }

    const updatedAlertToWebhooks: Record<string, string> = {};
    Object.entries(alerts_to_UI_NAME).forEach(([key, value]) => {
      const webhookInput = document.querySelector(
        `input[name="${key}"]`
      ) as HTMLInputElement;
      const newWebhookValue = webhookInput?.value || "";
      updatedAlertToWebhooks[key] = newWebhookValue;
    });

    const payload = {
      general_settings: {
        alert_to_webhook_url: updatedAlertToWebhooks,
        alert_types: activeAlerts,
      },
    };

    try {
      await setCallbacksCall(accessToken, payload);
    } catch (error) {
      NotificationsManager.fromBackend(error);
    }
    NotificationsManager.success("Alerts updated successfully");
  };
  const handleSaveChanges = (callback: any) => {
    if (!accessToken) {
      return;
    }

    const updatedVariables = Object.fromEntries(
      Object.entries(callback.variables).map(([key, value]) => [
        key,
        (document.querySelector(`input[name="${key}"]`) as HTMLInputElement)
          ?.value || value,
      ])
    );

    const payload = {
      environment_variables: updatedVariables,
      litellm_settings: {
        success_callback: [callback.name],
      },
    };

    try {
      setCallbacksCall(accessToken, payload);
    } catch (error) {
      NotificationsManager.fromBackend(error);
    }
    NotificationsManager.success("Callback updated successfully");
  };

  const handleOk = () => {
    if (!accessToken) {
      return;
    }
    // Handle form submission
    addForm.validateFields().then((values) => {
      // Call API to add the callback
      let payload;
      if (values.callback === "langfuse" || values.callback === "langfuse_otel") {
        payload = {
          environment_variables: {
            LANGFUSE_PUBLIC_KEY: values.langfusePublicKey,
            LANGFUSE_SECRET_KEY: values.langfusePrivateKey,
          },
          litellm_settings: {
            success_callback: [values.callback],
          },
        };
        setCallbacksCall(accessToken, payload);
        let newCallback: AlertingObject = {
          name: values.callback,
          variables: {
            SLACK_WEBHOOK_URL: null,
            LANGFUSE_HOST: null,
            LANGFUSE_PUBLIC_KEY: values.langfusePublicKey,
            LANGFUSE_SECRET_KEY: values.langfusePrivateKey,
            OPENMETER_API_KEY: null,
          },
        };
        // add langfuse to callbacks
        setCallbacks(callbacks ? [...callbacks, newCallback] : [newCallback]);
      } else if (values.callback === "slack") {
        payload = {
          general_settings: {
            alerting: ["slack"],
            alerting_threshold: 300,
          },
          environment_variables: {
            SLACK_WEBHOOK_URL: values.slackWebhookUrl,
          },
        };
        setCallbacksCall(accessToken, payload);

        let newCallback: AlertingObject = {
          name: values.callback,
          variables: {
            SLACK_WEBHOOK_URL: values.slackWebhookUrl,
            LANGFUSE_HOST: null,
            LANGFUSE_PUBLIC_KEY: null,
            LANGFUSE_SECRET_KEY: null,
            OPENMETER_API_KEY: null,
          },
        };
        setCallbacks(callbacks ? [...callbacks, newCallback] : [newCallback]);
      } else if (values.callback == "openmeter") {
        payload = {
          environment_variables: {
            OPENMETER_API_KEY: values.openMeterApiKey,
          },
          litellm_settings: {
            success_callback: [values.callback],
          },
        };
        setCallbacksCall(accessToken, payload);
        let newCallback: AlertingObject = {
          name: values.callback,
          variables: {
            SLACK_WEBHOOK_URL: null,
            LANGFUSE_HOST: null,
            LANGFUSE_PUBLIC_KEY: null,
            LANGFUSE_SECRET_KEY: null,
            OPENMETER_API_KEY: values.openMeterAPIKey,
          },
        };
        // add langfuse to callbacks
        setCallbacks(callbacks ? [...callbacks, newCallback] : [newCallback]);
      } else {
        payload = {
          error: "Invalid callback value",
        };
      }
      setIsModalVisible(false);
      addForm.resetFields();
      setSelectedCallback(null);
    });
  };

  const handleDeleteCallback = (callbackName: string) => {
    setCallbackToDelete(callbackName);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteCallback = async () => {
    if (!callbackToDelete || !accessToken) {
      return;
    }

    try {
      await deleteCallback(accessToken, callbackToDelete);
      NotificationsManager.success(`Callback ${callbackToDelete} deleted successfully`);

      // Refresh the callbacks list
      if (userID && userRole) {
        const data = await getCallbacksCall(accessToken, userID, userRole);
        setCallbacks(data.callbacks);
      }

      setShowDeleteConfirmModal(false);
      setCallbackToDelete(null);
    } catch (error) {
      console.error("Failed to delete callback:", error);
      NotificationsManager.fromBackend(error);
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="w-full mx-4">
      <Grid numItems={1} className="gap-2 p-8 w-full mt-2">
        <TabGroup>
          <TabList variant="line" defaultValue="1">
            <Tab value="1">Logging Callbacks</Tab>
            <Tab value="2">Alerting Types</Tab>
            <Tab value="3">Alerting Settings</Tab>
            <Tab value="4">Email Alerts</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Title level={4}>Active Logging Callbacks</Title>

              <Grid numItems={2}>
                <Card className="max-h-[50vh]">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Callback Name</TableHeaderCell>
                        {/* <TableHeaderCell>Callback Env Vars</TableHeaderCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {callbacks.map((callback, index) => (
                        <TableRow key={index} className="flex justify-between">
                          <TableCell>
                            <Text>{callback.name}</Text>
                          </TableCell>
                          <TableCell>
                            <Grid numItems={2} className="flex justify-between">
                              <Icon
                                icon={PencilAltIcon}
                                size="sm"
                                onClick={() => {
                                  setSelectedEditCallback(callback);
                                  setShowEditCallback(true);
                                }}
                              />
                              <Icon
                                icon={TrashIcon}
                                size="sm"
                                onClick={() =>
                                  handleDeleteCallback(callback.name)
                                }
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              />
                              <Button
                                onClick={async () => {
                                  try {
                                    await serviceHealthCheck(accessToken, callback.name);
                                    NotificationsManager.success("Health check triggered");
                                  } catch (error) {
                                    NotificationsManager.fromBackend(parseErrorMessage(error));
                                  }
                                }}
                                className="ml-2"
                                variant="secondary"
                              >
                                Test Callback
                              </Button>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </Grid>
              <Button
                className="mt-2"
                onClick={() => setShowAddCallbacksModal(true)}
              >
                Add Callback
              </Button>
              <Card className="mt-6 space-y-6">
                <div className="space-y-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    Global Logging Settings
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Configure callback routing and logging safeguards applied to every request.
                  </Text>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <Text className="text-sm font-medium text-gray-700">
                      Success callbacks
                    </Text>
                    <Select
                      mode="tags"
                      value={mapInternalToDisplayNames(
                        litellmLoggingSettings.success_callback
                      )}
                      onChange={(values) =>
                        updateLoggingSetting(
                          "success_callback",
                          normalizeCallbackSelection(values as string[])
                        )
                      }
                      options={callbackSelectOptions}
                      style={{ width: "100%" }}
                      placeholder="Run after successful requests"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      LiteLLM sends successful calls to these callbacks.
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm font-medium text-gray-700">
                      Failure callbacks
                    </Text>
                    <Select
                      mode="tags"
                      value={mapInternalToDisplayNames(
                        litellmLoggingSettings.failure_callback
                      )}
                      onChange={(values) =>
                        updateLoggingSetting(
                          "failure_callback",
                          normalizeCallbackSelection(values as string[])
                        )
                      }
                      options={callbackSelectOptions}
                      style={{ width: "100%" }}
                      placeholder="Run when a request fails"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      Triggered only when a request fails.
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm font-medium text-gray-700">
                      Callbacks (success & failure)
                    </Text>
                    <Select
                      mode="tags"
                      value={mapInternalToDisplayNames(
                        litellmLoggingSettings.callbacks
                      )}
                      onChange={(values) =>
                        updateLoggingSetting(
                          "callbacks",
                          normalizeCallbackSelection(values as string[])
                        )
                      }
                      options={callbackSelectOptions}
                      style={{ width: "100%" }}
                      placeholder="Run for every request"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      These callbacks run regardless of the request outcome.
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm font-medium text-gray-700">
                      Langfuse default tags
                    </Text>
                    <Select
                      mode="tags"
                      value={litellmLoggingSettings.langfuse_default_tags}
                      onChange={(values) =>
                        updateLoggingSetting(
                          "langfuse_default_tags",
                          Array.from(
                            new Set(
                              (values as string[])
                                .map((value) => value.trim())
                                .filter((value) => value.length > 0)
                            )
                          )
                        )
                      }
                      options={langfuseTagSuggestions}
                      style={{ width: "100%" }}
                      placeholder="Choose tags to send to Langfuse"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      Controls which LiteLLM metadata is forwarded as Langfuse tags.
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                    <div className="mr-4">
                      <Text className="text-sm font-medium text-gray-700">
                        Turn off message logging
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Prevent prompts and responses from being sent to logging callbacks.
                      </Text>
                    </div>
                    <Switch
                      id="toggle-turn-off-message-logging"
                      checked={litellmLoggingSettings.turn_off_message_logging}
                      onChange={() =>
                        updateLoggingSetting(
                          "turn_off_message_logging",
                          !litellmLoggingSettings.turn_off_message_logging
                        )
                      }
                    />
                  </div>
                  <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                    <div className="mr-4">
                      <Text className="text-sm font-medium text-gray-700">
                        Redact API key metadata
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Remove user API key identifiers from logs sent to callbacks.
                      </Text>
                    </div>
                    <Switch
                      id="toggle-redact-api-key"
                      checked={litellmLoggingSettings.redact_user_api_key_info}
                      onChange={() =>
                        updateLoggingSetting(
                          "redact_user_api_key_info",
                          !litellmLoggingSettings.redact_user_api_key_info
                        )
                      }
                    />
                  </div>
                  <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                    <div className="mr-4">
                      <Text className="text-sm font-medium text-gray-700">
                        Enable preview logging features
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Opt into experimental logging capabilities.
                      </Text>
                    </div>
                    <Switch
                      id="toggle-enable-preview-features"
                      checked={litellmLoggingSettings.enable_preview_features}
                      onChange={() =>
                        updateLoggingSetting(
                          "enable_preview_features",
                          !litellmLoggingSettings.enable_preview_features
                        )
                      }
                    />
                  </div>
                  <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                    <div className="mr-4">
                      <Text className="text-sm font-medium text-gray-700">
                        JSON formatted logs
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Output proxy logs in structured JSON format.
                      </Text>
                    </div>
                    <Switch
                      id="toggle-json-logs"
                      checked={litellmLoggingSettings.json_logs}
                      onChange={() =>
                        updateLoggingSetting(
                          "json_logs",
                          !litellmLoggingSettings.json_logs
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSaveLoggingSettings}
                    disabled={!loggingSettingsChanged || isSavingLoggingSettings}
                  >
                    {isSavingLoggingSettings
                      ? "Saving..."
                      : "Save Logging Settings"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleResetLoggingSettings}
                    disabled={isResettingLoggingSettings}
                  >
                    {isResettingLoggingSettings
                      ? "Resetting..."
                      : "Reset Overrides"}
                  </Button>
                </div>
              </Card>
            </TabPanel>
            <TabPanel>
              <Card>
                <Text className="my-2">
                  Alerts are only supported for Slack Webhook URLs. Get your
                  webhook urls from{" "}
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    style={{ color: "blue" }}
                  >
                    here
                  </a>
                </Text>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell></TableHeaderCell>
                      <TableHeaderCell></TableHeaderCell>
                      <TableHeaderCell>Slack Webhook URL</TableHeaderCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {Object.entries(alerts_to_UI_NAME).map(
                      ([key, value], index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {key == "region_outage_alerts" ? (
                              premiumUser ? (
                                <Switch
                                  id="switch"
                                  name="switch"
                                  checked={isAlertOn(key)}
                                  onChange={() => handleSwitchChange(key)}
                                />
                              ) : (
                                <Button className="flex items-center justify-center">
                                  <a
                                    href="https://forms.gle/W3U4PZpJGFHWtHyA9"
                                    target="_blank"
                                  >
                                    ✨ Enterprise Feature
                                  </a>
                                </Button>
                              )
                            ) : (
                              <Switch
                                id="switch"
                                name="switch"
                                checked={isAlertOn(key)}
                                onChange={() => handleSwitchChange(key)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Text>{value}</Text>
                          </TableCell>
                          <TableCell>
                            <TextInput
                              name={key}
                              type="password"
                              defaultValue={
                                alertToWebhooks && alertToWebhooks[key]
                                  ? alertToWebhooks[key]
                                  : (catchAllWebhookURL as string)
                              }
                            ></TextInput>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
                <Button size="xs" className="mt-2" onClick={handleSaveAlerts}>
                  Save Changes
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      await serviceHealthCheck(accessToken, "slack");
                      NotificationsManager.success("Alert test triggered. Test request to slack made - check logs/alerts on slack to verify");
                    } catch (error) {
                      NotificationsManager.fromBackend(parseErrorMessage(error));
                    }
                  }}
                  className="mx-2"
                >
                  Test Alerts
                </Button>
              </Card>
            </TabPanel>
            <TabPanel>
              <AlertingSettings
                accessToken={accessToken}
                premiumUser={premiumUser}
              />
            </TabPanel>
            <TabPanel>
              <EmailSettings
                accessToken={accessToken}
                premiumUser={premiumUser}
                alerts={alerts}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Grid>

      <Modal
        title="Add Logging Callback"
        visible={showAddCallbacksModal}
        width={800}
        onCancel= {() => {
          setShowAddCallbacksModal(false)
          setSelectedCallback(null);
          setSelectedCallbackParams([]);
        }}
        footer={null}
      >
        <a
          href="https://docs.litellm.ai/docs/proxy/logging"
          className="mb-8 mt-4"
          target="_blank"
          style={{ color: "blue" }}
        >
          {" "}
          LiteLLM Docs: Logging
        </a>

        <Form
          form={addForm}
          onFinish={addNewCallbackCall}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          labelAlign="left"
        >
          <>
            <FormItem
              label="Callback"
              name="callback"
              rules={[{ required: true, message: "Please select a callback" }]}
            >
              <Select
                onChange={(value) => {
                  const selectedCallback = allCallbacks[value];
                  if (selectedCallback) {
                    handleSelectedCallbackChange(selectedCallback);
                  }
                }}
              >
                {Object.entries(Callbacks).map(
                  ([callbackEnum, callbackDisplayName]) => (
                    <SelectItem
                      key={callbackDisplayName}
                      value={callback_map[callbackEnum]}
                    >
                      <div className="flex items-center space-x-2">
                        {callbackInfo[callbackDisplayName]?.logo ? (
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Image
                              src={callbackInfo[callbackDisplayName].logo}
                              alt={`${callbackEnum} logo`}
                              className="w-5 h-5"
                              width={20}
                              height={20}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {(callbackDisplayName as string)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <span>{callbackDisplayName}</span>
                      </div>
                    </SelectItem>
                  )
                )}
              </Select>
            </FormItem>

            {selectedCallbackParams &&
              selectedCallbackParams.map((param) => {
                const callbackDisplayName =
                  reverse_callback_map[selectedCallback || ''] || selectedCallback || '';
                const paramType =
                  callbackInfo[callbackDisplayName]?.dynamic_params?.[param] || 'text';
                return (
                  <FormItem
                    label={param}
                    name={param}
                    key={param}
                    rules={[
                      {
                        required: true,
                        message: "Please enter the value for " + param,
                      },
                    ]}
                  >
                    {paramType === 'password' ? <Input.Password /> : <Input />}
                  </FormItem>
                );
              })}

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <Button2 htmlType="submit">Save</Button2>
            </div>
          </>
        </Form>
      </Modal>

      <Modal
        visible={showEditCallback}
        width={800}
        title={`Edit ${selectedEditCallback?.name} Settings`}
        onCancel={() =>  {
            setShowEditCallback(false)
            setSelectedEditCallback(null);
          }}
        footer={null}
      >
        <Form
          form={editForm}
          onFinish={updateCallbackCall}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          labelAlign="left"
        >
          <>
            {selectedEditCallback &&
              selectedEditCallback.variables &&
              Object.entries(selectedEditCallback.variables).map(([param]) => {
                const callbackDisplayName = reverse_callback_map[selectedEditCallback.name] || selectedEditCallback.name;
                const paramType = callbackInfo[callbackDisplayName]?.dynamic_params?.[param] || 'text';
                return (
                  <FormItem
                    label={param}
                    name={param}
                    key={param}
                    rules={[
                      {
                        required: true,
                        message: `Please enter the value for ${param}`,
                      },
                    ]}
                  >
                    {paramType === 'password' ? <Input.Password /> : <Input />}
                  </FormItem>
                );
              })}
          </>

          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <Button2 htmlType="submit">Save</Button2>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={showDeleteConfirmModal}
        onOk={confirmDeleteCallback}
        onCancel={() => {
          setShowDeleteConfirmModal(false);
          setCallbackToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the callback - {callbackToDelete}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Settings;
