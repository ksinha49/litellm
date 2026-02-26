import React, { useState } from "react";
import { DonutChart, Legend } from "@tremor/react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { TeamSpend } from "../types";

const COLORS = [
  "indigo",
  "cyan",
  "amber",
  "emerald",
  "rose",
  "violet",
  "orange",
  "teal",
  "pink",
  "lime",
] as const;

interface Props {
  data: TeamSpend[];
  loading: boolean;
}

interface ChartItem {
  name: string;
  value: number;
}

const OrgConsumptionChart: React.FC<Props> = ({ data, loading }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const chartData: ChartItem[] = data
    .filter((t) => t.total_spend > 0)
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, 10)
    .map((t) => ({
      name: t.team_alias || t.team_id?.slice(0, 8) || "Unknown",
      value: t.total_spend,
    }));

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const selectedItem = selected ? chartData.find((d) => d.name === selected) : null;

  const centerLabel = selectedItem
    ? `$${formatNumberWithCommas(selectedItem.value, 0)}`
    : `$${formatNumberWithCommas(total, 0)}`;

  if (loading) return <ChartLoader />;
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Donut */}
      <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          valueFormatter={(v) => `$${formatNumberWithCommas(v, 2)}`}
          colors={[...COLORS]}
          className="h-64 w-64"
          showAnimation
          animationDuration={900}
          showLabel
          label={centerLabel}
          onValueChange={(v) =>
            setSelected(v ? (v as unknown as ChartItem).name : null)
          }
          customTooltip={({ payload, active }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0];
            const pct =
              total > 0
                ? (((item.value as number) / total) * 100).toFixed(1)
                : "0";
            return (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm min-w-[160px]">
                <p className="font-semibold mb-1" style={{ color: "#333" }}>
                  {item.name}
                </p>
                <div className="flex justify-between gap-3">
                  <span style={{ color: "#555" }}>Spend</span>
                  <span className="font-medium">
                    ${formatNumberWithCommas(item.value as number, 2)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span style={{ color: "#555" }}>Share</span>
                  <span className="font-medium">{pct}%</span>
                </div>
              </div>
            );
          }}
        />
        <Legend
          categories={chartData.map((d) => d.name)}
          colors={[...COLORS]}
          className="max-w-xs text-xs"
        />
      </div>

      {/* Ranked breakdown panel */}
      <div className="flex-1 space-y-2 w-full">
        {chartData.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const isSelected = selected === item.name;
          const color = COLORS[i % COLORS.length];
          return (
            <button
              key={item.name}
              onClick={() => setSelected(isSelected ? null : item.name)}
              className={`w-full text-left rounded-lg px-3 py-2 transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-indigo-500 bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-gray-900 ml-2">
                  ${formatNumberWithCommas(item.value, 2)}
                </span>
              </div>
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 bg-${color}-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{pct.toFixed(1)}% of total</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrgConsumptionChart;
