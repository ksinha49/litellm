import React, { useState } from "react";
import {
  Card,
  Title,
  Text,
  Grid,
  Badge,
  Button as TremorButton,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  TextInput,
} from "@tremor/react";
import { Button, Form, Input, Switch, InputNumber, Select } from "antd";
import { updatePassThroughEndpoint, deletePassThroughEndpointsCall } from "./networking";
import { Eye, EyeOff } from "lucide-react";
import RoutePreview from "./route_preview";
import NotificationsManager from "./molecules/notifications_manager";
import PassThroughSecuritySection from "./common_components/PassThroughSecuritySection";
import PassThroughGuardrailsSection from "./common_components/PassThroughGuardrailsSection";

export interface PassThroughInfoProps {
  endpointData: PassThroughEndpoint;
  onClose: () => void;
  accessToken: string | null;
  isAdmin: boolean;
  premiumUser?: boolean;
  onEndpointUpdated?: () => void;
}

interface PassThroughEndpoint {
  id?: string;
  path: string;
  target: string;
  headers: Record<string, any>;
  include_subpath?: boolean;
  cost_per_request?: number;
  auth?: boolean;
  guardrails?: Record<string, { request_fields?: string[]; response_fields?: string[] } | null>;
  inject_metadata?: boolean;
  response_mode?: "sync" | "async";
  service_type?: string;
}

// Password field component for headers
const PasswordField: React.FC<{ value: Record<string, any> }> = ({ value }) => {
  const [showPassword, setShowPassword] = useState(false);
  const headerString = JSON.stringify(value, null, 2);

  return (
    <div className="flex items-center space-x-2">
      <pre className="font-mono text-xs bg-gray-50 p-2 rounded max-w-md overflow-auto">
        {showPassword ? headerString : "••••••••"}
      </pre>
      <button onClick={() => setShowPassword(!showPassword)} className="p-1 hover:bg-gray-100 rounded" type="button">
        {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
      </button>
    </div>
  );
};

const PassThroughInfoView: React.FC<PassThroughInfoProps> = ({
  endpointData: initialEndpointData,
  onClose,
  accessToken,
  isAdmin,
  premiumUser = false,
  onEndpointUpdated,
}) => {
  const [endpointData, setEndpointData] = useState<PassThroughEndpoint | null>(initialEndpointData);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(initialEndpointData?.auth || false);
  const [guardrails, setGuardrails] = useState<Record<string, { request_fields?: string[]; response_fields?: string[] } | null>>(
    initialEndpointData?.guardrails || {}
  );
  const [form] = Form.useForm();

  const handleEndpointUpdate = async (values: any) => {
    try {
      if (!accessToken || !endpointData?.id) return;

      // Parse headers if provided as string
      let headers = {};
      if (values.headers) {
        try {
          headers = typeof values.headers === "string" ? JSON.parse(values.headers) : values.headers;
        } catch (e) {
          NotificationsManager.fromBackend("Invalid JSON format for headers");
          return;
        }
      }

      const updateData = {
        path: endpointData.path,
        target: values.target,
        headers: headers,
        include_subpath: values.include_subpath,
        cost_per_request: values.cost_per_request,
        auth: premiumUser ? values.auth : undefined,
        guardrails: guardrails && Object.keys(guardrails).length > 0 ? guardrails : undefined,
        inject_metadata: values.inject_metadata || false,
        response_mode: values.response_mode || "sync",
        service_type: values.service_type || undefined,
      };

      await updatePassThroughEndpoint(accessToken, endpointData.id, updateData);

      // Update local state with the new values
      setEndpointData({
        ...endpointData,
        ...updateData,
      });

      setIsEditing(false);
      if (onEndpointUpdated) {
        onEndpointUpdated();
      }
    } catch (error) {
      console.error("Error updating endpoint:", error);
      NotificationsManager.fromBackend("Failed to update pass through endpoint");
    }
  };

  const handleDeleteEndpoint = async () => {
    try {
      if (!accessToken || !endpointData?.id) return;

      await deletePassThroughEndpointsCall(accessToken, endpointData.id);
      NotificationsManager.success("Pass through endpoint deleted successfully");
      onClose();
      if (onEndpointUpdated) {
        onEndpointUpdated();
      }
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      NotificationsManager.fromBackend("Failed to delete pass through endpoint");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!endpointData) {
    return <div className="p-4">Pass through endpoint not found</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button onClick={onClose} className="mb-4">
            ← Back
          </Button>
          <Title>Pass Through Endpoint: {endpointData.path}</Title>
          <Text className="text-gray-500 font-mono">{endpointData.id}</Text>
        </div>
      </div>

      <TabGroup>
        <TabList className="mb-4">
          <Tab key="overview">Overview</Tab>
          {isAdmin ? <Tab key="settings">Settings</Tab> : <></>}
        </TabList>

        <TabPanels>
          {/* Overview Panel */}
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
              <Card>
                <Text>Path</Text>
                <div className="mt-2">
                  <Title className="font-mono">{endpointData.path}</Title>
                </div>
              </Card>

              <Card>
                <Text>Target</Text>
                <div className="mt-2">
                  <Title>{endpointData.target}</Title>
                </div>
              </Card>

              <Card>
                <Text>Configuration</Text>
                <div className="mt-2 space-y-2">
                  <div>
                    <Badge color={endpointData.include_subpath ? "green" : "gray"}>
                      {endpointData.include_subpath ? "Include Subpath" : "Exact Path"}
                    </Badge>
                  </div>
                  <div>
                    <Badge color={endpointData.auth ? "blue" : "gray"}>
                      {endpointData.auth ? "Auth Required" : "No Auth"}
                    </Badge>
                  </div>
                  {endpointData.inject_metadata && (
                    <div>
                      <Badge color="green">Metadata Injection</Badge>
                    </div>
                  )}
                  <div>
                    <Badge color={endpointData.response_mode === "async" ? "orange" : "blue"}>
                      {endpointData.response_mode === "async" ? "Async" : "Sync"}
                    </Badge>
                  </div>
                  {endpointData.service_type && (
                    <div>
                      <Badge color="purple">{endpointData.service_type}</Badge>
                    </div>
                  )}
                  {endpointData.cost_per_request !== undefined && (
                    <div>
                      <Text>Cost per request: ${endpointData.cost_per_request}</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Grid>

            {/* Route Preview Section */}
            <div className="mt-6">
              <RoutePreview
                pathValue={endpointData.path}
                targetValue={endpointData.target}
                includeSubpath={endpointData.include_subpath || false}
              />
            </div>

            {endpointData.headers && Object.keys(endpointData.headers).length > 0 && (
              <Card className="mt-6">
                <div className="flex justify-between items-center">
                  <Text className="font-medium">Headers</Text>
                  <Badge color="blue">{Object.keys(endpointData.headers).length} headers configured</Badge>
                </div>
                <div className="mt-4">
                  <PasswordField value={endpointData.headers} />
                </div>
              </Card>
            )}

            {endpointData.guardrails && Object.keys(endpointData.guardrails).length > 0 && (
              <Card className="mt-6">
                <div className="flex justify-between items-center">
                  <Text className="font-medium">Guardrails</Text>
                  <Badge color="purple">{Object.keys(endpointData.guardrails).length} guardrails configured</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(endpointData.guardrails).map(([name, settings]) => (
                    <div key={name} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm">{name}</div>
                      {settings && (settings.request_fields || settings.response_fields) && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          {settings.request_fields && (
                            <div>Request fields: {settings.request_fields.join(", ")}</div>
                          )}
                          {settings.response_fields && (
                            <div>Response fields: {settings.response_fields.join(", ")}</div>
                          )}
                        </div>
                      )}
                      {!settings && <div className="text-xs text-gray-600 mt-1">Uses entire payload</div>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabPanel>

          {/* Settings Panel (only for admins) */}
          {isAdmin && (
            <TabPanel>
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <Title>Pass Through Endpoint Settings</Title>
                  <div className="space-x-2">
                    {!isEditing && (
                      <>
                        <TremorButton onClick={() => setIsEditing(true)}>Edit Settings</TremorButton>
                        <TremorButton onClick={handleDeleteEndpoint} variant="secondary" color="red">
                          Delete Endpoint
                        </TremorButton>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <Form
                    form={form}
                    onFinish={handleEndpointUpdate}
                    initialValues={{
                      target: endpointData.target,
                      headers: endpointData.headers ? JSON.stringify(endpointData.headers, null, 2) : "",
                      include_subpath: endpointData.include_subpath || false,
                      cost_per_request: endpointData.cost_per_request,
                      auth: endpointData.auth || false,
                      inject_metadata: endpointData.inject_metadata || false,
                      response_mode: endpointData.response_mode || "sync",
                      service_type: endpointData.service_type || "",
                    }}
                    layout="vertical"
                  >
                    <Form.Item
                      label="Target URL"
                      name="target"
                      rules={[{ required: true, message: "Please input a target URL" }]}
                    >
                      <TextInput placeholder="https://api.example.com" />
                    </Form.Item>

                    <Form.Item label="Headers (JSON)" name="headers">
                      <Input.TextArea
                        rows={5}
                        placeholder='{"Authorization": "Bearer your-token", "Content-Type": "application/json"}'
                      />
                    </Form.Item>

                    <Form.Item label="Include Subpath" name="include_subpath" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item label="Cost per Request" name="cost_per_request">
                      <InputNumber min={0} step={0.01} precision={2} placeholder="0.00" addonBefore="$" />
                    </Form.Item>

                    <Form.Item label="Service Type" name="service_type">
                      <TextInput placeholder="e.g., idp, redaction, entity-extraction" />
                    </Form.Item>

                    <Form.Item label="Inject LiteLLM Metadata" name="inject_metadata" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item label="Response Mode" name="response_mode">
                      <Select>
                        <Select.Option value="sync">Synchronous</Select.Option>
                        <Select.Option value="async">Asynchronous</Select.Option>
                      </Select>
                    </Form.Item>

                    <PassThroughSecuritySection
                      premiumUser={premiumUser}
                      authEnabled={authEnabled}
                      onAuthChange={(checked) => {
                        setAuthEnabled(checked);
                        form.setFieldsValue({ auth: checked });
                      }}
                    />

                    <div className="mt-4">
                      <PassThroughGuardrailsSection
                        accessToken={accessToken || ""}
                        value={guardrails}
                        onChange={setGuardrails}
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                      <TremorButton>Save Changes</TremorButton>
                    </div>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Text className="font-medium">Path</Text>
                      <div className="font-mono">{endpointData.path}</div>
                    </div>
                    <div>
                      <Text className="font-medium">Target URL</Text>
                      <div>{endpointData.target}</div>
                    </div>
                    <div>
                      <Text className="font-medium">Include Subpath</Text>
                      <Badge color={endpointData.include_subpath ? "green" : "gray"}>
                        {endpointData.include_subpath ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {endpointData.cost_per_request !== undefined && (
                      <div>
                        <Text className="font-medium">Cost per Request</Text>
                        <div>${endpointData.cost_per_request}</div>
                      </div>
                    )}
                    <div>
                      <Text className="font-medium">Authentication Required</Text>
                      <Badge color={endpointData.auth ? "green" : "gray"}>
                        {endpointData.auth ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {endpointData.service_type && (
                      <div>
                        <Text className="font-medium">Service Type</Text>
                        <div><Badge color="purple">{endpointData.service_type}</Badge></div>
                      </div>
                    )}
                    <div>
                      <Text className="font-medium">Inject Metadata</Text>
                      <Badge color={endpointData.inject_metadata ? "green" : "gray"}>
                        {endpointData.inject_metadata ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <Text className="font-medium">Response Mode</Text>
                      <Badge color={endpointData.response_mode === "async" ? "orange" : "blue"}>
                        {endpointData.response_mode === "async" ? "Async" : "Sync"}
                      </Badge>
                    </div>
                    <div>
                      <Text className="font-medium">Headers</Text>
                      {endpointData.headers && Object.keys(endpointData.headers).length > 0 ? (
                        <div className="mt-2">
                          <PasswordField value={endpointData.headers} />
                        </div>
                      ) : (
                        <div className="text-gray-500">No headers configured</div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </TabPanel>
          )}
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default PassThroughInfoView;
