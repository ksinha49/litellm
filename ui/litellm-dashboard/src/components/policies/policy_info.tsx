import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Badge, Button } from "@tremor/react";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/outline";
import { Descriptions, Tag, Spin, Divider, Typography, Alert, Collapse, Table } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Policy } from "./types";
import { Guardrail } from "../guardrails/types";
import { PipelineInfoDisplay } from "./pipeline_flow_builder";
import { getResolvedGuardrails } from "../networking";

const { Title, Text } = Typography;

interface PolicyInfoViewProps {
  policyId: string;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
  accessToken: string | null;
  isAdmin: boolean;
  getPolicy: (accessToken: string, policyId: string) => Promise<any>;
  availableGuardrails?: Guardrail[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGuardrailMap(guardrails: Guardrail[]): Record<string, Guardrail> {
  const map: Record<string, Guardrail> = {};
  for (const g of guardrails) {
    if (g.guardrail_name) map[g.guardrail_name] = g;
  }
  return map;
}

function transformGuardrailForDisplay(guardrail: Guardrail) {
  const params = guardrail.litellm_params || {};

  const patterns = (params.patterns || []).map((p: any, i: number) => ({
    id: `pattern-${i}`,
    type: p.pattern_type === "prebuilt" ? ("prebuilt" as const) : ("custom" as const),
    name: p.pattern_name || p.name,
    display_name: p.display_name,
    pattern: p.pattern,
    action: (p.action || "BLOCK") as string,
  }));

  const blockedWords = (params.blocked_words || []).map((w: any, i: number) => ({
    id: `word-${i}`,
    keyword: w.keyword,
    action: (w.action || "BLOCK") as string,
    description: w.description,
  }));

  const categories = (params.categories || []).map((c: any, i: number) => ({
    id: `category-${i}`,
    category: c.category,
    display_name: c.category,
    action: (c.action || "BLOCK") as string,
    severity_threshold: (c.severity_threshold || "medium") as string,
  }));

  return { patterns, blockedWords, categories };
}

function hasFilterDetail(g: Guardrail | undefined): boolean {
  if (!g || g.litellm_params?.guardrail !== "litellm_content_filter") return false;
  const { patterns, blockedWords, categories } = transformGuardrailForDisplay(g);
  return patterns.length > 0 || blockedWords.length > 0 || categories.length > 0;
}

// ---------------------------------------------------------------------------
// Read-only inline table columns (no Selects, no Delete buttons)
// ---------------------------------------------------------------------------

const patternColumns = [
  {
    title: "Type",
    dataIndex: "type",
    width: 90,
    render: (type: string) => (
      <Tag color={type === "prebuilt" ? "blue" : "green"} style={{ margin: 0 }}>
        {type === "prebuilt" ? "Prebuilt" : "Custom"}
      </Tag>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    render: (_: string, record: any) => record.display_name || record.name,
  },
  {
    title: "Regex",
    dataIndex: "pattern",
    render: (pattern: string) =>
      pattern ? (
        <Text code style={{ fontSize: 11 }}>
          {pattern.length > 50 ? pattern.substring(0, 50) + "…" : pattern}
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "Action",
    dataIndex: "action",
    width: 80,
    render: (action: string) => (
      <Tag color={action === "BLOCK" ? "red" : action === "MONITOR" ? "orange" : "blue"} style={{ margin: 0 }}>
        {action}
      </Tag>
    ),
  },
];

const categoryColumns = [
  {
    title: "Category",
    dataIndex: "display_name",
    render: (displayName: string, record: any) => (
      <div>
        <Text strong>{displayName}</Text>
        {displayName !== record.category && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.category}
            </Text>
          </div>
        )}
      </div>
    ),
  },
  {
    title: "Severity",
    dataIndex: "severity_threshold",
    width: 100,
    render: (severity: string) => {
      const colorMap: Record<string, string> = { high: "red", medium: "orange", low: "gold" };
      return <Tag color={colorMap[severity] || "default"} style={{ margin: 0 }}>{severity.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Action",
    dataIndex: "action",
    width: 80,
    render: (action: string) => (
      <Tag color={action === "BLOCK" ? "red" : action === "MONITOR" ? "orange" : "blue"} style={{ margin: 0 }}>
        {action}
      </Tag>
    ),
  },
];

const keywordColumns = [
  { title: "Keyword", dataIndex: "keyword" },
  {
    title: "Action",
    dataIndex: "action",
    width: 80,
    render: (action: string) => (
      <Tag color={action === "BLOCK" ? "red" : action === "MONITOR" ? "orange" : "blue"} style={{ margin: 0 }}>
        {action}
      </Tag>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    render: (desc: string) => desc || "—",
  },
];

// ---------------------------------------------------------------------------
// Guardrail detail section inside a Collapse panel
// ---------------------------------------------------------------------------

function GuardrailDetailContent({ guardrail }: { guardrail: Guardrail }) {
  const description = guardrail.guardrail_info?.description;
  const { patterns, blockedWords, categories } = transformGuardrailForDisplay(guardrail);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {description && <Text type="secondary">{description}</Text>}

      {categories.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
            Categories
          </Text>
          <Table
            dataSource={categories}
            columns={categoryColumns}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      {patterns.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
            Patterns
          </Text>
          <Table
            dataSource={patterns}
            columns={patternColumns}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      {blockedWords.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
            Blocked Keywords
          </Text>
          <Table
            dataSource={blockedWords}
            columns={keywordColumns}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ marginBottom: 0 }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Guardrail list renderer
// ---------------------------------------------------------------------------

function renderGuardrailSection(
  names: string[] | undefined,
  guardrailMap: Record<string, Guardrail>,
  tagColor: string,
) {
  if (!names || names.length === 0) {
    return <Text type="secondary">None</Text>;
  }

  const withDetail: string[] = [];
  const withoutDetail: string[] = [];
  for (const name of names) {
    if (hasFilterDetail(guardrailMap[name])) {
      withDetail.push(name);
    } else {
      withoutDetail.push(name);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Simple tags for non-expandable guardrails */}
      {withoutDetail.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {withoutDetail.map((name) => {
            const mode = guardrailMap[name]?.litellm_params?.mode;
            return (
              <Tag key={name} color={tagColor}>
                {name}
                {mode && (
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>· {mode}</span>
                )}
              </Tag>
            );
          })}
        </div>
      )}

      {/* Collapsible cards for content-filter guardrails */}
      {withDetail.length > 0 && (
        <Collapse
          size="small"
          expandIconPosition="start"
          items={withDetail.map((name) => {
            const g = guardrailMap[name]!;
            const { patterns, blockedWords, categories } = transformGuardrailForDisplay(g);
            const mode = g.litellm_params?.mode;

            const counts: string[] = [];
            if (patterns.length > 0)
              counts.push(`${patterns.length} pattern${patterns.length !== 1 ? "s" : ""}`);
            if (categories.length > 0)
              counts.push(`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`);
            if (blockedWords.length > 0)
              counts.push(`${blockedWords.length} keyword${blockedWords.length !== 1 ? "s" : ""}`);

            return {
              key: name,
              label: (
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  {mode && <Tag color="blue" style={{ margin: 0 }}>{mode}</Tag>}
                  {counts.map((c) => (
                    <Tag key={c} style={{ margin: 0 }}>{c}</Tag>
                  ))}
                </div>
              ),
              children: <GuardrailDetailContent guardrail={g} />,
            };
          })}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PolicyInfoView: React.FC<PolicyInfoViewProps> = ({
  policyId,
  onClose,
  onEdit,
  accessToken,
  isAdmin,
  getPolicy,
  availableGuardrails = [],
}) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedGuardrails, setResolvedGuardrails] = useState<string[]>([]);
  const [isLoadingResolved, setIsLoadingResolved] = useState(false);

  const guardrailMap = useMemo(
    () => buildGuardrailMap(availableGuardrails),
    [availableGuardrails],
  );

  const fetchPolicy = useCallback(async () => {
    if (!accessToken || !policyId) return;

    setIsLoading(true);
    try {
      const data = await getPolicy(accessToken, policyId);
      setPolicy(data);

      // Also fetch resolved guardrails
      setIsLoadingResolved(true);
      try {
        const resolvedData = await getResolvedGuardrails(accessToken, policyId);
        setResolvedGuardrails(resolvedData.resolved_guardrails || []);
      } catch (error) {
        console.error("Error fetching resolved guardrails:", error);
      } finally {
        setIsLoadingResolved(false);
      }
    } catch (error) {
      console.error("Error fetching policy:", error);
    } finally {
      setIsLoading(false);
    }
  }, [policyId, accessToken, getPolicy]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  if (!policy) {
    return (
      <Card>
        <Text type="danger">Policy not found</Text>
        <br />
        <Button onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="secondary" icon={ArrowLeftIcon} onClick={onClose}>
            Back to Policies
          </Button>
          {isAdmin && (
            <Button icon={PencilIcon} onClick={() => onEdit(policy)}>
              Edit Policy
            </Button>
          )}
        </div>

        <Title level={4}>{policy.policy_name}</Title>

        {/* Policy metadata */}
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Policy ID">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{policy.policy_id}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {policy.description || <Text type="secondary">No description</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Inherits From">
            {policy.inherit ? (
              <Badge color="blue" size="sm">{policy.inherit}</Badge>
            ) : (
              <Text type="secondary">None</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {policy.created_at ? new Date(policy.created_at).toLocaleString() : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {policy.updated_at ? new Date(policy.updated_at).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>

        {/* Pipeline (if any) */}
        {policy.pipeline && (
          <>
            <Divider orientation="left">
              <Text strong>Pipeline Flow</Text>
            </Divider>
            <Alert
              message={`Pipeline (${policy.pipeline.mode} mode, ${policy.pipeline.steps.length} step${policy.pipeline.steps.length !== 1 ? "s" : ""})`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <PipelineInfoDisplay pipeline={policy.pipeline} />
          </>
        )}

        {/* ── Guardrails Configuration ──────────────────────────── */}
        <Divider orientation="left">
          <Text strong>Guardrails Configuration</Text>
        </Divider>

        {/* Resolved guardrails — flat info banner, just tags */}
        {resolvedGuardrails.length > 0 && (
          <div
            style={{
              background: "#f0f5ff",
              border: "1px solid #d6e4ff",
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <InfoCircleOutlined style={{ color: "#1677ff", fontSize: 14 }} />
              <Text strong style={{ fontSize: 13 }}>Resolved Guardrails</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>(including inheritance)</Text>
            </div>
            <div className="flex flex-wrap gap-1">
              {resolvedGuardrails.map((name) => {
                const mode = guardrailMap[name]?.litellm_params?.mode;
                return (
                  <Tag key={name} color="blue">
                    {name}
                    {mode && <span style={{ marginLeft: 4, opacity: 0.7 }}>· {mode}</span>}
                  </Tag>
                );
              })}
            </div>
          </div>
        )}

        {/* Guardrails to Add — standalone section with collapsible cards */}
        <div>
          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
            Guardrails to Add
          </Text>
          {renderGuardrailSection(policy.guardrails_add, guardrailMap, "green")}
        </div>

        {/* Guardrails to Remove — simple red tags */}
        <div>
          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
            Guardrails to Remove
          </Text>
          {policy.guardrails_remove && policy.guardrails_remove.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {policy.guardrails_remove.map((g) => (
                <Tag key={g} color="red">{g}</Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">None</Text>
          )}
        </div>

        {/* ── Conditions ───────────────────────────────────────── */}
        <Divider orientation="left">
          <Text strong>Conditions</Text>
        </Divider>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Model Condition">
            {policy.condition?.model ? (
              <Tag color="purple">
                {typeof policy.condition.model === "string"
                  ? policy.condition.model
                  : JSON.stringify(policy.condition.model)}
              </Tag>
            ) : (
              <Text type="secondary">No model condition (applies to all models)</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
};

export default PolicyInfoView;
