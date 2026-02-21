import { ThemeProvider } from "@/contexts/ThemeContext";
import { ExternalLinkIcon, SearchIcon } from "@heroicons/react/outline";
import { ColumnDef } from "@tanstack/react-table";
import { Button, Card, Text, Title } from "@tremor/react";
import { Modal, Select, Tabs, Tag, Tooltip } from "antd";
import { Copy, Info } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModelDataTable } from "./model_dashboard/table";
import NotificationsManager from "./molecules/notifications_manager";
import Navbar from "./navbar";
import {
  agentHubPublicModelsCall,
  getPublicModelHubInfo,
  getUiConfig,
  mcpHubPublicServersCall,
  modelHubPublicModelsCall,
} from "./networking";
import { generateCodeSnippet } from "./playground/chat_ui/CodeSnippets";
import { getEndpointType } from "./playground/chat_ui/mode_endpoint_mapping";
import { MessageType } from "./playground/chat_ui/types";
import { getProviderLogoAndName } from "./provider_info_helpers";

const { TabPane } = Tabs;

interface ModelGroupInfo {
  model_group: string;
  providers: string[];
  max_input_tokens?: number;
  max_output_tokens?: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  mode?: string;
  tpm?: number;
  rpm?: number;
  supports_parallel_function_calling: boolean;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supported_openai_params?: string[];
  health_status?: string;
  health_response_time?: number;
  health_checked_at?: string;
  [key: string]: any;
}

interface AgentCard {
  protocolVersion: string;
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities?: {
    streaming?: boolean;
    pushNotifications?: boolean;
    stateTransitionHistory?: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
  }>;
  iconUrl?: string;
  provider?: {
    organization: string;
    url: string;
  };
  documentationUrl?: string;
  [key: string]: any;
}

interface MCPServerData {
  server_id: string;
  name: string;
  alias?: string | null;
  server_name: string;
  url: string;
  transport: string;
  spec_path?: string | null;
  auth_type: string;
  mcp_info: {
    server_name: string;
    description?: string;
    mcp_server_cost_info?: any;
  };
  [key: string]: any;
}

interface PublicModelHubProps {
  accessToken?: string | null;
  isEmbedded?: boolean; // When true, hides navbar and adjusts layout for embedding in dashboard
}

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ameritas LLM";

const defaultDocsDescription =
  `Ameritas has built a centralized AI Services Hub providing every team with consistent, secure, ` +
  `and scalable access to generative AI. A unified API abstracts multiple language models while ` +
  `automatically managing authentication, budget controls, rate limits, and observability — so ` +
  `developers focus on building features, not managing infrastructure.\n\n` +
  `Across the enterprise, the hub powers document summarization, customer-service automation, ` +
  `knowledge retrieval, and model experimentation. Teams onboard new models without modifying ` +
  `existing code, while governance teams maintain full visibility into usage and cost. This shared ` +
  `platform transforms AI into an enterprise-wide capability — accelerating innovation while ` +
  `preserving compliance and operational control.`;

const PublicModelHub: React.FC<PublicModelHubProps> = ({ accessToken, isEmbedded = false }) => {
  const [modelHubData, setModelHubData] = useState<ModelGroupInfo[] | null>(null);
  const [agentHubData, setAgentHubData] = useState<AgentCard[] | null>(null);
  const [mcpHubData, setMcpHubData] = useState<MCPServerData[] | null>(null);
  const [pageTitle, setPageTitle] = useState<string>(`${appName} Gateway`);
  const [customDocsDescription, setCustomDocsDescription] = useState<string>(defaultDocsDescription);
  const [litellmVersion, setLitellmVersion] = useState<string>("");
  const [usefulLinks, setUsefulLinks] = useState<Record<string, string | { url: string; index: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [agentLoading, setAgentLoading] = useState<boolean>(true);
  const [mcpLoading, setMcpLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [agentSearchTerm, setAgentSearchTerm] = useState<string>("");
  const [mcpSearchTerm, setMcpSearchTerm] = useState<string>("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedAgentSkills, setSelectedAgentSkills] = useState<string[]>([]);
  const [selectedMcpTransports, setSelectedMcpTransports] = useState<string[]>([]);
  const [serviceStatus, setServiceStatus] = useState<string>("I'm alive! ✓");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [isMcpModalVisible, setIsMcpModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<null | ModelGroupInfo>(null);
  const [selectedAgent, setSelectedAgent] = useState<null | AgentCard>(null);
  const [selectedMcpServer, setSelectedMcpServer] = useState<null | MCPServerData>(null);
  const [proxySettings, setProxySettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>("models");

  useEffect(() => {
    const initializeAndFetch = async () => {
      // Initialize proxyBaseUrl first to ensure it includes the server root path
      try {
        await getUiConfig();
      } catch (error) {
        console.error("Failed to get UI config:", error);
        // Continue anyway - might work with default proxyBaseUrl
      }

      const fetchPublicData = async () => {
        try {
          setLoading(true);
          const _modelHubData = await modelHubPublicModelsCall();
          console.log("ModelHubData:", _modelHubData);
          setModelHubData(_modelHubData);
        } catch (error) {
          console.error("There was an error fetching the public model data", error);
          setServiceStatus("Service unavailable");
        } finally {
          setLoading(false);
        }
      };

      const fetchAgentData = async () => {
        try {
          setAgentLoading(true);
          const _agentHubData = await agentHubPublicModelsCall();
          console.log("AgentHubData:", _agentHubData);
          setAgentHubData(_agentHubData);
        } catch (error) {
          console.error("There was an error fetching the public agent data", error);
        } finally {
          setAgentLoading(false);
        }
      };

      const fetchMcpData = async () => {
        try {
          setMcpLoading(true);
          const _mcpHubData = await mcpHubPublicServersCall();
          console.log("MCPHubData:", _mcpHubData);
          setMcpHubData(_mcpHubData);
        } catch (error) {
          console.error("There was an error fetching the public MCP server data", error);
        } finally {
          setMcpLoading(false);
        }
      };

      const fetchPublicModelHubInfo = async () => {
        const publicModelHubInfo = await getPublicModelHubInfo();
        console.log("Public Model Hub Info:", publicModelHubInfo);
        setPageTitle(publicModelHubInfo.docs_title);
        setCustomDocsDescription(publicModelHubInfo.custom_docs_description || defaultDocsDescription);
        setLitellmVersion(publicModelHubInfo.litellm_version);
        setUsefulLinks(publicModelHubInfo.useful_links || {});
      };

      fetchPublicModelHubInfo();

      fetchPublicData();
      fetchAgentData();
      fetchMcpData();
    };

    initializeAndFetch();
  }, []);

  // Clear filters when filter values change to avoid confusion
  useEffect(() => {
    // This would clear selections if we had any selection functionality
    // For now, it's just for consistency with the original component
  }, [searchTerm, selectedProviders, selectedModes, selectedFeatures]);

  const getUniqueProviders = (data: ModelGroupInfo[]) => {
    const providers = new Set<string>();
    data.forEach((model) => {
      model.providers.forEach((provider) => providers.add(provider));
    });
    return Array.from(providers);
  };

  const getUniqueModes = (data: ModelGroupInfo[]) => {
    const modes = new Set<string>();
    data.forEach((model) => {
      if (model.mode) modes.add(model.mode);
    });
    return Array.from(modes);
  };

  const getUniqueFeatures = (data: ModelGroupInfo[]) => {
    const features = new Set<string>();
    data.forEach((model) => {
      // Find all properties that start with 'supports_' and are true
      Object.entries(model)
        .filter(([key, value]) => key.startsWith("supports_") && value === true)
        .forEach(([key]) => {
          // Format the feature name (remove 'supports_' prefix and convert to title case)
          const featureName = key
            .replace(/^supports_/, "")
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          features.add(featureName);
        });
    });
    return Array.from(features).sort();
  };

  const getUniqueAgentSkills = (data: AgentCard[]) => {
    const skills = new Set<string>();
    data.forEach((agent) => {
      agent.skills?.forEach((skill) => {
        skill.tags?.forEach((tag) => skills.add(tag));
      });
    });
    return Array.from(skills).sort();
  };

  const getUniqueMcpTransports = (data: MCPServerData[]) => {
    const transports = new Set<string>();
    data.forEach((server) => {
      if (server.transport) transports.add(server.transport);
    });
    return Array.from(transports).sort();
  };

  const filteredData = useMemo(() => {
    if (!modelHubData || !Array.isArray(modelHubData)) return [];

    let searchResults = modelHubData;

    // Apply search if there's a search term
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const searchWords = lowercaseSearch.split(/\s+/);

      // First, try flexible matching that handles different separators
      const exactMatches = modelHubData.filter((model) => {
        const modelName = model.model_group.toLowerCase();

        // Check if it contains the exact search term
        if (modelName.includes(lowercaseSearch)) {
          return true;
        }

        // Check if it contains all search words (handles spaces vs slashes/dashes)
        return searchWords.every((word) => modelName.includes(word));
      });

      // If we have exact matches, rank them by relevance
      if (exactMatches.length > 0) {
        searchResults = exactMatches.sort((a, b) => {
          const aName = a.model_group.toLowerCase();
          const bName = b.model_group.toLowerCase();

          // Calculate relevance scores
          const aExactMatch = aName === lowercaseSearch ? 1000 : 0;
          const bExactMatch = bName === lowercaseSearch ? 1000 : 0;

          const aStartsWith = aName.startsWith(lowercaseSearch) ? 100 : 0;
          const bStartsWith = bName.startsWith(lowercaseSearch) ? 100 : 0;

          const aContainsWords = lowercaseSearch.split(/\s+/).every((word) => aName.includes(word)) ? 50 : 0;
          const bContainsWords = lowercaseSearch.split(/\s+/).every((word) => bName.includes(word)) ? 50 : 0;

          const aLength = aName.length;
          const bLength = bName.length;

          const aScore = aExactMatch + aStartsWith + aContainsWords + (1000 - aLength);
          const bScore = bExactMatch + bStartsWith + bContainsWords + (1000 - bLength);

          return bScore - aScore; // Higher score first
        });
      }
    }

    // Apply other filters
    return searchResults.filter((model) => {
      const matchesProvider =
        selectedProviders.length === 0 || selectedProviders.some((provider) => model.providers?.includes(provider));
      const matchesMode = selectedModes.length === 0 || selectedModes.includes(model.mode || "");

      // Check if model has any of the selected features
      const matchesFeature =
        selectedFeatures.length === 0 ||
        Object.entries(model)
          .filter(([key, value]) => key.startsWith("supports_") && value === true)
          .some(([key]) => {
            const featureName = key
              .replace(/^supports_/, "")
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            return selectedFeatures.includes(featureName);
          });

      return matchesProvider && matchesMode && matchesFeature;
    });
  }, [modelHubData, searchTerm, selectedProviders, selectedModes, selectedFeatures]);

  const filteredAgentData = useMemo(() => {
    if (!agentHubData || !Array.isArray(agentHubData)) return [];

    let searchResults = agentHubData;

    // Apply search if there's a search term
    if (agentSearchTerm.trim()) {
      const lowercaseSearch = agentSearchTerm.toLowerCase();
      const searchWords = lowercaseSearch.split(/\s+/);

      searchResults = agentHubData.filter((agent) => {
        const agentName = agent.name.toLowerCase();
        const agentDescription = agent.description.toLowerCase();

        // Check if it contains the exact search term
        if (agentName.includes(lowercaseSearch) || agentDescription.includes(lowercaseSearch)) {
          return true;
        }

        // Check if it contains all search words
        return searchWords.every((word) => agentName.includes(word) || agentDescription.includes(word));
      });

      // Sort by relevance
      searchResults = searchResults.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aExactMatch = aName === lowercaseSearch ? 1000 : 0;
        const bExactMatch = bName === lowercaseSearch ? 1000 : 0;

        const aStartsWith = aName.startsWith(lowercaseSearch) ? 100 : 0;
        const bStartsWith = bName.startsWith(lowercaseSearch) ? 100 : 0;

        const aScore = aExactMatch + aStartsWith + (1000 - aName.length);
        const bScore = bExactMatch + bStartsWith + (1000 - bName.length);

        return bScore - aScore;
      });
    }

    // Apply skill filters
    return searchResults.filter((agent) => {
      const matchesSkill =
        selectedAgentSkills.length === 0 ||
        agent.skills?.some((skill) => skill.tags?.some((tag) => selectedAgentSkills.includes(tag)));

      return matchesSkill;
    });
  }, [agentHubData, agentSearchTerm, selectedAgentSkills]);

  const filteredMcpData = useMemo(() => {
    if (!mcpHubData || !Array.isArray(mcpHubData)) return [];

    let searchResults = mcpHubData;

    // Apply search if there's a search term
    if (mcpSearchTerm.trim()) {
      const lowercaseSearch = mcpSearchTerm.toLowerCase();
      const searchWords = lowercaseSearch.split(/\s+/);

      searchResults = mcpHubData.filter((server) => {
        const serverName = server.server_name.toLowerCase();
        const serverDescription = (server.mcp_info?.description || "").toLowerCase();

        // Check if it contains the exact search term
        if (serverName.includes(lowercaseSearch) || serverDescription.includes(lowercaseSearch)) {
          return true;
        }

        // Check if it contains all search words
        return searchWords.every((word) => serverName.includes(word) || serverDescription.includes(word));
      });

      // Sort by relevance
      searchResults = searchResults.sort((a, b) => {
        const aName = a.server_name.toLowerCase();
        const bName = b.server_name.toLowerCase();

        const aExactMatch = aName === lowercaseSearch ? 1000 : 0;
        const bExactMatch = bName === lowercaseSearch ? 1000 : 0;

        const aStartsWith = aName.startsWith(lowercaseSearch) ? 100 : 0;
        const bStartsWith = bName.startsWith(lowercaseSearch) ? 100 : 0;

        const aScore = aExactMatch + aStartsWith + (1000 - aName.length);
        const bScore = bExactMatch + bStartsWith + (1000 - bName.length);

        return bScore - aScore;
      });
    }

    // Apply transport filters
    return searchResults.filter((server) => {
      const matchesTransport = selectedMcpTransports.length === 0 || selectedMcpTransports.includes(server.transport);

      return matchesTransport;
    });
  }, [mcpHubData, mcpSearchTerm, selectedMcpTransports]);

  const showModal = (model: ModelGroupInfo) => {
    setSelectedModel(model);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    setSelectedModel(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedModel(null);
  };

  const showAgentModal = (agent: AgentCard) => {
    setSelectedAgent(agent);
    setIsAgentModalVisible(true);
  };

  const handleAgentModalOk = () => {
    setIsAgentModalVisible(false);
    setSelectedAgent(null);
  };

  const handleAgentModalCancel = () => {
    setIsAgentModalVisible(false);
    setSelectedAgent(null);
  };

  const showMcpModal = (server: MCPServerData) => {
    setSelectedMcpServer(server);
    setIsMcpModalVisible(true);
  };

  const handleMcpModalOk = () => {
    setIsMcpModalVisible(false);
    setSelectedMcpServer(null);
  };

  const handleMcpModalCancel = () => {
    setIsMcpModalVisible(false);
    setSelectedMcpServer(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    NotificationsManager.success("Copied to clipboard!");
  };

  const formatCapabilityName = (key: string) => {
    return key
      .replace(/^supports_/, "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getModelCapabilities = (model: ModelGroupInfo) => {
    return Object.entries(model)
      .filter(([key, value]) => key.startsWith("supports_") && value === true)
      .map(([key]) => key);
  };

  const formatCost = (cost: number) => {
    return `$${(cost * 1_000_000).toFixed(4)}`;
  };

  const formatTokens = (tokens: number | undefined) => {
    if (!tokens) return "N/A";
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  const formatLimits = (rpm?: number, tpm?: number) => {
    const limits = [];
    if (rpm) limits.push(`RPM: ${rpm.toLocaleString()}`);
    if (tpm) limits.push(`TPM: ${tpm.toLocaleString()}`);
    return limits.length > 0 ? limits.join(", ") : "N/A";
  };

  const publicModelHubColumns = (): ColumnDef<ModelGroupInfo>[] => [
    {
      header: "Model Name",
      accessorKey: "model_group",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="overflow-hidden">
          <Tooltip title={row.original.model_group}>
            <Button
              size="xs"
              variant="light"
              className="font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left"
              onClick={() => showModal(row.original)}
            >
              {row.original.model_group}
            </Button>
          </Tooltip>
        </div>
      ),
      size: 150,
    },
    {
      header: "Providers",
      accessorKey: "providers",
      enableSorting: true,
      cell: ({ row }) => {
        const providers = row.original.providers;

        return (
          <div className="flex flex-wrap gap-1">
            {providers.map((provider) => {
              const { logo } = getProviderLogoAndName(provider);
              return (
                <div key={provider} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {logo && (
                    <img
                      src={logo}
                      alt={provider}
                      className="w-3 h-3 flex-shrink-0 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="capitalize">{provider}</span>
                </div>
              );
            })}
          </div>
        );
      },
      size: 120,
    },
    {
      header: "Mode",
      accessorKey: "mode",
      enableSorting: true,
      cell: ({ row }) => {
        const mode = row.original.mode;
        const getModeIcon = (mode: string) => {
          switch (mode?.toLowerCase()) {
            case "chat":
              return "💬";
            case "rerank":
              return "🔄";
            case "embedding":
              return "📄";
            default:
              return "🤖";
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <span>{getModeIcon(mode || "")}</span>
            <Text>{mode || "Chat"}</Text>
          </div>
        );
      },
      size: 100,
    },
    {
      header: "Max Input",
      accessorKey: "max_input_tokens",
      enableSorting: true,
      cell: ({ row }) => <Text className="text-center">{formatTokens(row.original.max_input_tokens)}</Text>,
      size: 100,
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Max Output",
      accessorKey: "max_output_tokens",
      enableSorting: true,
      cell: ({ row }) => <Text className="text-center">{formatTokens(row.original.max_output_tokens)}</Text>,
      size: 100,
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Input $/1M",
      accessorKey: "input_cost_per_token",
      enableSorting: true,
      cell: ({ row }) => {
        const cost = row.original.input_cost_per_token;
        return <Text className="text-center">{cost ? formatCost(cost) : "Free"}</Text>;
      },
      size: 100,
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Output $/1M",
      accessorKey: "output_cost_per_token",
      enableSorting: true,
      cell: ({ row }) => {
        const cost = row.original.output_cost_per_token;
        return <Text className="text-center">{cost ? formatCost(cost) : "Free"}</Text>;
      },
      size: 100,
      meta: {
        className: "text-center",
      },
    },
    {
      header: "Features",
      accessorKey: "supports_vision",
      enableSorting: false,
      cell: ({ row }) => {
        const model = row.original;

        // Dynamically get all features that start with 'supports_' and are true
        const features = Object.entries(model)
          .filter(([key, value]) => key.startsWith("supports_") && value === true)
          .map(([key]) => formatCapabilityName(key));

        if (features.length === 0) {
          return <Text className="text-gray-400">-</Text>;
        }

        if (features.length === 1) {
          return (
            <div className="h-6 flex items-center">
              <Tag color="blue" className="text-xs">
                {features[0]}
              </Tag>
            </div>
          );
        }

        return (
          <div className="h-6 flex items-center space-x-1">
            <Tag color="blue" className="text-xs">
              {features[0]}
            </Tag>
            <Tooltip
              title={
                <div className="space-y-1">
                  <div className="font-medium">All Features:</div>
                  {features.map((feature, index) => (
                    <div key={index} className="text-xs">
                      • {feature}
                    </div>
                  ))}
                </div>
              }
              trigger="click"
              placement="topLeft"
            >
              <span
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                +{features.length - 1}
              </span>
            </Tooltip>
          </div>
        );
      },
      size: 120,
    },
    {
      header: "Health Status",
      accessorKey: "health_status",
      enableSorting: true,
      cell: ({ row }) => {
        const original = row.original;
        const tagColor =
          original.health_status === "healthy" ? "green" : original.health_status === "unhealthy" ? "red" : "default";
        const responseTimeLabel = original.health_response_time
          ? `Response Time: ${Number(original.health_response_time).toFixed(2)}ms`
          : "N/A";
        const lastCheckedLabel = original.health_checked_at
          ? `Last Checked: ${new Date(original.health_checked_at).toLocaleString()}`
          : "N/A";

        return (
          <Tooltip
            title={
              <>
                <div>{responseTimeLabel}</div>
                <div>{lastCheckedLabel}</div>
              </>
            }
          >
            <Tag key={original.model_group} color={tagColor}>
              <span className="capitalize">{original.health_status ?? "Unknown"}</span>
            </Tag>
          </Tooltip>
        );
      },
      size: 100,
    },
    {
      header: "Limits",
      accessorKey: "rpm",
      enableSorting: true,
      cell: ({ row }) => {
        const model = row.original;
        return <Text className="text-xs text-gray-600">{formatLimits(model.rpm, model.tpm)}</Text>;
      },
      size: 150,
    },
  ];

  const publicAgentHubColumns = (): ColumnDef<AgentCard>[] => [
    {
      header: "Agent Name",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="overflow-hidden">
          <Tooltip title={row.original.name}>
            <Button
              size="xs"
              variant="light"
              className="font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left"
              onClick={() => showAgentModal(row.original)}
            >
              {row.original.name}
            </Button>
          </Tooltip>
        </div>
      ),
      size: 150,
    },
    {
      header: "Description",
      accessorKey: "description",
      enableSorting: false,
      cell: ({ row }) => {
        const description = row.original.description;
        const truncated = description.length > 80 ? description.substring(0, 80) + "..." : description;
        return (
          <Tooltip title={description}>
            <Text className="text-sm text-gray-700">{truncated}</Text>
          </Tooltip>
        );
      },
      size: 250,
    },
    {
      header: "Version",
      accessorKey: "version",
      enableSorting: true,
      cell: ({ row }) => <Text className="text-sm">{row.original.version}</Text>,
      size: 80,
    },
    {
      header: "Provider",
      accessorKey: "provider",
      enableSorting: false,
      cell: ({ row }) => {
        const provider = row.original.provider;
        if (!provider) return <Text className="text-gray-400">-</Text>;
        return (
          <div className="text-sm">
            <Text className="font-medium">{provider.organization}</Text>
          </div>
        );
      },
      size: 120,
    },
    {
      header: "Skills",
      accessorKey: "skills",
      enableSorting: false,
      cell: ({ row }) => {
        const skills = row.original.skills || [];
        if (skills.length === 0) {
          return <Text className="text-gray-400">-</Text>;
        }

        if (skills.length === 1) {
          return (
            <div className="h-6 flex items-center">
              <Tag color="purple" className="text-xs">
                {skills[0].name}
              </Tag>
            </div>
          );
        }

        return (
          <div className="h-6 flex items-center space-x-1">
            <Tag color="purple" className="text-xs">
              {skills[0].name}
            </Tag>
            <Tooltip
              title={
                <div className="space-y-1">
                  <div className="font-medium">All Skills:</div>
                  {skills.map((skill, index) => (
                    <div key={index} className="text-xs">
                      • {skill.name}
                    </div>
                  ))}
                </div>
              }
              trigger="click"
              placement="topLeft"
            >
              <span
                className="text-xs text-purple-600 cursor-pointer hover:text-purple-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                +{skills.length - 1}
              </span>
            </Tooltip>
          </div>
        );
      },
      size: 150,
    },
    {
      header: "Capabilities",
      accessorKey: "capabilities",
      enableSorting: false,
      cell: ({ row }) => {
        const capabilities = row.original.capabilities || {};
        const capList = Object.entries(capabilities)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);

        if (capList.length === 0) {
          return <Text className="text-gray-400">-</Text>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {capList.map((cap) => (
              <Tag key={cap} color="green" className="text-xs capitalize">
                {cap}
              </Tag>
            ))}
          </div>
        );
      },
      size: 150,
    },
  ];

  const publicMCPHubColumns = (): ColumnDef<MCPServerData>[] => [
    {
      header: "Server Name",
      accessorKey: "server_name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="overflow-hidden">
          <Tooltip title={row.original.server_name}>
            <Button
              size="xs"
              variant="light"
              className="font-mono text-blue-500 bg-blue-50 hover:bg-blue-100 text-xs font-normal px-2 py-0.5 text-left"
              onClick={() => showMcpModal(row.original)}
            >
              {row.original.server_name}
            </Button>
          </Tooltip>
        </div>
      ),
      size: 150,
    },
    {
      header: "Description",
      accessorKey: "mcp_info.description",
      enableSorting: false,
      cell: ({ row }) => {
        const description = row.original.mcp_info?.description || "-";
        const truncated = description.length > 80 ? description.substring(0, 80) + "..." : description;
        return (
          <Tooltip title={description}>
            <Text className="text-sm text-gray-700">{truncated}</Text>
          </Tooltip>
        );
      },
      size: 250,
    },
    {
      header: "URL",
      accessorKey: "url",
      enableSorting: false,
      cell: ({ row }) => {
        const url = row.original.url;
        const truncated = url.length > 40 ? url.substring(0, 40) + "..." : url;
        return (
          <Tooltip title={url}>
            <div className="flex items-center space-x-2">
              <Text className="text-xs font-mono">{truncated}</Text>
              <Copy
                onClick={() => copyToClipboard(url)}
                className="cursor-pointer text-gray-500 hover:text-blue-500 w-3 h-3"
              />
            </div>
          </Tooltip>
        );
      },
      size: 200,
    },
    {
      header: "Transport",
      accessorKey: "transport",
      enableSorting: true,
      cell: ({ row }) => {
        const transport = row.original.transport;
        return (
          <Tag color="blue" className="text-xs uppercase">
            {transport}
          </Tag>
        );
      },
      size: 100,
    },
    {
      header: "Auth Type",
      accessorKey: "auth_type",
      enableSorting: true,
      cell: ({ row }) => {
        const authType = row.original.auth_type;
        const color = authType === "none" ? "gray" : "green";
        return (
          <Tag color={color} className="text-xs capitalize">
            {authType}
          </Tag>
        );
      },
      size: 100,
    },
  ];

  return (
    <ThemeProvider accessToken={accessToken}>
      <div className={isEmbedded ? "w-full" : "min-h-screen bg-white"}>
        {/* Navigation - only show when not embedded */}
        {!isEmbedded && (
          <Navbar
            userID={null}
            userEmail={null}
            userRole={null}
            premiumUser={false}
            setProxySettings={setProxySettings}
            proxySettings={proxySettings}
            accessToken={accessToken || null}
            isPublicPage={true}
            isDarkMode={false}
            toggleDarkMode={() => {}}
          />
        )}

        <div className={isEmbedded ? "w-full p-6" : "w-full px-8 py-12"}>
          {/* Embedded Explainer - only shown when embedded in dashboard */}
          {isEmbedded && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                These are models, agents, and MCP servers your proxy admin has indicated are available in your company.
              </p>
            </div>
          )}

          {/* Hero Banner - only shown when not embedded */}
          {!isEmbedded && (
            <>
              <style>{`
                @keyframes ameritasGradient {
                  0%   { background-position: 0% 50%; }
                  25%  { background-position: 50% 100%; }
                  50%  { background-position: 100% 50%; }
                  75%  { background-position: 50% 0%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes floatOrb1 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33%      { transform: translate(60px, -40px) scale(1.1); }
                  66%      { transform: translate(-30px, 30px) scale(0.95); }
                }
                @keyframes floatOrb2 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33%      { transform: translate(-50px, 50px) scale(1.05); }
                  66%      { transform: translate(40px, -20px) scale(0.9); }
                }
                @keyframes floatOrb3 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  50%      { transform: translate(30px, 40px) scale(1.08); }
                }
                @keyframes shimmer {
                  0%   { opacity: 0.03; transform: translateX(-100%); }
                  50%  { opacity: 0.08; }
                  100% { opacity: 0.03; transform: translateX(100%); }
                }
              `}</style>
              <div
                className="mb-8 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0758ac 0%, #377dd0 25%, #0058db 50%, #b20d15 85%, #d3222a 100%)",
                  backgroundSize: "400% 400%",
                  animation: "ameritasGradient 12s ease infinite",
                  borderRadius: "0px",
                  minHeight: "280px",
                }}
              >
                {/* Floating orbs for depth */}
                <div style={{
                  position: "absolute", top: "-60px", right: "10%", width: "300px", height: "300px",
                  background: "radial-gradient(circle, rgba(183,217,243,0.18) 0%, transparent 70%)",
                  borderRadius: "50%", animation: "floatOrb1 16s ease-in-out infinite", pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", bottom: "-40px", left: "5%", width: "250px", height: "250px",
                  background: "radial-gradient(circle, rgba(211,34,42,0.12) 0%, transparent 70%)",
                  borderRadius: "50%", animation: "floatOrb2 20s ease-in-out infinite", pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: "30%", right: "30%", width: "180px", height: "180px",
                  background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  borderRadius: "50%", animation: "floatOrb3 14s ease-in-out infinite", pointerEvents: "none",
                }} />

                {/* Diagonal shimmer overlay */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
                  animation: "shimmer 8s ease-in-out infinite",
                }} />

                {/* Subtle wave SVG at bottom */}
                <svg
                  style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60px", pointerEvents: "none" }}
                  viewBox="0 0 1440 60" preserveAspectRatio="none"
                >
                  <path
                    d="M0,40 C360,10 720,55 1080,25 C1260,12 1380,30 1440,20 L1440,60 L0,60 Z"
                    fill="rgba(255,255,255,0.06)"
                  />
                  <path
                    d="M0,45 C320,20 640,55 960,30 C1200,15 1360,40 1440,35 L1440,60 L0,60 Z"
                    fill="rgba(255,255,255,0.04)"
                  />
                </svg>

                {/* Content */}
                <div className="relative px-8 py-12" style={{ zIndex: 1 }}>
                  <h1
                    className="text-white font-semibold mb-3"
                    style={{ fontSize: "40px", lineHeight: "54px", fontFamily: "'Century Gothic', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.02em" }}
                  >
                    AI Services Hub
                  </h1>
                  <p
                    className="text-white mb-6"
                    style={{ fontSize: "20px", lineHeight: "30px", opacity: 0.9, fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Enterprise-wide access to generative AI — secure, observable, and built to scale.
                  </p>

                  {/* Live stats chips */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {[
                      { label: "Models", count: modelHubData?.length ?? "—" },
                      { label: "Agents", count: agentHubData?.length ?? "—" },
                      { label: "MCP Servers", count: mcpHubData?.length ?? "—" },
                    ].map(({ label, count }) => (
                      <span
                        key={label}
                        className="text-white text-sm font-medium px-4 py-1"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(4px)",
                          borderRadius: "9999px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {count} {label}
                      </span>
                    ))}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="/docs"
                      className="text-sm font-medium px-6 py-2 transition-all"
                      style={{
                        border: "2px solid rgba(255,255,255,0.8)",
                        color: "#ffffff",
                        borderRadius: "9999px",
                        fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
                        textDecoration: "none",
                        backdropFilter: "blur(4px)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#ffffff";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#0758ac";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#ffffff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.8)";
                      }}
                    >
                      View API Docs
                    </a>
                    <a
                      href="/ui"
                      className="text-sm font-medium px-6 py-2 transition-all"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#0758ac",
                        borderRadius: "9999px",
                        fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#e1f3ff";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#0758ac";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#ffffff";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#0758ac";
                      }}
                    >
                      Open Console
                    </a>
                  </div>
                </div>
              </div>

              {/* Feature highlights grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    icon: "🔌",
                    title: "Unified API",
                    body: "One endpoint for any model — no per-team integration work.",
                  },
                  {
                    icon: "🔒",
                    title: "Governance & Compliance",
                    body: "Budget controls, SSO, and full audit logs built in.",
                  },
                  {
                    icon: "📊",
                    title: "Full Observability",
                    body: "Real-time usage, cost, and latency across every team.",
                  },
                ].map(({ icon, title, body }) => (
                  <div
                    key={title}
                    className="bg-white p-6"
                    style={{
                      borderRadius: "0px",
                      boxShadow: "0 3px 4px 1px rgba(0,0,0,.1)",
                      borderLeft: "4px solid #377dd0",
                    }}
                  >
                    <div className="text-2xl mb-3">{icon}</div>
                    <h5
                      className="font-semibold mb-2"
                      style={{ fontSize: "20px", lineHeight: "30px", color: "#333333", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {title}
                    </h5>
                    <p style={{ fontSize: "16px", lineHeight: "24px", color: "#595959", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* About Section - only shown when not embedded */}
          {!isEmbedded && (
            <div
              className="mb-8 bg-white p-8"
              style={{
                borderRadius: "0px",
                boxShadow: "0 3px 4px 1px rgba(0,0,0,.1)",
                borderLeft: "4px solid #377dd0",
              }}
            >
              <h2
                className="font-semibold mb-5"
                style={{ fontSize: "32px", lineHeight: "46px", color: "#363636", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
              >
                About
              </h2>
              <p
                className="mb-6 whitespace-pre-line"
                style={{ fontSize: "16px", lineHeight: "24px", color: "#595959", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {customDocsDescription}
              </p>
              {litellmVersion && (
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-white"
                    style={{ backgroundColor: "#377dd0", borderRadius: "9999px", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    v{litellmVersion}
                  </span>
                  <span style={{ fontSize: "14px", color: "#767676" }}>
                    Powered by {appName}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Useful Links - only shown when not embedded */}
          {usefulLinks && Object.keys(usefulLinks).length > 0 && (
            <div
              className="mb-8 bg-white p-8"
              style={{ borderRadius: "0px", boxShadow: "0 3px 4px 1px rgba(0,0,0,.1)" }}
            >
              <h2
                className="font-semibold mb-5"
                style={{ fontSize: "32px", lineHeight: "46px", color: "#363636", fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Useful Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(usefulLinks || {})
                  .map(([title, value]) => {
                    // Handle both old format (string) and new format ({url, index})
                    const url = typeof value === "string" ? value : value.url;
                    const index = typeof value === "string" ? 0 : value.index ?? 0;
                    return { title, url, index };
                  })
                  .sort((a, b) => a.index - b.index)
                  .map(({ title, url }) => (
                    <button
                      key={title}
                      onClick={() => window.open(url, "_blank")}
                      className="flex items-center space-x-3 transition-colors p-3 border"
                      style={{
                        borderRadius: "9999px",
                        borderColor: "#cccccc",
                        color: "#377dd0",
                        fontFamily: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f0f6fc"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      <Text className="text-sm font-medium">{title}</Text>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Health and Endpoint Status - only shown when not embedded */}
          {!isEmbedded && (
            <Card className="mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Title className="text-2xl font-semibold mb-6 text-gray-900">Health and Endpoint Status</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Text className="text-green-600 font-medium text-sm">Service status: {serviceStatus}</Text>
              </div>
            </Card>
          )}

          {/* Tabs for Models and Agents */}
          <Card className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" className="public-hub-tabs">
              {/* Models Tab */}
              <TabPane tab="Model Hub" key="models">
                <div className="flex justify-between items-center mb-8">
                  <Title className="text-2xl font-semibold text-gray-900">Available Models</Title>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Text className="text-sm font-medium text-gray-700">Search Models:</Text>
                      <Tooltip
                        title="Smart search with relevance ranking - finds models containing your search terms, ranked by relevance. Try searching 'xai grok-4', 'claude-4', 'gpt-4', or 'sonnet'"
                        placement="top"
                      >
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search model names... (smart search enabled)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm font-medium mb-3 text-gray-700">Provider:</Text>
                    <Select
                      mode="multiple"
                      value={selectedProviders}
                      onChange={(values) => setSelectedProviders(values)}
                      placeholder="Select providers"
                      className="w-full"
                      size="large"
                      allowClear
                      optionRender={(option) => {
                        const { logo } = getProviderLogoAndName(option.value as string);
                        return (
                          <div className="flex items-center space-x-2">
                            {logo && (
                              <img
                                src={logo}
                                alt={option.label as string}
                                className="w-5 h-5 flex-shrink-0 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <span className="capitalize">{option.label}</span>
                          </div>
                        );
                      }}
                    >
                      {modelHubData &&
                        Array.isArray(modelHubData) &&
                        getUniqueProviders(modelHubData).map((provider) => (
                          <Select.Option key={provider} value={provider}>
                            {provider}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                  <div>
                    <Text className="text-sm font-medium mb-3 text-gray-700">Mode:</Text>
                    <Select
                      mode="multiple"
                      value={selectedModes}
                      onChange={(values) => setSelectedModes(values)}
                      placeholder="Select modes"
                      className="w-full"
                      size="large"
                      allowClear
                    >
                      {modelHubData &&
                        Array.isArray(modelHubData) &&
                        getUniqueModes(modelHubData).map((mode) => (
                          <Select.Option key={mode} value={mode}>
                            {mode}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                  <div>
                    <Text className="text-sm font-medium mb-3 text-gray-700">Features:</Text>
                    <Select
                      mode="multiple"
                      value={selectedFeatures}
                      onChange={(values) => setSelectedFeatures(values)}
                      placeholder="Select features"
                      className="w-full"
                      size="large"
                      allowClear
                    >
                      {modelHubData &&
                        Array.isArray(modelHubData) &&
                        getUniqueFeatures(modelHubData).map((feature) => (
                          <Select.Option key={feature} value={feature}>
                            {feature}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </div>

                <ModelDataTable
                  columns={publicModelHubColumns()}
                  data={filteredData}
                  isLoading={loading}
                  defaultSorting={[{ id: "model_group", desc: false }]}
                />

                <div className="mt-8 text-center">
                  <Text className="text-sm text-gray-600">
                    Showing {filteredData.length} of {modelHubData?.length || 0} models
                  </Text>
                </div>
              </TabPane>

              {/* Agents Tab */}
              {agentHubData && Array.isArray(agentHubData) && agentHubData.length > 0 && (
                <TabPane tab="Agent Hub" key="agents">
                  <div className="flex justify-between items-center mb-8">
                    <Title className="text-2xl font-semibold text-gray-900">Available Agents</Title>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Text className="text-sm font-medium text-gray-700">Search Agents:</Text>
                        <Tooltip title="Search agents by name or description" placement="top">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search agent names or descriptions..."
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Text className="text-sm font-medium mb-3 text-gray-700">Skills:</Text>
                      <Select
                        mode="multiple"
                        value={selectedAgentSkills}
                        onChange={(values) => setSelectedAgentSkills(values)}
                        placeholder="Select skills"
                        className="w-full"
                        size="large"
                        allowClear
                      >
                        {agentHubData &&
                          Array.isArray(agentHubData) &&
                          getUniqueAgentSkills(agentHubData).map((skill) => (
                            <Select.Option key={skill} value={skill}>
                              {skill}
                            </Select.Option>
                          ))}
                      </Select>
                    </div>
                  </div>

                  <ModelDataTable
                    columns={publicAgentHubColumns()}
                    data={filteredAgentData}
                    isLoading={agentLoading}
                    defaultSorting={[{ id: "name", desc: false }]}
                  />

                  <div className="mt-8 text-center">
                    <Text className="text-sm text-gray-600">
                      Showing {filteredAgentData.length} of {agentHubData?.length || 0} agents
                    </Text>
                  </div>
                </TabPane>
              )}

              {/* MCP Servers Tab */}
              {mcpHubData && Array.isArray(mcpHubData) && mcpHubData.length > 0 && (
                <TabPane tab="MCP Hub" key="mcp">
                  <div className="flex justify-between items-center mb-8">
                    <Title className="text-2xl font-semibold text-gray-900">Available MCP Servers</Title>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Text className="text-sm font-medium text-gray-700">Search MCP Servers:</Text>
                        <Tooltip title="Search MCP servers by name or description" placement="top">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search MCP server names or descriptions..."
                          value={mcpSearchTerm}
                          onChange={(e) => setMcpSearchTerm(e.target.value)}
                          className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Text className="text-sm font-medium mb-3 text-gray-700">Transport:</Text>
                      <Select
                        mode="multiple"
                        value={selectedMcpTransports}
                        onChange={(values) => setSelectedMcpTransports(values)}
                        placeholder="Select transport types"
                        className="w-full"
                        size="large"
                        allowClear
                      >
                        {mcpHubData &&
                          Array.isArray(mcpHubData) &&
                          getUniqueMcpTransports(mcpHubData).map((transport) => (
                            <Select.Option key={transport} value={transport}>
                              {transport}
                            </Select.Option>
                          ))}
                      </Select>
                    </div>
                  </div>

                  <ModelDataTable
                    columns={publicMCPHubColumns()}
                    data={filteredMcpData}
                    isLoading={mcpLoading}
                    defaultSorting={[{ id: "server_name", desc: false }]}
                  />

                  <div className="mt-8 text-center">
                    <Text className="text-sm text-gray-600">
                      Showing {filteredMcpData.length} of {mcpHubData?.length || 0} MCP servers
                    </Text>
                  </div>
                </TabPane>
              )}
            </Tabs>
          </Card>
        </div>

        {/* Model Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <span>{selectedModel?.model_group || "Model Details"}</span>
              {selectedModel && (
                <Tooltip title="Copy model name">
                  <Copy
                    onClick={() => copyToClipboard(selectedModel.model_group)}
                    className="cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"
                  />
                </Tooltip>
              )}
            </div>
          }
          width={1000}
          open={isModalVisible}
          footer={null}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          {selectedModel && (
            <div className="space-y-6">
              {/* Model Overview */}
              <div>
                <Text className="text-lg font-semibold mb-4">Model Overview</Text>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Text className="font-medium">Model Name:</Text>
                    <Text>{selectedModel.model_group}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Mode:</Text>
                    <Text>{selectedModel.mode || "Not specified"}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Providers:</Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModel.providers.map((provider) => {
                        const { logo } = getProviderLogoAndName(provider);
                        return (
                          <Tag key={provider} color="blue">
                            <div className="flex items-center space-x-1">
                              {logo && (
                                <img
                                  src={logo}
                                  alt={provider}
                                  className="w-3 h-3 flex-shrink-0 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              <span className="capitalize">{provider}</span>
                            </div>
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Wildcard Routing Note */}
                {selectedModel.model_group.includes("*") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <Text className="font-medium text-blue-900 mb-2">Wildcard Routing</Text>
                        <Text className="text-sm text-blue-800 mb-2">
                          This model uses wildcard routing. You can pass any value where you see the{" "}
                          <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">*</code> symbol.
                        </Text>
                        <Text className="text-sm text-blue-800">
                          For example, with{" "}
                          <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">{selectedModel.model_group}</code>,
                          you can use any string (
                          <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">
                            {selectedModel.model_group.replace("*", "my-custom-value")}
                          </code>
                          ) that matches this pattern.
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Token and Cost Information */}
              <div>
                <Text className="text-lg font-semibold mb-4">Token & Cost Information</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="font-medium">Max Input Tokens:</Text>
                    <Text>{selectedModel.max_input_tokens?.toLocaleString() || "Not specified"}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Max Output Tokens:</Text>
                    <Text>{selectedModel.max_output_tokens?.toLocaleString() || "Not specified"}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Input Cost per 1M Tokens:</Text>
                    <Text>
                      {selectedModel.input_cost_per_token
                        ? formatCost(selectedModel.input_cost_per_token)
                        : "Not specified"}
                    </Text>
                  </div>
                  <div>
                    <Text className="font-medium">Output Cost per 1M Tokens:</Text>
                    <Text>
                      {selectedModel.output_cost_per_token
                        ? formatCost(selectedModel.output_cost_per_token)
                        : "Not specified"}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <Text className="text-lg font-semibold mb-4">Capabilities</Text>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const capabilities = getModelCapabilities(selectedModel);
                    const colors = ["green", "blue", "purple", "orange", "red", "yellow"];

                    if (capabilities.length === 0) {
                      return <Text className="text-gray-500">No special capabilities listed</Text>;
                    }

                    return capabilities.map((capability, index) => (
                      <Tag key={capability} color={colors[index % colors.length]}>
                        {formatCapabilityName(capability)}
                      </Tag>
                    ));
                  })()}
                </div>
              </div>

              {/* Rate Limits */}
              {(selectedModel.tpm || selectedModel.rpm) && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Rate Limits</Text>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedModel.tpm && (
                      <div>
                        <Text className="font-medium">Tokens per Minute:</Text>
                        <Text>{selectedModel.tpm.toLocaleString()}</Text>
                      </div>
                    )}
                    {selectedModel.rpm && (
                      <div>
                        <Text className="font-medium">Requests per Minute:</Text>
                        <Text>{selectedModel.rpm.toLocaleString()}</Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Supported OpenAI Parameters */}
              {selectedModel.supported_openai_params && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Supported OpenAI Parameters</Text>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.supported_openai_params.map((param) => (
                      <Tag key={param} color="green">
                        {param}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Example */}
              <div>
                <Text className="text-lg font-semibold mb-4">Usage Example</Text>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {(() => {
                      const codeSnippet = generateCodeSnippet({
                        apiKeySource: "custom",
                        accessToken: null,
                        apiKey: "your_api_key",
                        inputMessage: "Hello, how are you?",
                        chatHistory: [{ role: "user", content: "Hello, how are you?", isImage: false } as MessageType],
                        selectedTags: [],
                        selectedVectorStores: [],
                        selectedGuardrails: [],
                        selectedPolicies: [],
                        selectedMCPServers: [],
                        endpointType: getEndpointType(selectedModel.mode || "chat"),
                        selectedModel: selectedModel.model_group,
                        selectedSdk: "openai",
                      });
                      return codeSnippet;
                    })()}
                  </pre>
                </div>
                <div className="mt-2 text-right">
                  <button
                    onClick={() => {
                      const codeSnippet = generateCodeSnippet({
                        apiKeySource: "custom",
                        accessToken: null,
                        apiKey: "your_api_key",
                        inputMessage: "Hello, how are you?",
                        chatHistory: [{ role: "user", content: "Hello, how are you?", isImage: false } as MessageType],
                        selectedTags: [],
                        selectedVectorStores: [],
                        selectedGuardrails: [],
                        selectedPolicies: [],
                        selectedMCPServers: [],
                        endpointType: getEndpointType(selectedModel.mode || "chat"),
                        selectedModel: selectedModel.model_group,
                        selectedSdk: "openai",
                      });
                      copyToClipboard(codeSnippet);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Agent Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <span>{selectedAgent?.name || "Agent Details"}</span>
              {selectedAgent && (
                <Tooltip title="Copy agent name">
                  <Copy
                    onClick={() => copyToClipboard(selectedAgent.name)}
                    className="cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"
                  />
                </Tooltip>
              )}
            </div>
          }
          width={1000}
          open={isAgentModalVisible}
          footer={null}
          onOk={handleAgentModalOk}
          onCancel={handleAgentModalCancel}
        >
          {selectedAgent && (
            <div className="space-y-6">
              {/* Agent Overview */}
              <div>
                <Text className="text-lg font-semibold mb-4">Agent Overview</Text>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Text className="font-medium">Name:</Text>
                    <Text>{selectedAgent.name}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Version:</Text>
                    <Text>{selectedAgent.version}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text className="font-medium">Description:</Text>
                    <Text>{selectedAgent.description}</Text>
                  </div>
                  {selectedAgent.url && (
                    <div>
                      <Text className="font-medium">URL:</Text>
                      <a
                        href={selectedAgent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {selectedAgent.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Capabilities */}
              {selectedAgent.capabilities && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Capabilities</Text>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedAgent.capabilities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => (
                        <Tag key={key} color="green" className="capitalize">
                          {key}
                        </Tag>
                      ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedAgent.skills && selectedAgent.skills.length > 0 && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Skills</Text>
                  <div className="space-y-4">
                    {selectedAgent.skills.map((skill, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Text className="font-medium text-base">{skill.name}</Text>
                            <Text className="text-sm text-gray-600">{skill.description}</Text>
                          </div>
                        </div>
                        {skill.tags && skill.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {skill.tags.map((tag) => (
                              <Tag key={tag} color="purple" className="text-xs">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input/Output Modes */}
              <div>
                <Text className="text-lg font-semibold mb-4">Input/Output Modes</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="font-medium">Input Modes:</Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.defaultInputModes?.map((mode) => (
                        <Tag key={mode} color="blue">
                          {mode}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Text className="font-medium">Output Modes:</Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.defaultOutputModes?.map((mode) => (
                        <Tag key={mode} color="blue">
                          {mode}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation */}
              {selectedAgent.documentationUrl && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Documentation</Text>
                  <a
                    href={selectedAgent.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    <span>View Documentation</span>
                  </a>
                </div>
              )}

              {/* A2A Usage Example */}
              <div>
                <Text className="text-lg font-semibold mb-4">Usage Example (A2A Protocol)</Text>

                {/* Step 1: Retrieve Agent Card */}
                <div className="mb-4">
                  <Text className="text-sm font-medium mb-2 text-gray-700">Step 1: Retrieve Agent Card</Text>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs">
                      {`base_url = '${selectedAgent.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`}
                    </pre>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        const codeSnippet = `from a2a.client import A2ACardResolver, A2AClient
from a2a.types import (
    AgentCard,
    MessageSendParams,
    SendMessageRequest,
    SendStreamingMessageRequest,
)
from a2a.utils.constants import (
    AGENT_CARD_WELL_KNOWN_PATH,
    EXTENDED_AGENT_CARD_PATH,
)

base_url = '${selectedAgent.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`;
                        copyToClipboard(codeSnippet);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                </div>

                {/* Step 2: Call the Agent */}
                <div>
                  <Text className="text-sm font-medium mb-2 text-gray-700">Step 2: Call the Agent</Text>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs">
                      {`client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`}
                    </pre>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        const codeSnippet = `client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`;
                        copyToClipboard(codeSnippet);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* MCP Server Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <span>{selectedMcpServer?.server_name || "MCP Server Details"}</span>
              {selectedMcpServer && (
                <Tooltip title="Copy server name">
                  <Copy
                    onClick={() => copyToClipboard(selectedMcpServer.server_name)}
                    className="cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"
                  />
                </Tooltip>
              )}
            </div>
          }
          width={1000}
          open={isMcpModalVisible}
          footer={null}
          onOk={handleMcpModalOk}
          onCancel={handleMcpModalCancel}
        >
          {selectedMcpServer && (
            <div className="space-y-6">
              {/* Server Overview */}
              <div>
                <Text className="text-lg font-semibold mb-4">Server Overview</Text>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Text className="font-medium">Server Name:</Text>
                    <Text>{selectedMcpServer.server_name}</Text>
                  </div>
                  <div>
                    <Text className="font-medium">Transport:</Text>
                    <Tag color="blue">{selectedMcpServer.transport}</Tag>
                  </div>
                  {selectedMcpServer.alias && (
                    <div>
                      <Text className="font-medium">Alias:</Text>
                      <Text>{selectedMcpServer.alias}</Text>
                    </div>
                  )}
                  <div>
                    <Text className="font-medium">Auth Type:</Text>
                    <Tag color={selectedMcpServer.auth_type === "none" ? "gray" : "green"}>
                      {selectedMcpServer.auth_type}
                    </Tag>
                  </div>
                  <div className="col-span-2">
                    <Text className="font-medium">Description:</Text>
                    <Text>{selectedMcpServer.mcp_info?.description || "-"}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text className="font-medium">URL:</Text>
                    <a
                      href={selectedMcpServer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all flex items-center space-x-2"
                    >
                      <span>{selectedMcpServer.url}</span>
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedMcpServer.mcp_info && Object.keys(selectedMcpServer.mcp_info).length > 0 && (
                <div>
                  <Text className="text-lg font-semibold mb-4">Additional Information</Text>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(selectedMcpServer.mcp_info, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Usage Example */}
              <div>
                <Text className="text-lg font-semibold mb-4">Usage Example</Text>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${selectedMcpServer.server_name}": {
            "url": "http://localhost:4000/${selectedMcpServer.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`}
                  </pre>
                </div>
                <div className="mt-2 text-right">
                  <button
                    onClick={() => {
                      const codeSnippet = `# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${selectedMcpServer.server_name}": {
            "url": "http://localhost:4000/${selectedMcpServer.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`;
                      copyToClipboard(codeSnippet);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default PublicModelHub;
