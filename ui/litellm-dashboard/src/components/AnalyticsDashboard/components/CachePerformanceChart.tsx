import { BarChart, Card, Title } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { CacheActivity } from "../types";

interface CachePerformanceChartProps {
  loading: boolean;
  data: CacheActivity[];
}

const CachePerformanceChart: React.FC<CachePerformanceChartProps> = ({
  loading,
  data,
}) => {
  const chartData = data.map((d) => ({
    date: d.date,
    "Cache Hits": d.cache_hits,
    "Cache Misses": d.cache_misses,
  }));

  return (
    <Card className="h-full" style={{ borderRadius: 8, border: "1px solid #cccccc" }}>
      <Title>Cache Performance</Title>
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
          index="date"
          categories={["Cache Hits", "Cache Misses"]}
          colors={["emerald", "amber"]}
          stack
          valueFormatter={(v) => formatNumberWithCommas(v)}
          showAnimation
        />
      )}
    </Card>
  );
};

export default CachePerformanceChart;
