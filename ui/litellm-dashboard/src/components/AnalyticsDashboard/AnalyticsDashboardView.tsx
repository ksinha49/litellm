import React, { useCallback, useEffect, useState } from "react";
import { DateRangePickerValue, Title } from "@tremor/react";
import AdvancedDatePicker from "@/components/shared/advanced_date_picker";
import {
  adminGlobalActivity,
  adminspendByProvider,
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
import OrgConsumptionChart from "./components/OrgConsumptionChart";
import ApplicationInventoryTable from "./components/ApplicationInventoryTable";
import ExpandableChartCard from "./components/ExpandableChartCard";
import {
  KPIData,
  DailyActivity,
  TeamSpend,
  TopModel,
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
  activeTeams: 0,
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
  const [applications, setApplications] = useState<ApplicationMetrics[]>([]);

  const accessToken = accessTokenProp ?? null;

  const fetchData = useCallback(async () => {
    const isRefresh = !loading;
    if (isRefresh) setIsDateChanging(true);
    else setLoading(true);

    // Backend expects YYYY-MM-DD, not ISO timestamps
    const startTime = dateValue.from ? formatDateParam(dateValue.from) : undefined;
    const endTime = dateValue.to ? formatDateParam(dateValue.to) : undefined;

    const token = accessToken ?? "";
    const results = await Promise.allSettled([
      adminGlobalActivity(token, startTime, endTime),           // 0
      getTotalSpendCall(token, startTime, endTime),               // 1
      adminTopModelsCall(token),                                 // 2
      adminspendByProvider(token, null, startTime, endTime),     // 3
      teamSpendLogsCall(token),                                  // 4
      applicationHealthCall(token, {
        start_date: startTime,
        end_date: endTime,
      }),                                                        // 5
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

    // Total spend + active keys count (both from /global/spend)
    const spendData = val<{ spend: number; max_budget: number; active_keys: number }>(1);

    // Top models
    const modelsData = val<TopModel[]>(2);
    if (modelsData) setTopModels(modelsData);

    // Provider spend
    const providerData = val<ProviderSpendData[]>(3);
    if (providerData) setProviderSpend(providerData);

    // Team spend — backend wraps data in { total_spend_per_team: [...] }
    const teamsResponse = val<{
      total_spend_per_team: TeamSpend[];
    }>(4);
    if (teamsResponse?.total_spend_per_team) {
      setTeamSpend(teamsResponse.total_spend_per_team);
    }

    // Application health
    const appData = val<{
      applications: ApplicationMetrics[];
      total_apps: number;
      active_apps: number;
    }>(5);
    if (appData?.applications) setApplications(appData.applications);

    // Compute KPI summary
    const currentTeamSpend = teamsResponse?.total_spend_per_team ?? [];
    setKpi({
      totalModels: modelsData?.length ?? 0,
      activeKeys: spendData?.active_keys ?? 0,
      monthlySpend: spendData?.spend ?? 0,
      totalRequests: activityData?.sum_api_requests ?? 0,
      activeTeams: currentTeamSpend.filter((t) => t.total_spend > 0).length,
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

  const isLoading = loading || isDateChanging;

  return (
    <div className="w-full p-6 space-y-6" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Title style={{ color: "#333333", fontSize: "1.5rem", fontWeight: 600 }}>
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
      <ExpandableChartCard title="API Usage Trend">
        {(expanded) => (
          <AdoptionTrendChart
            loading={isLoading}
            data={dailyActivity}
            expanded={expanded}
          />
        )}
      </ExpandableChartCard>

      {/* Provider Spend — full width */}
      <SpendByProvider
        loading={isLoading}
        isDateChanging={isDateChanging}
        providerSpend={providerSpend}
      />

      {/* Team Spend + Top Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpandableChartCard title="Team Spend Breakdown">
          {(expanded) => (
            <TeamSpendChart
              loading={isLoading}
              data={teamSpend}
              expanded={expanded}
            />
          )}
        </ExpandableChartCard>
        <ExpandableChartCard title="Top Models by Spend">
          {(expanded) => (
            <TopModelsChart
              loading={isLoading}
              data={topModels}
              expanded={expanded}
            />
          )}
        </ExpandableChartCard>
      </div>

      {/* Organizational Consumption Distribution */}
      <ExpandableChartCard title="Organizational Consumption Distribution">
        {(_expanded) => (
          <OrgConsumptionChart loading={isLoading} data={teamSpend} />
        )}
      </ExpandableChartCard>

      {/* Application Inventory */}
      <ExpandableChartCard title="Application Inventory">
        {(expanded) => (
          <ApplicationInventoryTable
            loading={isLoading}
            data={applications}
            expanded={expanded}
          />
        )}
      </ExpandableChartCard>
    </div>
  );
};

export default AnalyticsDashboardView;
