import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableBody,
  Text,
  Badge,
  Button,
  Title,
  Metric,
  Grid,
  Col,
} from "@tremor/react";
import {
  Modal,
  message,
  Input,
  Collapse,
  Typography,
  Button as AntButton,
  Popconfirm,
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  ToolOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  modelDiagnosticsCall,
  modelFixCall,
  modelDeleteCall,
  DiagnosticModelInfo,
  ModelDiagnosticsResponse,
} from "./networking";

const { TextArea } = Input;
const { Panel } = Collapse;
const { Paragraph, Text: AntText } = Typography;

interface ModelDiagnosticsProps {
  accessToken: string | null;
  userRole: string | null;
}

const ModelDiagnostics: React.FC<ModelDiagnosticsProps> = ({
  accessToken,
  userRole,
}) => {
  const [diagnostics, setDiagnostics] =
    useState<ModelDiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fixModalVisible, setFixModalVisible] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] =
    useState<DiagnosticModelInfo | null>(null);
  const [fixedParams, setFixedParams] = useState<string>("");
  const [fixing, setFixing] = useState<boolean>(false);

  const isAdmin = userRole === "Admin" || userRole === "Proxy Admin";

  useEffect(() => {
    if (accessToken) {
      loadDiagnostics();
    }
  }, [accessToken, loadDiagnostics]);

  const loadDiagnostics = useCallback(async () => {
    if (!accessToken) {
      message.error("No access token available");
      return;
    }

    setLoading(true);
    try {
      const result = await modelDiagnosticsCall(accessToken);
      setDiagnostics(result);

      if (result.invalid_models > 0) {
        message.warning(
          `Found ${result.invalid_models} model(s) with invalid litellm_params`
        );
      } else {
        message.success("All models have valid litellm_params!");
      }
    } catch (error: any) {
      console.error("Failed to load diagnostics:", error);
      message.error("Failed to load model diagnostics");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const handleFixClick = (model: DiagnosticModelInfo) => {
    setSelectedModel(model);
    // Pre-populate with existing params for editing
    if (model.litellm_params) {
      setFixedParams(JSON.stringify(model.litellm_params, null, 2));
    } else {
      // Provide a template
      setFixedParams(
        JSON.stringify(
          {
            model: "your-model-name",
            api_key: "os.environ/YOUR_API_KEY",
          },
          null,
          2
        )
      );
    }
    setFixModalVisible(true);
  };

  const handleFixModel = async () => {
    if (!selectedModel || !accessToken) {
      return;
    }

    // Validate JSON
    let params;
    try {
      params = JSON.parse(fixedParams);
    } catch (error) {
      message.error("Invalid JSON format. Please check your input.");
      return;
    }

    // Ensure 'model' field is present
    if (!params.model) {
      message.error("The 'model' field is required in litellm_params");
      return;
    }

    setFixing(true);
    try {
      await modelFixCall(accessToken, selectedModel.model_id, params);
      message.success(`Model ${selectedModel.model_name} fixed successfully!`);
      setFixModalVisible(false);
      setSelectedModel(null);
      setFixedParams("");
      // Reload diagnostics to show updated status
      await loadDiagnostics();
    } catch (error: any) {
      console.error("Failed to fix model:", error);
      message.error(`Failed to fix model: ${error.message || "Unknown error"}`);
    } finally {
      setFixing(false);
    }
  };

  const handleDeleteModel = async (model: DiagnosticModelInfo) => {
    if (!accessToken) {
      return;
    }

    try {
      await modelDeleteCall(accessToken, model.model_id);
      message.success(`Model ${model.model_name} deleted successfully!`);
      // Reload diagnostics to show updated list
      await loadDiagnostics();
    } catch (error: any) {
      console.error("Failed to delete model:", error);
      message.error(`Failed to delete model: ${error.message || "Unknown error"}`);
    }
  };

  const getSuggestions = (error?: string): string[] => {
    if (!error) return [];

    const suggestions: string[] = [];

    if (error.toLowerCase().includes("model") && error.toLowerCase().includes("required")) {
      suggestions.push("Add 'model' field to litellm_params (this is required)");
      suggestions.push("Example: {\"model\": \"gpt-4\", \"api_key\": \"...\"}");
    }

    if (error.toLowerCase().includes("json")) {
      suggestions.push("Fix JSON formatting in litellm_params");
      suggestions.push("Ensure the data is valid JSON, not a string representation");
    }

    if (error.toLowerCase().includes("decrypt")) {
      suggestions.push("Check encryption keys or use plain values");
      suggestions.push("Use environment variables: {\"api_key\": \"os.environ/YOUR_KEY\"}");
    }

    if (suggestions.length === 0) {
      suggestions.push("Review the error message and check the LiteLLM documentation");
      suggestions.push("Ensure all required fields are present and properly formatted");
    }

    return suggestions;
  };

  if (!accessToken) {
    return (
      <Card>
        <Text>Please log in to view model diagnostics</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title>Model Diagnostics</Title>
          <Text>
            Check and fix models with invalid litellm_params configuration
          </Text>
        </div>
        <Button
          icon={ReloadOutlined}
          onClick={loadDiagnostics}
          loading={loading}
          variant="secondary"
        >
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {diagnostics && (
        <Grid numItems={1} numItemsSm={3} className="gap-6">
          <Col>
            <Card decoration="top" decorationColor="blue">
              <Text>Total Models</Text>
              <Metric>{diagnostics.total_models}</Metric>
            </Card>
          </Col>
          <Col>
            <Card decoration="top" decorationColor="green">
              <Text>Valid Models</Text>
              <Metric>{diagnostics.valid_models}</Metric>
            </Card>
          </Col>
          <Col>
            <Card decoration="top" decorationColor={diagnostics.invalid_models > 0 ? "red" : "gray"}>
              <Text>Invalid Models</Text>
              <Metric>{diagnostics.invalid_models}</Metric>
            </Card>
          </Col>
        </Grid>
      )}

      {/* Models Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <ReloadOutlined spin className="text-2xl text-blue-500" />
            <Text className="block mt-2">Loading diagnostics...</Text>
          </div>
        ) : diagnostics && diagnostics.models.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Model Name</TableHeaderCell>
                <TableHeaderCell>Model ID</TableHeaderCell>
                <TableHeaderCell>Params Info</TableHeaderCell>
                <TableHeaderCell>Created By</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                {isAdmin && <TableHeaderCell>Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {diagnostics.models.map((model) => (
                <TableRow key={model.model_id}>
                  <TableCell>
                    {model.status === "valid" ? (
                      <Badge color="green" icon={CheckCircleOutlined}>
                        Valid
                      </Badge>
                    ) : (
                      <Badge color="red" icon={ExclamationCircleOutlined}>
                        Invalid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Text className="font-medium">{model.model_name}</Text>
                    {model.error && (
                      <div className="mt-2">
                        <Collapse
                          size="small"
                          items={[
                            {
                              key: "1",
                              label: (
                                <span className="text-red-600 flex items-center">
                                  <WarningOutlined className="mr-2" />
                                  Error Details
                                </span>
                              ),
                              children: (
                                <div className="space-y-3">
                                  <div>
                                    <AntText strong>Error:</AntText>
                                    <Paragraph className="mt-1 text-red-600">
                                      {model.error}
                                    </Paragraph>
                                  </div>
                                  <div>
                                    <AntText strong>Suggestions:</AntText>
                                    <ul className="mt-1 list-disc list-inside space-y-1">
                                      {getSuggestions(model.error).map((suggestion, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">
                                          {suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ),
                            },
                          ]}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Text className="font-mono text-xs">{model.model_id}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-xs">{model.params_info}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>{model.created_by}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>{new Date(model.created_at).toLocaleDateString()}</Text>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {model.status === "invalid" && (
                          <AntButton
                            type="primary"
                            size="small"
                            icon={<ToolOutlined />}
                            onClick={() => handleFixClick(model)}
                          >
                            Fix
                          </AntButton>
                        )}
                        {model.status === "invalid" && (
                          <Popconfirm
                            title="Delete Model"
                            description="Are you sure you want to delete this model?"
                            onConfirm={() => handleDeleteModel(model)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <AntButton
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            >
                              Delete
                            </AntButton>
                          </Popconfirm>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <CheckCircleOutlined className="text-4xl text-green-500 mb-2" />
            <Text className="block text-lg font-medium">No models found</Text>
            <Text className="block text-gray-500">
              Run diagnostics to check your models
            </Text>
          </div>
        )}
      </Card>

      {/* Fix Model Modal */}
      <Modal
        title={
          <span>
            <ToolOutlined className="mr-2" />
            Fix Model: {selectedModel?.model_name}
          </span>
        }
        open={fixModalVisible}
        onCancel={() => {
          setFixModalVisible(false);
          setSelectedModel(null);
          setFixedParams("");
        }}
        footer={[
          <AntButton
            key="cancel"
            onClick={() => {
              setFixModalVisible(false);
              setSelectedModel(null);
              setFixedParams("");
            }}
          >
            Cancel
          </AntButton>,
          <AntButton
            key="fix"
            type="primary"
            loading={fixing}
            onClick={handleFixModel}
            icon={<ToolOutlined />}
          >
            Fix Model
          </AntButton>,
        ]}
        width={700}
      >
        <div className="space-y-4">
          {selectedModel?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <Text className="font-medium text-red-800">Current Error:</Text>
              <Text className="block text-sm text-red-600 mt-1">
                {selectedModel.error}
              </Text>
            </div>
          )}

          <div>
            <Text className="font-medium block mb-2">
              Edit litellm_params (JSON):
            </Text>
            <TextArea
              value={fixedParams}
              onChange={(e) => setFixedParams(e.target.value)}
              rows={12}
              placeholder='{"model": "gpt-4", "api_key": "os.environ/OPENAI_API_KEY"}'
              className="font-mono text-sm"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <Text className="font-medium text-blue-800 block mb-2">
              Requirements:
            </Text>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Must be valid JSON format</li>
              <li>
                Must include <code className="bg-blue-100 px-1 rounded">model</code> field
              </li>
              <li>
                Use <code className="bg-blue-100 px-1 rounded">os.environ/VAR_NAME</code> for environment variables
              </li>
            </ul>
          </div>

          {selectedModel?.error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <Text className="font-medium text-yellow-800 block mb-2">
                Suggestions:
              </Text>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                {getSuggestions(selectedModel.error).map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ModelDiagnostics;
