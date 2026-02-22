import { AreaChart, Card, Title } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { DailyActivity } from "../types";

interface AdoptionTrendChartProps {
  loading: boolean;
  data: DailyActivity[];
}

const AdoptionTrendChart: React.FC<AdoptionTrendChartProps> = ({
  loading,
  data,
}) => {
  const chartData = data.map((d) => ({
    date: d.date,
    "API Requests": d.api_requests,
    "Total Tokens": d.total_tokens,
  }));

  return (
    <Card style={{ borderRadius: 8, border: "1px solid #cccccc" }}>
      <Title>API Usage Trend</Title>
      {loading ? (
        <ChartLoader />
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#595959" }}>
            No data available
          </p>
        </div>
      ) : (
        <AreaChart
          className="mt-4 h-64"
          data={chartData}
          index="date"
          categories={["API Requests"]}
          colors={["blue"]}
          valueFormatter={(v) => formatNumberWithCommas(v, 0, true)}
          showAnimation
          curveType="monotone"
        />
      )}
    </Card>
  );
};

export default AdoptionTrendChart;
