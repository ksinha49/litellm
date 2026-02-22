import React, { useCallback, useEffect, useState } from "react";
import { DateRangePickerValue, Title } from "@tremor/react";
import AdvancedDatePicker from "@/components/shared/advanced_date_picker";
import {
  adminGlobalActivity,
  adminGlobalCacheActivity,
  adminspendByProvider,
  adminTopKeysCall,
  adminTopModelsCall,
  applicationHealthCall,
  getTotalSpendCall,
  teamSpendLogsCall,
  ApplicationMetrics,
} from "@/components/networking";
import SpendByProvider from "@/components/UsagePage/components/EntityUsage/SpendByProvider";
import KPISummaryCards from "./components/KPISummaryCards";
import AdoptionTrendChart from "./components/AdoptionTrendChart";
import TeamSpendChart from "./components/TeamSpendChart";
import TopModelsChart from "./components/TopModelsChart";
import CachePerformanceChart from "./components/CachePerformanceChart";
import ApplicationInventoryTable from "./components/ApplicationInventoryTable";
import {
  KPIData,
  DailyActivity,
  TeamSpend,
  TopModel,
  CacheActivity,
  ProviderSpendData,
} from "./types";

interface AnalyticsDashboardViewProps {
  accessToken?: string | null;
}

const defaultKPI: KPIData = {
  totalModels: 0,
  activeKeys: 0,
  monthlySpend: 0,
  totalRequests: 0,
  adoptionRate: 0,
  totalApps: 0,
  activeApps: 0,
};

const getDefaultDateRange = (): DateRangePickerValue => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
};

/** Format a Date as YYYY-MM-DD (the format the backend expects). */
function formatDateParam(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  accessToken: accessTokenProp,
}) => {
  const [dateValue, setDateValue] = useState<DateRangePickerValue>(
    getDefaultDateRange
  );
  const [loading, setLoading] = useState(true);
  const [isDateChanging, setIsDateChanging] = useState(false);

  // Data state
  const [kpi, setKpi] = useState<KPIData>(defaultKPI);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [providerSpend, setProviderSpend] = useState<ProviderSpendData[]>([]);
  const [teamSpend, setTeamSpend] = useState<TeamSpend[]>([]);
  const [topModels, setTopModels] = useState<TopModel[]>([]);
  const [cacheActivity, setCacheActivity] = useState<CacheActivity[]>([]);
  const [applications, setApplications] = useState<ApplicationMetrics[]>([]);

  const accessToken = accessTokenProp ?? null;

  const fetchData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const isRefresh = !loading;
    if (isRefresh) setIsDateChanging(true);
    else setLoading(true);

    // Backend expects YYYY-MM-DD, not ISO timestamps
    const startTime = dateValue.from ? formatDateParam(dateValue.from) : undefined;
    const endTime = dateValue.to ? formatDateParam(dateValue.to) : undefined;

    const results = await Promise.allSettled([
      adminGlobalActivity(accessToken, startTime, endTime),           // 0
      getTotalSpendCall(accessToken),                                  // 1
      adminTopModelsCall(accessToken),                                 // 2
      adminTopKeysCall(accessToken),                                   // 3
      adminspendByProvider(accessToken, null, startTime, endTime),     // 4
      teamSpendLogsCall(accessToken),                                  // 5
      adminGlobalCacheActivity(accessToken, startTime, endTime),       // 6
      applicationHealthCall(accessToken, {
        start_date: startTime,
        end_date: endTime,
      }),                                                              // 7
    ]);

    // Helper to safely extract fulfilled values
    const val = <T,>(idx: number): T | null => {
      const r = results[idx];
      return r.status === "fulfilled" ? (r.value as T) : null;
    };

    // Activity data — backend returns { daily_data: [{date, api_requests, total_tokens}], sum_api_requests }
    const activityData = val<{
      daily_data: { date: string; api_requests: number; total_tokens: number }[];
      sum_api_requests: number;
    }>(0);
    if (activityData?.daily_data) {
      setDailyActivity(
        activityData.daily_data.map((d) => ({
          date: d.date,
          api_requests: d.api_requests,
          total_tokens: d.total_tokens,
        }))
      );
    }

    // Total spend
    const spendData = val<{ spend: number; max_budget: number }>(1);

    // Top models
    const modelsData = val<TopModel[]>(2);
    if (modelsData) setTopModels(modelsData);

    // Top keys (for active keys count)
    const keysData = val<{ api_key: string; total_spend: number }[]>(3);

    // Provider spend
    const providerData = val<ProviderSpendData[]>(4);
    if (providerData) setProviderSpend(providerData);

    // Team spend — backend wraps data in { total_spend_per_team: [...] }
    const teamsResponse = val<{
      total_spend_per_team: TeamSpend[];
    }>(5);
    if (teamsResponse?.total_spend_per_team) {
      setTeamSpend(teamsResponse.total_spend_per_team);
    }

    // Cache activity — backend returns [{api_key, total_rows, cache_hit_true_rows, ...}]
    const cacheData = val<
      { api_key: string; total_rows: number; cache_hit_true_rows: number }[]
    >(6);
    if (cacheData && Array.isArray(cacheData)) {
      // Aggregate across all keys into a single summary
      let totalHits = 0;
      let totalMisses = 0;
      for (const row of cacheData) {
        totalHits += row.cache_hit_true_rows ?? 0;
        totalMisses += (row.total_rows ?? 0) - (row.cache_hit_true_rows ?? 0);
      }
      setCacheActivity([
        { date: "Total", cache_hits: totalHits, cache_misses: totalMisses },
      ]);
    }

    // Application health
    const appData = val<{
      applications: ApplicationMetrics[];
      total_apps: number;
      active_apps: number;
    }>(7);
    if (appData?.applications) setApplications(appData.applications);

    // Compute KPI summary
    const totalApps = appData?.total_apps ?? 0;
    const activeApps = appData?.active_apps ?? 0;
    setKpi({
      totalModels: modelsData?.length ?? 0,
      activeKeys: keysData?.length ?? 0,
      monthlySpend: spendData?.spend ?? 0,
      totalRequests: activityData?.sum_api_requests ?? 0,
      adoptionRate: totalApps > 0 ? (activeApps / totalApps) * 100 : 0,
      totalApps,
      activeApps,
    });

    setLoading(false);
    setIsDateChanging(false);
  }, [accessToken, dateValue, loading]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, dateValue]);

  const handleDateChange = (newValue: DateRangePickerValue) => {
    setDateValue(newValue);
  };

  return (
    <div className="w-full p-6 space-y-6" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Title style={{ color: "#333333", fontSize: "1.5rem", fontWeight: 700 }}>
          AI Analytics Dashboard
        </Title>
        <AdvancedDatePicker
          value={dateValue}
          onValueChange={handleDateChange}
        />
      </div>

      {/* KPI Cards */}
      <KPISummaryCards loading={loading} data={kpi} />

      {/* API Usage Trend */}
      <AdoptionTrendChart loading={loading || isDateChanging} data={dailyActivity} />

      {/* Provider Spend + Team Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendByProvider
          loading={loading || isDateChanging}
          isDateChanging={isDateChanging}
          providerSpend={providerSpend}
        />
        <TeamSpendChart loading={loading || isDateChanging} data={teamSpend} />
      </div>

      {/* Top Models + Cache Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopModelsChart loading={loading || isDateChanging} data={topModels} />
        <CachePerformanceChart
          loading={loading || isDateChanging}
          data={cacheActivity}
        />
      </div>

      {/* Application Inventory */}
      <ApplicationInventoryTable
        loading={loading || isDateChanging}
        data={applications}
      />
    </div>
  );
};

export default AnalyticsDashboardView;
