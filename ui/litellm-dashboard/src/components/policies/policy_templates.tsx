import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Spin, message, Checkbox, Badge, Collapse, Tag } from "antd";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";
import { getPolicyTemplates } from "../networking";

// ---------------------------------------------------------------------------
// Guardrail definition helpers
// ---------------------------------------------------------------------------

interface GuardrailDef {
  guardrail_name: string;
  litellm_params: {
    guardrail?: string;
    mode?: string;
    patterns?: any[];
    blocked_words?: any[];
    categories?: any[];
    [key: string]: any;
  };
  guardrail_info?: { description?: string; [key: string]: any };
}

function buildDefsMap(defs?: GuardrailDef[]): Record<string, GuardrailDef> {
  const map: Record<string, GuardrailDef> = {};
  if (!defs) return map;
  for (const d of defs) {
    if (d.guardrail_name) map[d.guardrail_name] = d;
  }
  return map;
}

/** Compact summary of a guardrail's configured items. */
function GuardrailSummary({ def }: { def: GuardrailDef }) {
  const params = def.litellm_params || {};
  const description = def.guardrail_info?.description;
  const patterns: any[] = params.patterns || [];
  const keywords: any[] = params.blocked_words || [];
  const categories: any[] = params.categories || [];

  if (!description && patterns.length === 0 && keywords.length === 0 && categories.length === 0) {
    return null;
  }

  return (
    <div style={{ fontSize: 12, lineHeight: "18px", display: "flex", flexDirection: "column", gap: 4 }}>
      {description && (
        <div style={{ color: "#666", fontStyle: "italic" }}>{description}</div>
      )}
      {patterns.length > 0 && (
        <div>
          <span style={{ fontWeight: 500 }}>Patterns: </span>
          {patterns.map((p: any) => p.pattern_name || p.name).join(", ")}
          <Tag
            color={patterns[0]?.action === "BLOCK" ? "red" : patterns[0]?.action === "MONITOR" ? "orange" : "blue"}
            style={{ margin: "0 0 0 6px", fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
          >
            {patterns[0]?.action || "BLOCK"}
          </Tag>
        </div>
      )}
      {categories.length > 0 && (
        <div>
          <span style={{ fontWeight: 500 }}>Categories: </span>
          {categories.map((c: any) => c.category).join(", ")}
          <Tag
            color={categories[0]?.action === "BLOCK" ? "red" : categories[0]?.action === "MONITOR" ? "orange" : "blue"}
            style={{ margin: "0 0 0 6px", fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
          >
            {categories[0]?.action || "BLOCK"}
          </Tag>
        </div>
      )}
      {keywords.length > 0 && (
        <div>
          <span style={{ fontWeight: 500 }}>Keywords: </span>
          {keywords.map((w: any) => w.keyword).join(", ")}
          <Tag
            color={keywords[0]?.action === "BLOCK" ? "red" : keywords[0]?.action === "MONITOR" ? "orange" : "blue"}
            style={{ margin: "0 0 0 6px", fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
          >
            {keywords[0]?.action || "BLOCK"}
          </Tag>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

interface PolicyTemplateCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: string;
  iconBg: string;
  guardrails: string[];
  guardrailDefinitions?: GuardrailDef[];
  tags: string[];
  inherits?: string;
  complexity: "Low" | "Medium" | "High";
  onUseTemplate: () => void;
}

const PolicyTemplateCard: React.FC<PolicyTemplateCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  guardrails,
  guardrailDefinitions,
  tags,
  inherits,
  complexity,
  onUseTemplate,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const defsMap = useMemo(() => buildDefsMap(guardrailDefinitions), [guardrailDefinitions]);

  const getComplexityStyle = () => {
    switch (complexity) {
      case "Low":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "Medium":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "High":
        return "bg-purple-50 text-purple-600 border-purple-100";
    }
  };

  // Split guardrails into those with expandable detail and those without
  const hasAnyDefs = guardrails.some((name) => {
    const def = defsMap[name];
    if (!def) return false;
    const p = def.litellm_params || {};
    return (
      def.guardrail_info?.description ||
      (p.patterns && p.patterns.length > 0) ||
      (p.blocked_words && p.blocked_words.length > 0) ||
      (p.categories && p.categories.length > 0)
    );
  });

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      bodyStyle={{ display: "flex", flexDirection: "column" }}
    >
      {/* ── Header row: always visible ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          <span
            className={`inline-block mt-0.5 px-2 py-0 rounded-full text-xs font-medium border ${getComplexityStyle()}`}
          >
            {complexity}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button type="primary" size="small" onClick={onUseTemplate}>
            Use
          </Button>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded
              ? <ChevronUpIcon className="h-4 w-4" />
              : <ChevronDownIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Expandable body ─────────────────────────────────────── */}
      {isExpanded && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-4">{description}</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {inherits && (
            <div className="mb-4 text-xs">
              <span className="text-gray-500">Inherits from: </span>
              <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {inherits}
              </span>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
              Included Guardrails
            </span>

            {hasAnyDefs ? (
              /* Collapsible guardrails with detail */
              <Collapse
                ghost
                size="small"
                expandIconPosition="start"
                style={{ margin: "0 -12px" }}
                items={guardrails.map((name) => {
                  const def = defsMap[name];
                  const hasDetail =
                    def &&
                    (def.guardrail_info?.description ||
                      (def.litellm_params?.patterns?.length ?? 0) > 0 ||
                      (def.litellm_params?.blocked_words?.length ?? 0) > 0 ||
                      (def.litellm_params?.categories?.length ?? 0) > 0);

                  const mode = def?.litellm_params?.mode;
                  const patternCount = def?.litellm_params?.patterns?.length || 0;
                  const keywordCount = def?.litellm_params?.blocked_words?.length || 0;
                  const categoryCount = def?.litellm_params?.categories?.length || 0;

                  return {
                    key: name,
                    collapsible: hasDetail ? ("header" as const) : ("disabled" as const),
                    showArrow: !!hasDetail,
                    label: (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 500, fontSize: 12 }}>{name}</span>
                        {mode && (
                          <Tag
                            color="blue"
                            style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
                          >
                            {mode}
                          </Tag>
                        )}
                        {patternCount > 0 && (
                          <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                            {patternCount} pattern{patternCount !== 1 ? "s" : ""}
                          </Tag>
                        )}
                        {categoryCount > 0 && (
                          <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                            {categoryCount} categor{categoryCount !== 1 ? "ies" : "y"}
                          </Tag>
                        )}
                        {keywordCount > 0 && (
                          <Tag style={{ margin: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                            {keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
                          </Tag>
                        )}
                      </div>
                    ),
                    children: hasDetail && def ? <GuardrailSummary def={def} /> : null,
                  };
                })}
              />
            ) : (
              /* Flat spans fallback (no definitions available) */
              <div className="flex flex-wrap gap-2">
                {guardrails.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

interface PolicyTemplatesProps {
  onUseTemplate: (templateData: any) => void;
  accessToken: string | null;
}

// Map icon names from JSON to actual icon components
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ShieldCheckIcon: ShieldCheckIcon,
  ShieldExclamationIcon: ShieldExclamationIcon,
  BeakerIcon: BeakerIcon,
  CurrencyDollarIcon: CurrencyDollarIcon,
  CheckCircleIcon: CheckCircleIcon,
};

const PolicyTemplates: React.FC<PolicyTemplatesProps> = ({ onUseTemplate, accessToken }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Compute all unique tags with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      const tags: string[] = t.tags || [];
      tags.forEach((tag: string) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // Sort alphabetically
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [templates]);

  // Filter templates: show templates that have ALL selected tags (AND logic)
  const filteredTemplates = useMemo(() => {
    if (selectedTags.size === 0) return templates;
    return templates.filter((t) => {
      const tags: string[] = t.tags || [];
      return Array.from(selectedTags).every((selectedTag) => tags.includes(selectedTag));
    });
  }, [templates, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedTags(new Set());
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        const data = await getPolicyTemplates(accessToken);
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching policy templates:", error);
        message.error("Failed to fetch policy templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading policy templates..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Policy Templates
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Start with a pre-configured policy template to quickly set up
            guardrails for your organization.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar - tag filters */}
        {tagCounts.length > 0 && (
          <div className="w-52 flex-shrink-0">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  Categories
                </span>
                {selectedTags.size > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {tagCounts.map(([tag, count]) => (
                  <label
                    key={tag}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      selectedTags.has(tag)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTags.has(tag)}
                        onChange={() => handleTagToggle(tag)}
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right content - template cards */}
        <div className="flex-1">
          {selectedTags.size > 0 && (
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredTemplates.map((template, index) => (
              <PolicyTemplateCard
                key={template.id || index}
                title={template.title}
                description={template.description}
                icon={iconMap[template.icon] || ShieldCheckIcon}
                iconColor={template.iconColor}
                iconBg={template.iconBg}
                guardrails={template.guardrails}
                guardrailDefinitions={template.guardrailDefinitions}
                tags={template.tags || []}
                inherits={template.inherits}
                complexity={template.complexity}
                onUseTemplate={() => onUseTemplate(template)}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No templates match the selected filters.</p>
              <button
                onClick={handleClearAll}
                className="text-blue-600 hover:text-blue-800 mt-2 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyTemplates;
