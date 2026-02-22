export interface KPIData {
  totalModels: number;
  activeKeys: number;
  monthlySpend: number;
  totalRequests: number;
  adoptionRate: number;
  totalApps: number;
  activeApps: number;
}

export interface DailyActivity {
  date: string;
  api_requests: number;
  total_tokens: number;
}

export interface TeamSpend {
  team_id: string;
  team_alias?: string | null;
  total_spend: number;
}

export interface TopModel {
  model: string;
  total_spend: number;
}

export interface CacheActivity {
  date: string;
  cache_hits: number;
  cache_misses: number;
}

export interface ProviderSpendData {
  provider: string;
  spend: number;
  requests: number;
  successful_requests: number;
  failed_requests: number;
  tokens: number;
}

export interface AnalyticsDashboardState {
  loading: boolean;
  kpi: KPIData;
  dailyActivity: DailyActivity[];
  providerSpend: ProviderSpendData[];
  teamSpend: TeamSpend[];
  topModels: TopModel[];
  cacheActivity: CacheActivity[];
}
