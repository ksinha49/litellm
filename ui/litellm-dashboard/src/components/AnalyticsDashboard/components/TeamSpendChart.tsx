import { BarChart, Card, Title } from "@tremor/react";
import React from "react";
import { ChartLoader } from "@/components/shared/chart_loader";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { TeamSpend } from "../types";

interface TeamSpendChartProps {
  loading: boolean;
  data: TeamSpend[];
}

const TeamSpendChart: React.FC<TeamSpendChartProps> = ({ loading, data }) => {
  const chartData = data
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, 10)
    .map((t) => ({
      team: t.team_alias || t.team_id?.slice(0, 8) || "Unknown",
      Spend: t.total_spend,
    }));

  return (
    <Card className="h-full" style={{ borderRadius: 8, border: "1px solid #cccccc" }}>
      <Title>Team Spend Breakdown</Title>
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
          index="team"
          categories={["Spend"]}
          colors={["cyan"]}
          layout="vertical"
          valueFormatter={(v) => `$${formatNumberWithCommas(v, 2)}`}
          showAnimation
        />
      )}
    </Card>
  );
};

export default TeamSpendChart;
