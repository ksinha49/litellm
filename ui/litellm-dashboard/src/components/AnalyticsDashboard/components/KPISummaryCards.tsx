import { Card, Grid } from "@tremor/react";
import React from "react";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { KPIData } from "../types";

interface KPISummaryCardsProps {
  loading: boolean;
  data: KPIData;
}

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, subtitle }) => (
  <Card
    className="p-4"
    style={{ borderRadius: 4, border: "1px solid #cccccc", backgroundColor: "#FFFFFF" }}
  >
    <p
      className="text-xs font-semibold uppercase tracking-wide"
      style={{ color: "#595959" }}
    >
      {label}
    </p>
    <p className="text-2xl font-bold mt-1" style={{ color: "#333333" }}>
      {value}
    </p>
    {subtitle && (
      <p className="text-xs mt-1" style={{ color: "#595959" }}>
        {subtitle}
      </p>
    )}
  </Card>
);

const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ loading, data }) => {
  if (loading) {
    return (
      <Grid numItems={5} className="gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="p-4 animate-pulse"
            style={{ borderRadius: 4, border: "1px solid #cccccc" }}
          >
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-16" />
          </Card>
        ))}
      </Grid>
    );
  }

  return (
    <Grid numItems={5} className="gap-4">
      <KPICard
        label="Total Models"
        value={formatNumberWithCommas(data.totalModels)}
      />
      <KPICard
        label="Active Keys"
        value={formatNumberWithCommas(data.activeKeys)}
      />
      <KPICard
        label="Total Spend"
        value={`$${formatNumberWithCommas(data.monthlySpend, 2)}`}
      />
      <KPICard
        label="Total Requests"
        value={formatNumberWithCommas(data.totalRequests, 0, true)}
      />
      <KPICard
        label="Active Teams"
        value={formatNumberWithCommas(data.activeTeams)}
      />
    </Grid>
  );
};

export default KPISummaryCards;
