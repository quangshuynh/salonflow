"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyPerformance } from "@/features/analytics/reports";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function RevenueChart({ data }: { data: DailyPerformance[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={shortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(value: number) => formatCurrency(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => shortDate(String(value))}
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
