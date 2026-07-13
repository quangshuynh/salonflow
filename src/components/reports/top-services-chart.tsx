"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ServicePerformanceAllTime } from "@/features/analytics/reports";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function TopServicesChart({
  data,
}: {
  data: ServicePerformanceAllTime[];
}) {
  const rows = data.map((entry) => ({
    name: entry.service.name,
    revenue: entry.revenue,
    bookings: entry.bookings,
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ height: rows.length * 44 + 16 }}
    >
      <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={150}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
      </BarChart>
    </ChartContainer>
  );
}
