import React, { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button } from "@tremor/react";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/outline";
import { Descriptions, Tag, Spin, Divider, Typography, Alert, Collapse } from "antd";
import { Policy } from "./types";
import { Guardrail } from "../guardrails/types";
import { PipelineInfoDisplay } from "./pipeline_flow_builder";
import { getResolvedGuardrails } from "../networking";
import ContentFilterDisplay from "../guardrails/content_filter/ContentFilterDisplay";

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

/** Build a lookup map from guardrail name → Guardrail object. */
function buildGuardrailMap(guardrails: Guardrail[]): Record<string, Guardrail> {
  const map: Record<string, Guardrail> = {};
  for (const g of guardrails) {
    if (g.guardrail_name) {
      map[g.guardrail_name] = g;
    }
  }
  return map;
}

/** Transform a Guardrail's litellm_params into ContentFilterDisplay-compatible props. */
function transformGuardrailForDisplay(guardrail: Guardrail) {
  const params = guardrail.litellm_params || {};

  const patterns = (params.patterns || []).map((p: any, i: number) => ({
    id: `pattern-${i}`,
    type: p.pattern_type === "prebuilt" ? "prebuilt" as const : "custom" as const,
    name: p.pattern_name || p.name,
    display_name: p.display_name,
    pattern: p.pattern,
    action: (p.action || "BLOCK") as "BLOCK" | "MASK",
  }));

  const blockedWords = (params.blocked_words || []).map((w: any, i: number) => ({
    id: `word-${i}`,
    keyword: w.keyword,
    action: (w.action || "BLOCK") as "BLOCK" | "MASK",
    description: w.description,
  }));

  const categories = (params.categories || []).map((c: any, i: number) => ({
    id: `category-${i}`,
    category: c.category,
    display_name: c.category,
    action: (c.action || "BLOCK") as "BLOCK" | "MASK",
    severity_threshold: (c.severity_threshold || "medium") as "high" | "medium" | "low",
  }));

  return { patterns, blockedWords, categories };
}

/** Render a list of guardrail names as expandable panels (with detail) or plain tags (fallback). */
function renderGuardrailList(
  names: string[],
  guardrailMap: Record<string, Guardrail>,
  tagColor: string,
) {
  if (!names || names.length === 0) {
    return <Text type="secondary">None</Text>;
  }

  // Split into those we have detail for vs. those we don't
  const withDetail: string[] = [];
  const withoutDetail: string[] = [];
  for (const name of names) {
    const g = guardrailMap[name];
    if (g && g.litellm_params?.guardrail === "litellm_content_filter") {
      const { patterns, blockedWords, categories } = transformGuardrailForDisplay(g);
      if (patterns.length > 0 || blockedWords.length > 0 || categories.length > 0) {
        withDetail.push(name);
        continue;
      }
    }
    withoutDetail.push(name);
  }

  return (
    <div className="space-y-2">
      {/* Plain tags for guardrails without detail */}
      {withoutDetail.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {withoutDetail.map((name) => {
            const g = guardrailMap[name];
            const mode = g?.litellm_params?.mode;
            return (
              <Tag key={name} color={tagColor}>
                {name}
                {mode && <span style={{ marginLeft: 4, opacity: 0.7 }}>({mode})</span>}
              </Tag>
            );
          })}
        </div>
      )}

      {/* Expandable panels for guardrails with content filter detail */}
      {withDetail.length > 0 && (
        <Collapse
          ghost
          size="small"
          items={withDetail.map((name) => {
            const g = guardrailMap[name]!;
            const { patterns, blockedWords, categories } = transformGuardrailForDisplay(g);
            const mode = g.litellm_params?.mode;
            const description = g.guardrail_info?.description;

            // Summary counts for the header
            const counts: string[] = [];
            if (patterns.length > 0) counts.push(`${patterns.length} pattern${patterns.length !== 1 ? "s" : ""}`);
            if (categories.length > 0) counts.push(`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`);
            if (blockedWords.length > 0) counts.push(`${blockedWords.length} keyword${blockedWords.length !== 1 ? "s" : ""}`);

            return {
              key: name,
              label: (
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  {mode && <Tag color="blue">{mode}</Tag>}
                  {counts.map((c) => (
                    <Tag key={c} color="default">{c}</Tag>
                  ))}
                </div>
              ),
              children: (
                <div>
                  {description && (
                    <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                      {description}
                    </Text>
                  )}
                  <ContentFilterDisplay
                    patterns={patterns}
                    blockedWords={blockedWords}
                    categories={categories}
                    readOnly={true}
                  />
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
}

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
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            icon={ArrowLeftIcon}
            onClick={onClose}
          >
            Back to Policies
          </Button>
          {isAdmin && (
            <Button
              icon={PencilIcon}
              onClick={() => onEdit(policy)}
            >
              Edit Policy
            </Button>
          )}
        </div>

        <Title level={4}>{policy.policy_name}</Title>

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
            {policy.created_at
              ? new Date(policy.created_at).toLocaleString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {policy.updated_at
              ? new Date(policy.updated_at).toLocaleString()
              : "-"}
          </Descriptions.Item>
        </Descriptions>

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

        <Divider orientation="left">
          <Text strong>Guardrails Configuration</Text>
        </Divider>

        {resolvedGuardrails.length > 0 && (
          <Alert
            message="Resolved Guardrails"
            description={
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  Final guardrails that will be applied (including inheritance):
                </Text>
                {renderGuardrailList(resolvedGuardrails, buildGuardrailMap(availableGuardrails), "blue")}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Guardrails to Add">
            {policy.guardrails_add && policy.guardrails_add.length > 0 ? (
              renderGuardrailList(policy.guardrails_add, buildGuardrailMap(availableGuardrails), "green")
            ) : (
              <Text type="secondary">None</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Guardrails to Remove">
            <div className="flex flex-wrap gap-1">
              {policy.guardrails_remove && policy.guardrails_remove.length > 0 ? (
                policy.guardrails_remove.map((g) => (
                  <Tag key={g} color="red">
                    {g}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">None</Text>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>

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
