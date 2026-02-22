import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { ApplicationMetrics } from "@/components/networking";

interface ApplicationInventoryTableProps {
  loading: boolean;
  data: ApplicationMetrics[];
  expanded?: boolean;
}

const columns: ColumnsType<ApplicationMetrics> = [
  {
    title: "Name",
    dataIndex: "application_name",
    key: "application_name",
    sorter: (a, b) => a.application_name.localeCompare(b.application_name),
  },
  {
    title: "Dept",
    dataIndex: "department",
    key: "department",
    sorter: (a, b) => (a.department || "").localeCompare(b.department || ""),
  },
  {
    title: "LOB",
    dataIndex: "lob",
    key: "lob",
    sorter: (a, b) => (a.lob || "").localeCompare(b.lob || ""),
  },
  {
    title: "Status",
    dataIndex: "is_active",
    key: "is_active",
    render: (active: boolean) => (
      <Tag color={active ? "green" : "default"}>
        {active ? "Active" : "Inactive"}
      </Tag>
    ),
    sorter: (a, b) => Number(a.is_active) - Number(b.is_active),
  },
  {
    title: "Cost",
    dataIndex: "total_cost",
    key: "total_cost",
    render: (v: number) => `$${formatNumberWithCommas(v, 2)}`,
    sorter: (a, b) => a.total_cost - b.total_cost,
    defaultSortOrder: "descend",
  },
  {
    title: "Tokens",
    dataIndex: "total_tokens",
    key: "total_tokens",
    render: (v: number) => formatNumberWithCommas(v, 0, true),
    sorter: (a, b) => a.total_tokens - b.total_tokens,
  },
  {
    title: "Latency (ms)",
    dataIndex: "avg_latency_ms",
    key: "avg_latency_ms",
    render: (v: number) => formatNumberWithCommas(v, 0),
    sorter: (a, b) => a.avg_latency_ms - b.avg_latency_ms,
  },
  {
    title: "Error Rate",
    dataIndex: "error_rate",
    key: "error_rate",
    render: (v: number) => `${(v * 100).toFixed(1)}%`,
    sorter: (a, b) => a.error_rate - b.error_rate,
  },
  {
    title: "Keys",
    dataIndex: "key_count",
    key: "key_count",
    sorter: (a, b) => a.key_count - b.key_count,
  },
];

const ApplicationInventoryTable: React.FC<ApplicationInventoryTableProps> = ({
  loading,
  data,
  expanded = false,
}) => {
  if (loading) return <ChartLoader />;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm" style={{ color: "#595959" }}>
          No data available
        </p>
      </div>
    );
  }

  return (
    <Table
      className="mt-4"
      columns={columns}
      dataSource={data}
      rowKey="application_id"
      size="small"
      pagination={{ pageSize: expanded ? 25 : 10, showSizeChanger: true }}
      scroll={expanded ? { y: 500 } : undefined}
    />
  );
};

export default ApplicationInventoryTable;
