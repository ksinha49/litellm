import { AreaChart } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { DailyActivity } from "../types";

interface AdoptionTrendChartProps {
  loading: boolean;
  data: DailyActivity[];
  expanded?: boolean;
}

const AdoptionTrendChart: React.FC<AdoptionTrendChartProps> = ({
  loading,
  data,
  expanded = false,
}) => {
  const chartData = data.map((d) => ({
    date: d.date,
    "API Requests": d.api_requests,
    "Total Tokens": d.total_tokens,
  }));

  if (loading) return <ChartLoader />;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm" style={{ color: "#595959" }}>
          No data available
        </p>
      </div>
    );
  }

  return (
    <AreaChart
      className={expanded ? "mt-4 h-[500px]" : "mt-4 h-64"}
      data={chartData}
      index="date"
      categories={["API Requests"]}
      colors={["blue"]}
      valueFormatter={(v) => formatNumberWithCommas(v, 0, true)}
      showAnimation
      curveType="monotone"
      showGridLines={true}
      showLegend={true}
      yAxisWidth={60}
      customTooltip={({ payload, active, label }) => {
        if (!active || !payload?.length) return null;
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
            <p className="font-semibold mb-1" style={{ color: "#333" }}>
              {label}
            </p>
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex justify-between gap-4">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-medium">
                  {formatNumberWithCommas(item.value, 0, true)}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
};

export default AdoptionTrendChart;
