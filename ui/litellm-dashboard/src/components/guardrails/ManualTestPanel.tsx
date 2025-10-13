import React, { useState } from "react";
import { Card, Title, Text, Badge } from "@tremor/react";
import { Form, Input, Select, Button, Spin, Alert, Collapse, Tag } from "antd";
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { testGuardrailCall } from "@/components/networking";
import NotificationsManager from "../molecules/notifications_manager";

const { TextArea } = Input;
const { Panel } = Collapse;

interface ManualTestPanelProps {
  guardrailId: string;
  accessToken: string | null;
}

interface TestResult {
  test_id: string;
  guardrail_name: string;
  test_scenario_name?: string;
  content_source: string;
  detected: boolean;
  action: string;
  assessment_details?: any[];
  guardrail_coverage?: any;
  guardrail_outputs?: any[];
  guardrail_usage?: any;
  action_reason?: string;
  duration_ms: number;
  timestamp: string;
  passed_validation: boolean;
  validation_errors: string[];
  test_content_preview: string;
}

const ManualTestPanel: React.FC<ManualTestPanelProps> = ({ guardrailId, accessToken }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTest = async (values: any) => {
    if (!accessToken) {
      NotificationsManager.error("Access token is required");
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const testRequest = {
        guardrail_id: guardrailId,
        test_content: values.test_content,
        content_source: values.content_source,
        test_scenario_name: values.test_scenario_name || undefined,
      };

      const result = await testGuardrailCall(accessToken, testRequest);
      setTestResult(result);

      if (result.detected) {
        NotificationsManager.warning(`Guardrail detected policy violations: ${result.action}`);
      } else {
        NotificationsManager.success("Content passed all guardrail checks");
      }
    } catch (error) {
      console.error("Test failed:", error);
      NotificationsManager.error("Failed to run test");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      BLOCKED: "red",
      ANONYMIZED: "orange",
      GUARDRAIL_INTERVENED: "yellow",
      NONE: "green",
    };

    return <Badge color={colorMap[action] || "gray"}>{action}</Badge>;
  };

  const getActionIcon = (action: string) => {
    if (action === "NONE") {
      return <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "20px" }} />;
    }
    return <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "20px" }} />;
  };

  const exportAsJSON = () => {
    if (!testResult) return;

    const dataStr = JSON.stringify(testResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardrail-test-${testResult.test_id}.json`;
    link.click();
    URL.revokeObjectURL(url);

    NotificationsManager.success("Test results exported as JSON");
  };

  const exportAsCSV = () => {
    if (!testResult) return;

    const csvRows = [
      ["Test ID", testResult.test_id],
      ["Guardrail Name", testResult.guardrail_name],
      ["Test Scenario", testResult.test_scenario_name || "N/A"],
      ["Content Source", testResult.content_source],
      ["Detected", testResult.detected ? "Yes" : "No"],
      ["Action", testResult.action],
      ["Action Reason", testResult.action_reason || "N/A"],
      ["Duration (ms)", testResult.duration_ms.toString()],
      ["Timestamp", testResult.timestamp],
      ["Passed Validation", testResult.passed_validation ? "Yes" : "No"],
      ["Validation Errors", testResult.validation_errors.join("; ")],
      ["Test Content Preview", testResult.test_content_preview],
    ];

    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardrail-test-${testResult.test_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    NotificationsManager.success("Test results exported as CSV");
  };

  return (
    <div className="space-y-4">
      <Card>
        <Title>Manual Test</Title>
        <Text className="text-gray-600">
          Test your guardrail with custom content to see how it will respond in real-world scenarios.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleTest}
          initialValues={{
            content_source: "INPUT",
          }}
          className="mt-4"
        >
          <Form.Item
            label="Test Scenario Name (Optional)"
            name="test_scenario_name"
            extra="Give your test a descriptive name for tracking"
          >
            <Input placeholder="e.g., PII Detection Test" />
          </Form.Item>

          <Form.Item
            label="Content Source"
            name="content_source"
            rules={[{ required: true, message: "Please select content source" }]}
            extra="INPUT tests user prompts, OUTPUT tests LLM responses"
          >
            <Select>
              <Select.Option value="INPUT">INPUT (User Prompt)</Select.Option>
              <Select.Option value="OUTPUT">OUTPUT (LLM Response)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Test Content"
            name="test_content"
            rules={[
              { required: true, message: "Please enter test content" },
              { max: 50000, message: "Content must be less than 50KB" },
            ]}
            extra="Enter the content you want to test against the guardrail"
          >
            <TextArea
              rows={8}
              placeholder="Enter text to test... (e.g., 'My SSN is 123-45-6789' or 'This contains offensive language')"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={loading}
              size="large"
              block
            >
              Run Test
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {testResult && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getActionIcon(testResult.action)}
              <div>
                <Title>Test Results</Title>
                {testResult.test_scenario_name && (
                  <Text className="text-gray-600">{testResult.test_scenario_name}</Text>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getActionBadge(testResult.action)}
              <Button icon={<DownloadOutlined />} onClick={exportAsJSON}>
                JSON
              </Button>
              <Button icon={<DownloadOutlined />} onClick={exportAsCSV}>
                CSV
              </Button>
            </div>
          </div>

          {!testResult.passed_validation && testResult.validation_errors.length > 0 && (
            <Alert
              message="Validation Errors"
              description={
                <ul className="list-disc pl-5">
                  {testResult.validation_errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              className="mb-4"
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Text className="text-gray-600 text-sm">Detected</Text>
              <div className="mt-1">
                <Tag color={testResult.detected ? "red" : "green"}>
                  {testResult.detected ? "YES" : "NO"}
                </Tag>
              </div>
            </div>

            <div>
              <Text className="text-gray-600 text-sm">Action Taken</Text>
              <div className="mt-1">
                <Tag color={testResult.action === "NONE" ? "green" : "orange"}>{testResult.action}</Tag>
              </div>
            </div>

            <div>
              <Text className="text-gray-600 text-sm">Content Source</Text>
              <div className="mt-1">
                <Tag>{testResult.content_source}</Tag>
              </div>
            </div>

            <div>
              <Text className="text-gray-600 text-sm">Duration</Text>
              <div className="mt-1">
                <Tag color="blue">{testResult.duration_ms.toFixed(2)} ms</Tag>
              </div>
            </div>
          </div>

          {testResult.action_reason && (
            <Alert
              message="Action Reason"
              description={testResult.action_reason}
              type={testResult.detected ? "warning" : "info"}
              className="mb-4"
            />
          )}

          <Collapse className="mt-4" defaultActiveKey={testResult.detected ? ["details"] : []}>
            <Panel header="Test Content Preview" key="preview">
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {testResult.test_content_preview}
              </pre>
            </Panel>

            {testResult.assessment_details && testResult.assessment_details.length > 0 && (
              <Panel header="Assessment Details" key="details">
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.assessment_details, null, 2)}
                </pre>
              </Panel>
            )}

            {testResult.guardrail_coverage && (
              <Panel header="Guardrail Coverage" key="coverage">
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.guardrail_coverage, null, 2)}
                </pre>
              </Panel>
            )}

            {testResult.guardrail_outputs && testResult.guardrail_outputs.length > 0 && (
              <Panel header="Guardrail Outputs" key="outputs">
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.guardrail_outputs, null, 2)}
                </pre>
              </Panel>
            )}

            {testResult.guardrail_usage && (
              <Panel header="API Usage" key="usage">
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.guardrail_usage, null, 2)}
                </pre>
              </Panel>
            )}

            <Panel header="Full Response" key="full">
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </Panel>
          </Collapse>
        </Card>
      )}
    </div>
  );
};

export default ManualTestPanel;
