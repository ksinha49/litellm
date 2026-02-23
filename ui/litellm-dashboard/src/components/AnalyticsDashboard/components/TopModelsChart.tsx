import { BarChart } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { TopModel } from "../types";

interface TopModelsChartProps {
  loading: boolean;
  data: TopModel[];
  expanded?: boolean;
}

const TopModelsChart: React.FC<TopModelsChartProps> = ({
  loading,
  data,
  expanded = false,
}) => {
  const limit = expanded ? 10 : 5;
  const chartData = data
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, limit)
    .map((m) => ({
      model: m.model,
      Spend: m.total_spend,
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
    <BarChart
      className={expanded ? "mt-4 h-[500px]" : "mt-4 h-64"}
      data={chartData}
      index="model"
      categories={["Spend"]}
      colors={["blue"]}
      valueFormatter={(v) => `$${formatNumberWithCommas(v, 2)}`}
      showAnimation
      showGridLines={true}
      showLegend={true}
      yAxisWidth={80}
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
                  ${formatNumberWithCommas(item.value, 2)}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
};

export default TopModelsChart;
