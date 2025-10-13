/**
 * TestHistoryPanel - Displays guardrail test history with filtering and analytics
 *
 * Features:
 * - View historical test results
 * - Filter by date range, guardrail type, action
 * - Display test statistics and trends
 * - Export test history data
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Text,
  Title,
  Flex,
  Grid,
  Metric,
  DateRangePicker,
  DateRangePickerValue,
  Select,
  SelectItem,
} from "@tremor/react";
import NotificationsManager from "../molecules/notifications_manager";
import {
  getGuardrailTestHistoryCall,
  getTestStatisticsCall,
} from "../networking";

interface TestHistoryPanelProps {
  guardrailId: string;
  guardrailName: string;
  guardrailType: string;
  accessToken: string | null;
}

interface TestHistoryRecord {
  test_history_id: string;
  test_id: string;
  guardrail_id?: string;
  guardrail_name: string;
  guardrail_type: string;
  test_scenario_name?: string;
  content_source: string;
  test_content_hash: string;
  test_content_preview: string;
  detected: boolean;
  action: string;
  action_reason?: string;
  assessment_details?: any;
  guardrail_coverage?: any;
  guardrail_outputs?: any;
  guardrail_usage?: any;
  duration_ms: number;
  passed_validation: boolean;
  validation_errors?: string[];
  created_at: string;
  created_by?: string;
}

interface TestStatistics {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  detection_rate: number;
  average_duration_ms: number;
  actions: Record<string, number>;
  date_range: {
    start: string;
    end: string;
  };
}

const TestHistoryPanel: React.FC<TestHistoryPanelProps> = ({
  guardrailId,
  guardrailName,
  guardrailType,
  accessToken,
}) => {
  const [history, setHistory] = useState<TestHistoryRecord[]>([]);
  const [statistics, setStatistics] = useState<TestStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TestHistoryRecord | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Load test history and statistics
  const loadHistory = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    try {
      // Load test history
      const historyData = await getGuardrailTestHistoryCall(
        accessToken,
        guardrailId,
        50,
        0
      );
      setHistory(historyData.records || []);

      // Load statistics
      const statsData = await getTestStatisticsCall(
        accessToken,
        guardrailId,
        undefined,
        30
      );
      setStatistics(statsData);
    } catch (error) {
      console.error("Failed to load test history:", error);
      NotificationsManager.error("Failed to load test history");
    } finally {
      setLoading(false);
    }
  }, [accessToken, guardrailId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Filter history by action
  const filteredHistory = React.useMemo(() => {
    if (actionFilter === "all") return history;
    return history.filter((record) => record.action === actionFilter);
  }, [history, actionFilter]);

  // Get badge color for action
  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      BLOCKED: "red",
      ANONYMIZED: "yellow",
      GUARDRAIL_INTERVENED: "orange",
      NONE: "green",
    };
    return colors[action] || "gray";
  };

  // Get badge color for detection
  const getDetectionBadgeColor = (detected: boolean): string => {
    return detected ? "red" : "green";
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Export history as JSON
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${guardrailName}-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    NotificationsManager.success("Test history exported as JSON");
  };

  // Export history as CSV
  const exportAsCSV = () => {
    const csvRows = [
      [
        "Test History ID",
        "Test ID",
        "Test Scenario",
        "Content Source",
        "Detected",
        "Action",
        "Duration (ms)",
        "Passed Validation",
        "Created At",
      ],
    ];

    filteredHistory.forEach((record) => {
      csvRows.push([
        record.test_history_id,
        record.test_id,
        record.test_scenario_name || "N/A",
        record.content_source,
        record.detected ? "Yes" : "No",
        record.action,
        record.duration_ms.toString(),
        record.passed_validation ? "Yes" : "No",
        formatDate(record.created_at),
      ]);
    });

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${guardrailName}-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    NotificationsManager.success("Test history exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <div>
          <Title>Test Statistics (Last 30 Days)</Title>
          <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-4 mt-4">
            <Card decoration="top" decorationColor="blue">
              <Text>Total Tests</Text>
              <Metric>{statistics.total_tests}</Metric>
            </Card>
            <Card decoration="top" decorationColor="green">
              <Text>Passed Tests</Text>
              <Metric>{statistics.passed_tests}</Metric>
            </Card>
            <Card decoration="top" decorationColor="red">
              <Text>Failed Tests</Text>
              <Metric>{statistics.failed_tests}</Metric>
            </Card>
            <Card decoration="top" decorationColor="orange">
              <Text>Detection Rate</Text>
              <Metric>{statistics.detection_rate.toFixed(1)}%</Metric>
            </Card>
            <Card decoration="top" decorationColor="purple">
              <Text>Avg Duration</Text>
              <Metric>{statistics.average_duration_ms.toFixed(0)}ms</Metric>
            </Card>
          </Grid>

          {/* Action Breakdown */}
          {Object.keys(statistics.actions).length > 0 && (
            <Card className="mt-4">
              <Title>Action Breakdown</Title>
              <div className="mt-4 space-y-2">
                {Object.entries(statistics.actions).map(([action, count]) => (
                  <Flex key={action} className="space-x-2">
                    <Badge color={getActionBadgeColor(action)}>{action}</Badge>
                    <Text>{count} tests</Text>
                  </Flex>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Test History Table */}
      <Card>
        <Flex className="space-x-2 mb-4" justifyContent="between">
          <div className="flex-1">
            <Title>Test History</Title>
            <Text>Recent guardrail tests for {guardrailName}</Text>
          </div>
          <div className="flex space-x-2">
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
              placeholder="Filter by action"
              className="w-48"
            >
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="ANONYMIZED">Anonymized</SelectItem>
              <SelectItem value="GUARDRAIL_INTERVENED">Intervened</SelectItem>
              <SelectItem value="NONE">None</SelectItem>
            </Select>
            <Button size="xs" onClick={exportAsJSON}>
              Export JSON
            </Button>
            <Button size="xs" onClick={exportAsCSV}>
              Export CSV
            </Button>
            <Button size="xs" onClick={loadHistory}>
              Refresh
            </Button>
          </div>
        </Flex>

        {loading ? (
          <div className="text-center py-8">
            <Text>Loading test history...</Text>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <Text>No test history found.</Text>
            <Text className="text-sm text-gray-500 mt-2">
              Run some tests to see results here.
            </Text>
          </div>
        ) : (
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Test Scenario</TableHeaderCell>
                <TableHeaderCell>Content Source</TableHeaderCell>
                <TableHeaderCell>Detected</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Validation</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.test_history_id}>
                  <TableCell>
                    <Text className="font-medium">
                      {record.test_scenario_name || "Manual Test"}
                    </Text>
                    <Text className="text-sm text-gray-500 truncate max-w-xs">
                      {record.test_content_preview}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Badge color={record.content_source === "INPUT" ? "blue" : "purple"}>
                      {record.content_source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={getDetectionBadgeColor(record.detected)}>
                      {record.detected ? "Detected" : "Clean"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={getActionBadgeColor(record.action)}>
                      {record.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text>{record.duration_ms.toFixed(1)}ms</Text>
                  </TableCell>
                  <TableCell>
                    <Badge color={record.passed_validation ? "green" : "red"}>
                      {record.passed_validation ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm">{formatDate(record.created_at)}</Text>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setSelectedRecord(record)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detailed Record View Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <Card
            className="max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex className="mb-4" justifyContent="between">
              <Title>Test Details</Title>
              <Button size="xs" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </Flex>

            <div className="space-y-4">
              <div>
                <Text className="font-semibold">Test History ID</Text>
                <Text className="text-sm font-mono">{selectedRecord.test_history_id}</Text>
              </div>

              <div>
                <Text className="font-semibold">Test Scenario</Text>
                <Text>{selectedRecord.test_scenario_name || "Manual Test"}</Text>
              </div>

              <div>
                <Text className="font-semibold">Test Content Preview</Text>
                <Text className="text-sm">{selectedRecord.test_content_preview}</Text>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="font-semibold">Content Source</Text>
                  <Badge color={selectedRecord.content_source === "INPUT" ? "blue" : "purple"}>
                    {selectedRecord.content_source}
                  </Badge>
                </div>

                <div>
                  <Text className="font-semibold">Detected</Text>
                  <Badge color={getDetectionBadgeColor(selectedRecord.detected)}>
                    {selectedRecord.detected ? "Yes" : "No"}
                  </Badge>
                </div>

                <div>
                  <Text className="font-semibold">Action</Text>
                  <Badge color={getActionBadgeColor(selectedRecord.action)}>
                    {selectedRecord.action}
                  </Badge>
                </div>

                <div>
                  <Text className="font-semibold">Duration</Text>
                  <Text>{selectedRecord.duration_ms.toFixed(1)} ms</Text>
                </div>

                <div>
                  <Text className="font-semibold">Validation</Text>
                  <Badge color={selectedRecord.passed_validation ? "green" : "red"}>
                    {selectedRecord.passed_validation ? "Passed" : "Failed"}
                  </Badge>
                </div>

                <div>
                  <Text className="font-semibold">Created At</Text>
                  <Text className="text-sm">{formatDate(selectedRecord.created_at)}</Text>
                </div>
              </div>

              {selectedRecord.action_reason && (
                <div>
                  <Text className="font-semibold">Action Reason</Text>
                  <Text className="text-sm">{selectedRecord.action_reason}</Text>
                </div>
              )}

              {selectedRecord.assessment_details && (
                <div>
                  <Text className="font-semibold">Assessment Details</Text>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(selectedRecord.assessment_details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedRecord.guardrail_coverage && (
                <div>
                  <Text className="font-semibold">Guardrail Coverage</Text>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(selectedRecord.guardrail_coverage, null, 2)}
                  </pre>
                </div>
              )}

              {selectedRecord.validation_errors &&
                selectedRecord.validation_errors.length > 0 && (
                  <div>
                    <Text className="font-semibold text-red-600">Validation Errors</Text>
                    <ul className="list-disc list-inside mt-2">
                      {selectedRecord.validation_errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestHistoryPanel;
