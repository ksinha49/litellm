import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Text, Badge } from "@tremor/react";
import { Button, Select, Tabs, Table, Tag, Progress, Collapse, Alert, Spin } from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { getGuardrailTestScenariosCall, testGuardrailSuiteCall } from "@/components/networking";
import NotificationsManager from "../molecules/notifications_manager";

const { Panel } = Collapse;

interface TestScenario {
  scenario_id: string;
  name: string;
  description: string;
  test_content: string;
  content_source: "INPUT" | "OUTPUT";
  expected_detected: boolean;
  expected_action?: string;
  expected_entities?: string[];
  category: string;
}

interface TestSuiteResult {
  suite_id: string;
  guardrail_name: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate: number;
  test_results: any[];
  total_duration_ms: number;
  timestamp: string;
}

interface ScenarioTestPanelProps {
  guardrailId: string;
  guardrailType: string;
  accessToken: string | null;
}

const ScenarioTestPanel: React.FC<ScenarioTestPanelProps> = ({ guardrailId, guardrailType, accessToken }) => {
  const [scenarios, setScenarios] = useState<Record<string, TestScenario[]>>({});
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [runningTest, setRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestSuiteResult | null>(null);

  const fetchScenarios = useCallback(async () => {
    if (!accessToken) return;

    setLoadingScenarios(true);
    try {
      const response = await getGuardrailTestScenariosCall(accessToken, guardrailType);
      setScenarios(response.scenario_categories || {});
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
      NotificationsManager.error("Failed to load test scenarios");
    } finally {
      setLoadingScenarios(false);
    }
  }, [accessToken, guardrailType]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const getFilteredScenarios = (): TestScenario[] => {
    if (selectedCategory === "all") {
      return Object.values(scenarios).flat();
    }
    return scenarios[selectedCategory] || [];
  };

  const handleSelectAll = () => {
    const filtered = getFilteredScenarios();
    setSelectedScenarios(filtered.map((s) => s.scenario_id));
  };

  const handleDeselectAll = () => {
    setSelectedScenarios([]);
  };

  const handleRunTests = async () => {
    if (!accessToken || selectedScenarios.length === 0) {
      NotificationsManager.warning("Please select at least one test scenario");
      return;
    }

    setRunningTest(true);
    setTestResults(null);

    try {
      const allScenarios = Object.values(scenarios).flat();
      const scenariosToRun = allScenarios.filter((s) => selectedScenarios.includes(s.scenario_id));

      const suiteRequest = {
        guardrail_id: guardrailId,
        test_scenarios: scenariosToRun,
        run_parallel: false,
      };

      const result = await testGuardrailSuiteCall(accessToken, suiteRequest);
      setTestResults(result);

      if (result.pass_rate === 100) {
        NotificationsManager.success(`All ${result.total_tests} tests passed!`);
      } else {
        NotificationsManager.warning(
          `${result.passed_tests}/${result.total_tests} tests passed (${result.pass_rate.toFixed(1)}%)`
        );
      }
    } catch (error) {
      console.error("Test suite failed:", error);
      NotificationsManager.error("Failed to run test suite");
    } finally {
      setRunningTest(false);
    }
  };

  const exportSuiteAsJSON = () => {
    if (!testResults) return;

    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardrail-test-suite-${testResults.suite_id}.json`;
    link.click();
    URL.revokeObjectURL(url);

    NotificationsManager.success("Test suite results exported as JSON");
  };

  const exportSuiteAsCSV = () => {
    if (!testResults) return;

    // Header row
    const headers = [
      "Scenario Name",
      "Detected",
      "Action",
      "Duration (ms)",
      "Passed Validation",
      "Action Reason",
      "Validation Errors",
    ];

    // Data rows
    const rows = testResults.test_results.map((result: any) => [
      result.test_scenario_name || "N/A",
      result.detected ? "Yes" : "No",
      result.action,
      result.duration_ms.toString(),
      result.passed_validation ? "Yes" : "No",
      result.action_reason || "N/A",
      result.validation_errors.join("; ") || "None",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map((cell) => `"${cell}"`).join(",")),
      "", // Empty row
      `"Suite ID","${testResults.suite_id}"`,
      `"Guardrail Name","${testResults.guardrail_name}"`,
      `"Total Tests","${testResults.total_tests}"`,
      `"Passed Tests","${testResults.passed_tests}"`,
      `"Failed Tests","${testResults.failed_tests}"`,
      `"Pass Rate","${testResults.pass_rate.toFixed(2)}%"`,
      `"Total Duration (ms)","${testResults.total_duration_ms.toFixed(2)}"`,
      `"Timestamp","${testResults.timestamp}"`,
    ].join("\n");

    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guardrail-test-suite-${testResults.suite_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    NotificationsManager.success("Test suite results exported as CSV");
  };

  const categories = Object.keys(scenarios);
  const filteredScenarios = getFilteredScenarios();

  const columns = [
    {
      title: "Scenario",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TestScenario) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          pii: "blue",
          toxic_content: "red",
          prompt_injection: "orange",
          sensitive_topics: "purple",
          general: "gray",
        };
        return <Tag color={colorMap[category] || "gray"}>{category.replace("_", " ").toUpperCase()}</Tag>;
      },
    },
    {
      title: "Source",
      dataIndex: "content_source",
      key: "content_source",
      render: (source: string) => <Tag>{source}</Tag>,
    },
    {
      title: "Expected",
      dataIndex: "expected_detected",
      key: "expected_detected",
      render: (detected: boolean, record: TestScenario) => (
        <div>
          <Tag color={detected ? "red" : "green"}>{detected ? "DETECT" : "PASS"}</Tag>
          {record.expected_action && <Tag color="orange">{record.expected_action}</Tag>}
        </div>
      ),
    },
  ];

  const resultColumns = [
    {
      title: "Scenario",
      dataIndex: "test_scenario_name",
      key: "test_scenario_name",
    },
    {
      title: "Detected",
      dataIndex: "detected",
      key: "detected",
      render: (detected: boolean) => (
        <Tag color={detected ? "red" : "green"}>{detected ? "YES" : "NO"}</Tag>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const colorMap: Record<string, string> = {
          BLOCKED: "red",
          ANONYMIZED: "orange",
          GUARDRAIL_INTERVENED: "yellow",
          NONE: "green",
        };
        return <Tag color={colorMap[action] || "gray"}>{action}</Tag>;
      },
    },
    {
      title: "Duration",
      dataIndex: "duration_ms",
      key: "duration_ms",
      render: (ms: number) => `${ms.toFixed(2)}ms`,
    },
    {
      title: "Status",
      dataIndex: "passed_validation",
      key: "passed_validation",
      render: (passed: boolean) =>
        passed ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
        ),
    },
  ];

  if (loadingScenarios) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" tip="Loading test scenarios..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <Title>Predefined Test Scenarios</Title>
        <Text className="text-gray-600">
          Run recommended test scenarios to validate your guardrail configuration.
        </Text>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Text className="text-sm font-medium">Filter by Category</Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: "100%", marginTop: 8 }}
              >
                <Select.Option value="all">All Categories ({Object.values(scenarios).flat().length})</Select.Option>
                {categories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat.replace("_", " ").toUpperCase()} ({scenarios[cat].length})
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="flex gap-2 items-end">
              <Button onClick={handleSelectAll}>Select All</Button>
              <Button onClick={handleDeselectAll}>Deselect All</Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRunTests}
                loading={runningTest}
                disabled={selectedScenarios.length === 0}
              >
                Run Tests ({selectedScenarios.length})
              </Button>
            </div>
          </div>

          <Table
            dataSource={filteredScenarios}
            columns={columns}
            rowKey="scenario_id"
            pagination={{ pageSize: 10 }}
            rowSelection={{
              selectedRowKeys: selectedScenarios,
              onChange: (selectedRowKeys) => setSelectedScenarios(selectedRowKeys as string[]),
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 rounded">
                  <Text className="font-medium">Test Content:</Text>
                  <pre className="mt-2 bg-white p-3 rounded text-sm border">
                    {record.test_content}
                  </pre>
                  {record.expected_entities && record.expected_entities.length > 0 && (
                    <div className="mt-2">
                      <Text className="font-medium">Expected Entities:</Text>
                      <div className="mt-1">
                        {record.expected_entities.map((entity) => (
                          <Tag key={entity} color="blue">
                            {entity}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </Card>

      {testResults && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title>Test Suite Results</Title>
              <Text className="text-gray-600">Suite ID: {testResults.suite_id}</Text>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{testResults.pass_rate.toFixed(1)}%</div>
                <Text className="text-gray-600">Pass Rate</Text>
              </div>
              <div className="flex gap-2">
                <Button icon={<DownloadOutlined />} onClick={exportSuiteAsJSON}>
                  JSON
                </Button>
                <Button icon={<DownloadOutlined />} onClick={exportSuiteAsCSV}>
                  CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{testResults.total_tests}</div>
              <Text className="text-gray-600">Total Tests</Text>
            </div>

            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{testResults.passed_tests}</div>
              <Text className="text-gray-600">Passed</Text>
            </div>

            <div className="text-center p-4 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{testResults.failed_tests}</div>
              <Text className="text-gray-600">Failed</Text>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{testResults.total_duration_ms.toFixed(0)}ms</div>
              <Text className="text-gray-600">Total Duration</Text>
            </div>
          </div>

          <Progress
            percent={testResults.pass_rate}
            status={testResults.pass_rate === 100 ? "success" : testResults.pass_rate >= 70 ? "normal" : "exception"}
            className="mb-4"
          />

          <Table
            dataSource={testResults.test_results}
            columns={resultColumns}
            rowKey="test_id"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <Collapse>
                  <Panel header="Test Details" key="details">
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(record, null, 2)}
                    </pre>
                  </Panel>
                </Collapse>
              ),
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default ScenarioTestPanel;
