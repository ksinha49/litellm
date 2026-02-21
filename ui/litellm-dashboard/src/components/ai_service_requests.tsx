import React, { useState, useEffect, useCallback } from "react";
import { Text, Badge, Button, Title } from "@tremor/react";
import { Select, Tooltip, Modal, Input } from "antd";
import { DataTable } from "./view_logs/table";
import { ColumnDef } from "@tanstack/react-table";
import { getAIServiceRequests, getAIServiceRequest } from "./networking";

interface AIServiceRequest {
  request_id: string;
  service_type?: string;
  status: string;
  request_body?: Record<string, any>;
  response_body?: Record<string, any>;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

interface AIServiceRequestsProps {
  accessToken: string | null;
}

const statusColors: Record<string, string> = {
  accepted: "blue",
  processing: "orange",
  completed: "green",
  failed: "red",
};

const AIServiceRequests: React.FC<AIServiceRequestsProps> = ({ accessToken }) => {
  const [requests, setRequests] = useState<AIServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AIServiceRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openRequestDetail = useCallback(async (req: AIServiceRequest) => {
    setSelectedRequest(req);
    if (!accessToken) return;
    setDetailLoading(true);
    try {
      const fresh = await getAIServiceRequest(accessToken, req.request_id);
      setSelectedRequest(fresh);
    } catch {
      // Fall back to the row data already set above
    } finally {
      setDetailLoading(false);
    }
  }, [accessToken]);

  const loadRequests = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await getAIServiceRequests(accessToken, {
        page,
        page_size: pageSize,
        status: statusFilter,
        service_type: serviceTypeFilter,
      });
      setRequests(data.requests || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to load AI service requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, pageSize, statusFilter, serviceTypeFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadRequests]);

  const columns: ColumnDef<AIServiceRequest>[] = [
    {
      header: "Request ID",
      accessorKey: "request_id",
      cell: (info: any) => (
        <Tooltip title={info.getValue()}>
          <span
            className="font-mono text-blue-500 text-xs cursor-pointer hover:underline truncate max-w-[18ch] block"
            onClick={() => openRequestDetail(info.row.original)}
          >
            {info.getValue()?.substring(0, 12)}...
          </span>
        </Tooltip>
      ),
    },
    {
      header: "Service Type",
      accessorKey: "service_type",
      cell: (info: any) =>
        info.getValue() ? (
          <Badge color="purple">{info.getValue()}</Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <Badge color={statusColors[info.getValue()] || "gray"}>
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: (info: any) => {
        const val = info.getValue();
        if (!val) return <span className="text-gray-400">—</span>;
        return <Text>{new Date(val).toLocaleString()}</Text>;
      },
    },
    {
      header: "Updated",
      accessorKey: "updated_at",
      cell: (info: any) => {
        const val = info.getValue();
        if (!val) return <span className="text-gray-400">—</span>;
        return <Text>{new Date(val).toLocaleString()}</Text>;
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="secondary"
          onClick={() => openRequestDetail(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center gap-3">
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <Select.Option value="accepted">Accepted</Select.Option>
            <Select.Option value="processing">Processing</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="failed">Failed</Select.Option>
          </Select>
          <Input.Search
            placeholder="Filter by service type"
            allowClear
            style={{ width: 200 }}
            value={serviceTypeFilter}
            onChange={(e) => {
              const val = e.target.value || undefined;
              setServiceTypeFilter(val);
              setPage(1);
            }}
            onSearch={(val) => {
              setServiceTypeFilter(val || undefined);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button size="xs" variant="secondary" onClick={loadRequests}>
            Refresh
          </Button>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (5s)
          </label>
        </div>
      </div>

      <DataTable
        data={requests}
        columns={columns}
        renderSubComponent={() => <div></div>}
        getRowCanExpand={() => false}
        isLoading={isLoading}
        noDataMessage="No async AI service requests found"
      />

      {total > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <Text className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </Text>
          <div className="flex gap-2">
            <Button
              size="xs"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="xs"
              variant="secondary"
              disabled={page * pageSize >= total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        title="AI Service Request Detail"
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <Text className="font-medium">Request ID</Text>
              <div className="font-mono text-sm">{selectedRequest.request_id}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <Text className="font-medium">Status</Text>
                <Badge color={statusColors[selectedRequest.status] || "gray"}>
                  {selectedRequest.status}
                </Badge>
              </div>
              {selectedRequest.service_type && (
                <div>
                  <Text className="font-medium">Service Type</Text>
                  <Badge color="purple">{selectedRequest.service_type}</Badge>
                </div>
              )}
            </div>
            {selectedRequest.error && (
              <div>
                <Text className="font-medium text-red-600">Error</Text>
                <pre className="text-sm bg-red-50 p-3 rounded overflow-auto max-h-40">
                  {selectedRequest.error}
                </pre>
              </div>
            )}
            {selectedRequest.request_body && (
              <div>
                <Text className="font-medium">Request Body</Text>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(selectedRequest.request_body, null, 2)}
                </pre>
              </div>
            )}
            {selectedRequest.response_body && (
              <div>
                <Text className="font-medium">Response Body</Text>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(selectedRequest.response_body, null, 2)}
                </pre>
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              {selectedRequest.created_at && (
                <div>Created: {new Date(selectedRequest.created_at).toLocaleString()}</div>
              )}
              {selectedRequest.updated_at && (
                <div>Updated: {new Date(selectedRequest.updated_at).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIServiceRequests;
