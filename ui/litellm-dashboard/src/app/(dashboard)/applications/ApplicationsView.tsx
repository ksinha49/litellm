"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Card, Metric, Text, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import {
  Application,
  ApplicationConfig,
  ApplicationMetrics,
  NewApplicationRequest,
  UpdateApplicationRequest,
  applicationListCall,
  applicationCreateCall,
  applicationUpdateCall,
  applicationDeleteCall,
  applicationHealthCall,
  applicationAssignKeyCall,
  applicationUnassignKeyCall,
  applicationListKeysCall,
  keyListCall,
  teamListCall,
} from "@/components/networking";
import { isAdminRole } from "@/utils/roles";
import TeamDropdown from "@/components/common_components/team_dropdown";
import type { Team } from "@/components/key_team_helpers/key_list";

const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  accessToken: string | null;
  userID: string | null;
  userRole: string | null;
  config: ApplicationConfig;
}

type TimePreset = "24h" | "7d" | "30d";

const APP_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  platform: { label: "Platform", color: "blue" },
  dev_tool: { label: "Dev Tool", color: "purple" },
  custom_integration: { label: "Custom Integration", color: "orange" },
};

// ─── Helper: format numbers ───────────────────────────────────────────────────

const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const fmtCost = (n: number) => `$${n.toFixed(4)}`;
const fmtLatency = (ms: number) => `${ms.toFixed(0)} ms`;
const fmtErrorRate = (r: number) => `${(r * 100).toFixed(1)}%`;

// ─── Main Component ───────────────────────────────────────────────────────────

const ApplicationsView: React.FC<Props> = ({
  accessToken,
  userID,
  userRole,
  config,
}) => {
  const isAdmin = isAdminRole(userRole ?? "");

  // ── Health Dashboard state ───────────────────────────────────────────────────
  const [healthData, setHealthData] = useState<ApplicationMetrics[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [timePreset, setTimePreset] = useState<TimePreset>("30d");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [deptFilter, setDeptFilter] = useState<string | undefined>(undefined);
  const [lobFilter, setLobFilter] = useState<string | undefined>(undefined);

  // ── Registry state ───────────────────────────────────────────────────────────
  const [apps, setApps] = useState<Application[]>([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [totalApps, setTotalApps] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // ── Keys modal state ─────────────────────────────────────────────────────────
  const [keysModalApp, setKeysModalApp] = useState<Application | null>(null);
  const [assignedKeys, setAssignedKeys] = useState<any[]>([]);
  const [allKeysForPicker, setAllKeysForPicker] = useState<any[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [pickKey, setPickKey] = useState<string | undefined>(undefined);
  const [assigning, setAssigning] = useState(false);
  const [pickerSearching, setPickerSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Teams state (for TeamDropdown) ───────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>([]);

  // ── Fetch health data ────────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    if (!accessToken) return;
    setHealthLoading(true);
    try {
      const now = new Date();
      const daysBack = timePreset === "24h" ? 1 : timePreset === "7d" ? 7 : 30;
      const startDt = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const params: Record<string, string> = {
        start_date: startDt.toISOString(),
        end_date: now.toISOString(),
      };
      if (typeFilter) params.application_type = typeFilter;
      if (deptFilter) params.department = deptFilter;
      if (lobFilter) params.lob = lobFilter;

      const result = await applicationHealthCall(accessToken, params as any);
      setHealthData(result.applications);
    } catch (e: any) {
      message.error(e.message ?? "Failed to load health data");
    } finally {
      setHealthLoading(false);
    }
  }, [accessToken, timePreset, typeFilter, deptFilter, lobFilter]);

  // ── Fetch registry list ──────────────────────────────────────────────────────
  const fetchApps = useCallback(async () => {
    if (!accessToken) return;
    setRegistryLoading(true);
    try {
      const result = await applicationListCall(accessToken, {
        page,
        page_size: PAGE_SIZE,
      });
      setApps(result.applications);
      setTotalApps(result.total);
    } catch (e: any) {
      message.error(e.message ?? "Failed to load applications");
    } finally {
      setRegistryLoading(false);
    }
  }, [accessToken, page]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    if (!accessToken) return;
    teamListCall(accessToken, null, userID)
      .then((data: any) => setTeams(Array.isArray(data) ? data : data.teams ?? []))
      .catch(() => {});
  }, [accessToken, userID]);

  // ── Summary numbers ───────────────────────────────────────────────────────────
  const totalTokens = healthData.reduce((s, a) => s + a.total_tokens, 0);
  const totalCost = healthData.reduce((s, a) => s + a.total_cost, 0);
  const activeApps = healthData.filter((a) => a.is_active).length;

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toLabelsRecord = (list: { key: string; value: string }[] | undefined) => {
    if (!list || list.length === 0) return undefined;
    return Object.fromEntries(list.map(({ key, value }) => [key, value]));
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setSubmitting(true);
      const payload: NewApplicationRequest = {
        application_name: values.application_name,
        application_type: values.application_type,
        department: values.department,
        lob: values.lob,
        team_id: values.team_id || undefined,
        description: values.description || undefined,
        labels: toLabelsRecord(values.labels_list),
        health_check_url: values.health_check_url || undefined,
      };
      await applicationCreateCall(accessToken!, payload);
      message.success(`Application "${payload.application_name}" created`);
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchApps();
      fetchHealth();
    } catch (e: any) {
      if (e?.errorFields) return; // validation error — antd handles display
      message.error(e.message ?? "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedApp) return;
    try {
      const values = await editForm.validateFields();
      setSubmitting(true);
      const payload: UpdateApplicationRequest = {
        application_id: selectedApp.application_id,
        application_name: values.application_name || undefined,
        application_type: values.application_type || undefined,
        department: values.department || undefined,
        lob: values.lob || undefined,
        team_id: values.team_id || undefined,
        description: values.description || undefined,
        labels: toLabelsRecord(values.labels_list),
        health_check_url: values.health_check_url || undefined,
      };
      await applicationUpdateCall(accessToken!, payload);
      message.success("Application updated");
      setEditModalOpen(false);
      fetchApps();
      fetchHealth();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e.message ?? "Failed to update application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      await applicationDeleteCall(accessToken!, selectedApp.application_id);
      message.success(`Application "${selectedApp.application_name}" deleted`);
      setDeleteModalOpen(false);
      setSelectedApp(null);
      fetchApps();
      fetchHealth();
    } catch (e: any) {
      message.error(e.message ?? "Failed to delete application");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (app: Application) => {
    setSelectedApp(app);
    editForm.setFieldsValue({
      application_name: app.application_name,
      application_type: app.application_type,
      department: app.department,
      lob: app.lob,
      team_id: app.team_id ?? undefined,
      description: app.description ?? undefined,
      health_check_url: app.health_check_url ?? undefined,
      labels_list: app.labels
        ? Object.entries(app.labels).map(([key, value]) => ({ key, value }))
        : [],
    });
    setEditModalOpen(true);
  };

  const openDelete = (app: Application) => {
    setSelectedApp(app);
    setDeleteModalOpen(true);
  };

  // ── Keys modal handlers ───────────────────────────────────────────────────────
  const openKeysModal = async (app: Application) => {
    setKeysModalApp(app);
    setKeysLoading(true);
    try {
      const [assignedRes, allRes] = await Promise.all([
        applicationListKeysCall(accessToken!, app.application_id),
        keyListCall(accessToken!, null, null, null, null, null, 1, 50),
      ]);
      setAssignedKeys(assignedRes.keys);
      setAllKeysForPicker(allRes.keys ?? []);
    } catch (e: any) {
      message.error(e.message ?? "Failed to load keys");
    } finally {
      setKeysLoading(false);
    }
  };

  const searchPickerKeys = useCallback(
    (alias: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(async () => {
        if (!accessToken) return;
        setPickerSearching(true);
        try {
          const res = await keyListCall(
            accessToken,
            null, null,
            alias.trim() || null,  // selectedKeyAlias — null means no filter
            null, null,
            1, 50,
          );
          setAllKeysForPicker(res.keys ?? []);
        } catch (e: any) {
          message.error(e.message ?? "Failed to search keys");
        } finally {
          setPickerSearching(false);
        }
      }, 300);
    },
    [accessToken],
  );

  const handleAssignKey = async () => {
    if (!keysModalApp || !pickKey) return;
    setAssigning(true);
    try {
      await applicationAssignKeyCall(accessToken!, keysModalApp.application_id, pickKey);
      message.success("Key assigned");
      setPickKey(undefined);
      const res = await applicationListKeysCall(accessToken!, keysModalApp.application_id);
      setAssignedKeys(res.keys);
    } catch (e: any) {
      message.error(e.message ?? "Failed to assign key");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignKey = async (keyToken: string) => {
    if (!keysModalApp) return;
    try {
      await applicationUnassignKeyCall(accessToken!, keysModalApp.application_id, keyToken);
      message.success("Key removed");
      setAssignedKeys((prev) => prev.filter((k) => k.token !== keyToken));
    } catch (e: any) {
      message.error(e.message ?? "Failed to remove key");
    }
  };

  // ── Health Dashboard columns ─────────────────────────────────────────────────
  const healthColumns: ColumnsType<ApplicationMetrics> = [
    {
      title: "Application",
      dataIndex: "application_name",
      key: "application_name",
      sorter: (a, b) => a.application_name.localeCompare(b.application_name),
    },
    {
      title: "Type",
      dataIndex: "application_type",
      key: "application_type",
      render: (t: string) => (
        <Tag color={APP_TYPE_LABELS[t]?.color ?? "default"}>
          {APP_TYPE_LABELS[t]?.label ?? t}
        </Tag>
      ),
    },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "LOB", dataIndex: "lob", key: "lob" },
    {
      title: "Tokens",
      dataIndex: "total_tokens",
      key: "total_tokens",
      sorter: (a, b) => a.total_tokens - b.total_tokens,
      render: fmtTokens,
    },
    {
      title: "Cost",
      dataIndex: "total_cost",
      key: "total_cost",
      sorter: (a, b) => a.total_cost - b.total_cost,
      render: fmtCost,
    },
    {
      title: "Avg Latency",
      dataIndex: "avg_latency_ms",
      key: "avg_latency_ms",
      sorter: (a, b) => a.avg_latency_ms - b.avg_latency_ms,
      render: fmtLatency,
    },
    {
      title: "Error Rate",
      dataIndex: "error_rate",
      key: "error_rate",
      sorter: (a, b) => a.error_rate - b.error_rate,
      render: fmtErrorRate,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) =>
        active ? (
          <Tooltip title="Had requests in last 24h">
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
          </Tooltip>
        ) : (
          <Tooltip title="No requests in last 24h">
            <MinusCircleOutlined style={{ color: "#bfbfbf", fontSize: 18 }} />
          </Tooltip>
        ),
    },
  ];

  // ── Registry columns ─────────────────────────────────────────────────────────
  const registryColumns: ColumnsType<Application> = [
    {
      title: "Application",
      dataIndex: "application_name",
      key: "application_name",
      sorter: (a, b) => a.application_name.localeCompare(b.application_name),
    },
    {
      title: "Type",
      dataIndex: "application_type",
      key: "application_type",
      render: (t: string) => (
        <Tag color={APP_TYPE_LABELS[t]?.color ?? "default"}>
          {APP_TYPE_LABELS[t]?.label ?? t}
        </Tag>
      ),
    },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "LOB", dataIndex: "lob", key: "lob" },
    {
      title: "Team",
      dataIndex: "team_id",
      key: "team_id",
      render: (v: string | null) => v ?? <Text className="text-gray-400">—</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (v: string | null) => v ?? "",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => new Date(v).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Health",
      key: "health_status",
      render: (_: unknown, record: Application) => {
        const status = record.health_status;
        const url = record.health_check_url;
        if (!url) return <span className="text-gray-400">—</span>;
        const checkedAt = record.last_health_check_at
          ? `Last checked: ${new Date(record.last_health_check_at).toLocaleString()}`
          : "Not yet checked";
        if (status === "healthy") {
          return (
            <Tooltip title={checkedAt}>
              <Tag color="success">Healthy</Tag>
            </Tooltip>
          );
        }
        if (status === "unhealthy") {
          return (
            <Tooltip title={checkedAt}>
              <Tag color="error">Unhealthy</Tag>
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Health check not yet run">
            <Tag color="default">Unknown</Tag>
          </Tooltip>
        );
      },
    },
    ...(isAdmin
      ? ([
          {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: Application) => (
              <Space>
                <Button
                  size="small"
                  icon={<KeyOutlined />}
                  onClick={() => openKeysModal(record)}
                  title="Manage Keys"
                />
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(record)}
                />
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => openDelete(record)}
                />
              </Space>
            ),
          },
        ] as ColumnsType<Application>)
      : []),
  ];

  // ── Form shared fields ───────────────────────────────────────────────────────
  const AppFormFields: React.FC<{ requireName?: boolean }> = ({ requireName = true }) => (
    <>
      <Form.Item
        name="application_name"
        label="Application Name"
        rules={requireName ? [{ required: true, message: "Name is required" }] : []}
      >
        <Input placeholder="e.g. CustomerBot" />
      </Form.Item>
      <Form.Item
        name="application_type"
        label="Type"
        rules={[{ required: true, message: "Type is required" }]}
      >
        <Select placeholder="Select type">
          <Option value="platform">Platform</Option>
          <Option value="dev_tool">Dev Tool</Option>
          <Option value="custom_integration">Custom Integration</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="department"
        label="Department"
        rules={[{ required: true, message: "Department is required" }]}
      >
        {config.departments.length > 0 ? (
          <Select placeholder="Select department" showSearch>
            {config.departments.map((d) => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>
        ) : (
          <Input placeholder="e.g. Engineering" />
        )}
      </Form.Item>
      <Form.Item
        name="lob"
        label="Line of Business"
        rules={[{ required: true, message: "LOB is required" }]}
      >
        {config.lines_of_business.length > 0 ? (
          <Select placeholder="Select LOB" showSearch>
            {config.lines_of_business.map((l) => (
              <Option key={l} value={l}>{l}</Option>
            ))}
          </Select>
        ) : (
          <Input placeholder="e.g. Retail" />
        )}
      </Form.Item>
      <Form.Item name="team_id" label="Team (optional)">
        <TeamDropdown teams={teams} />
      </Form.Item>
      <Form.Item name="description" label="Description (optional)">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="health_check_url" label="Health Check URL (optional)">
        <Input placeholder="https://yourapp.example.com/health" />
      </Form.Item>
      <Form.Item label="Labels (optional)">
        <Form.List name="labels_list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} className="flex mb-2" align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "key"]}
                    rules={[{ required: true, message: "Key required" }]}
                    className="mb-0"
                  >
                    <Input placeholder="key" style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true, message: "Value required" }]}
                    className="mb-0"
                  >
                    <Input placeholder="value" style={{ width: 200 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} className="text-gray-400 hover:text-red-500" />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                size="small"
              >
                Add Label
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-6 overflow-x-hidden box-border">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <p className="text-sm text-gray-500 mt-1">Register and monitor AI applications across your organization</p>
      </div>

      <TabGroup>
        <TabList>
          <Tab>Health Dashboard</Tab>
          <Tab>Registry</Tab>
        </TabList>
        <TabPanels>
          {/* ── Health Dashboard Tab ───────────────────────────────────────────── */}
          <TabPanel>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mt-4 mb-6">
              <Card>
                <Text>Total Apps</Text>
                <Metric>{healthData.length}</Metric>
              </Card>
              <Card>
                <Text>Active (24h)</Text>
                <Metric>{activeApps}</Metric>
              </Card>
              <Card>
                <Text>Total Tokens</Text>
                <Metric>{fmtTokens(totalTokens)}</Metric>
              </Card>
              <Card>
                <Text>Total Cost</Text>
                <Metric>{fmtCost(totalCost)}</Metric>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Select
                value={timePreset}
                onChange={(v) => setTimePreset(v as TimePreset)}
                style={{ width: 120 }}
              >
                <Option value="24h">Last 24h</Option>
                <Option value="7d">Last 7d</Option>
                <Option value="30d">Last 30d</Option>
              </Select>
              <Select
                placeholder="App Type"
                allowClear
                style={{ width: 180 }}
                onChange={setTypeFilter}
              >
                <Option value="platform">Platform</Option>
                <Option value="dev_tool">Dev Tool</Option>
                <Option value="custom_integration">Custom Integration</Option>
              </Select>
              {config.departments.length > 0 && (
                <Select
                  placeholder="Department"
                  allowClear
                  style={{ width: 180 }}
                  showSearch
                  onChange={setDeptFilter}
                >
                  {config.departments.map((d) => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              )}
              {config.lines_of_business.length > 0 && (
                <Select
                  placeholder="LOB"
                  allowClear
                  style={{ width: 180 }}
                  showSearch
                  onChange={setLobFilter}
                >
                  {config.lines_of_business.map((l) => <Option key={l} value={l}>{l}</Option>)}
                </Select>
              )}
              <Button icon={<ReloadOutlined />} onClick={fetchHealth} loading={healthLoading}>
                Refresh
              </Button>
            </div>

            {/* Health table */}
            <Table<ApplicationMetrics>
              dataSource={healthData}
              columns={healthColumns}
              rowKey="application_id"
              loading={healthLoading}
              pagination={false}
              size="middle"
              scroll={{ x: "max-content" }}
            />
          </TabPanel>

          {/* ── Registry Tab ──────────────────────────────────────────────────── */}
          <TabPanel>
            {/* Toolbar */}
            <div className="flex justify-between mt-4 mb-4">
              <div className="flex gap-3">
                <Button icon={<ReloadOutlined />} onClick={fetchApps} loading={registryLoading}>
                  Refresh
                </Button>
              </div>
              {isAdmin && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    createForm.resetFields();
                    setCreateModalOpen(true);
                  }}
                >
                  New Application
                </Button>
              )}
            </div>

            {/* Registry table */}
            <Table<Application>
              dataSource={apps}
              columns={registryColumns}
              rowKey="application_id"
              loading={registryLoading}
              scroll={{ x: "max-content" }}
              pagination={{
                total: totalApps,
                pageSize: PAGE_SIZE,
                current: page,
                onChange: (p) => setPage(p),
                showTotal: (total) => `${total} applications`,
              }}
              size="middle"
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <Modal
        title="New Application"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => setCreateModalOpen(false)}
        confirmLoading={submitting}
        okText="Create"
        width={540}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <AppFormFields requireName />
        </Form>
      </Modal>

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      <Modal
        title={`Edit: ${selectedApp?.application_name}`}
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitting}
        okText="Save"
        width={540}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <AppFormFields requireName={false} />
        </Form>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <Modal
        title="Delete Application"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmLoading={submitting}
        okText="Delete"
        okButtonProps={{ danger: true }}
        width={420}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedApp?.application_name}</strong>? All virtual key
          associations will be removed. This cannot be undone.
        </p>
      </Modal>

      {/* ── Keys Modal ───────────────────────────────────────────────────────── */}
      <Modal
        title={`Keys — ${keysModalApp?.application_name}`}
        open={!!keysModalApp}
        onCancel={() => {
          setKeysModalApp(null);
          setAssignedKeys([]);
          setAllKeysForPicker([]);
        }}
        footer={null}
        width={640}
      >
        {/* Assigned keys */}
        <p className="text-sm font-medium mb-2">Assigned Keys</p>
        <Table
          dataSource={assignedKeys}
          rowKey="token"
          loading={keysLoading}
          size="small"
          pagination={false}
          columns={[
            {
              title: "Alias",
              dataIndex: "key_alias",
              key: "key_alias",
              render: (v: string | null) =>
                v ?? <span className="text-gray-400">—</span>,
            },
            {
              title: "Spend",
              dataIndex: "spend",
              key: "spend",
              render: (v: number) => `$${(v ?? 0).toFixed(4)}`,
            },
            {
              title: "",
              key: "remove",
              render: (_: unknown, row: any) => (
                <Button
                  size="small"
                  danger
                  onClick={() => handleUnassignKey(row.token)}
                >
                  Remove
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: "No keys assigned yet" }}
        />

        {/* Assign a key */}
        <p className="text-sm font-medium mt-4 mb-2">Assign a Key</p>
        <Space>
          <Select
            showSearch
            placeholder="Search by alias"
            value={pickKey}
            onChange={setPickKey}
            onSearch={searchPickerKeys}
            loading={pickerSearching}
            filterOption={false}
            allowClear
            style={{ width: 380 }}
            options={allKeysForPicker
              .filter((k) => k.application_id !== keysModalApp?.application_id)
              .map((k) => ({
                value: k.token,
                label: k.key_alias ?? k.key_name ?? k.token,
              }))}
          />
          <Button
            type="primary"
            onClick={handleAssignKey}
            loading={assigning}
            disabled={!pickKey}
          >
            Assign
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default ApplicationsView;
