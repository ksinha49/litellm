import { BarChart } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { TeamSpend } from "../types";

interface TeamSpendChartProps {
  loading: boolean;
  data: TeamSpend[];
  expanded?: boolean;
}

const TeamSpendChart: React.FC<TeamSpendChartProps> = ({
  loading,
  data,
  expanded = false,
}) => {
  const sorted = data.sort((a, b) => b.total_spend - a.total_spend);
  const sliced = expanded ? sorted : sorted.slice(0, 10);
  const chartData = sliced.map((t) => ({
    team: t.team_alias || t.team_id?.slice(0, 8) || "Unknown",
    Spend: t.total_spend,
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
      className={expanded ? "mt-4 h-[500px]" : "mt-4 h-96"}
      data={chartData}
      index="team"
      categories={["Spend"]}
      colors={["cyan"]}
      layout="vertical"
      yAxisWidth={160}
      valueFormatter={(v) => `$${formatNumberWithCommas(v, 2)}`}
      showAnimation
      showGridLines={true}
      showLegend={true}
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

export default TeamSpendChart;
