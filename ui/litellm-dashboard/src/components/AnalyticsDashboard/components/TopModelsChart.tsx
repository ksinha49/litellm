import { BarChart, Card, Title } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { TopModel } from "../types";

interface TopModelsChartProps {
  loading: boolean;
  data: TopModel[];
}

const TopModelsChart: React.FC<TopModelsChartProps> = ({ loading, data }) => {
  const chartData = data
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, 5)
    .map((m) => ({
      model: m.model,
      Spend: m.total_spend,
    }));

  return (
    <Card className="h-full" style={{ borderRadius: 8, border: "1px solid #cccccc" }}>
      <Title>Top Models by Spend</Title>
      {loading ? (
        <ChartLoader />
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#595959" }}>
            No data available
          </p>
        </div>
      ) : (
        <BarChart
          className="mt-4 h-64"
          data={chartData}
          index="model"
          categories={["Spend"]}
          colors={["blue"]}
          valueFormatter={(v) => `$${formatNumberWithCommas(v, 2)}`}
          showAnimation
        />
      )}
    </Card>
  );
};

export default TopModelsChart;
