"use client"

import { AreaChart } from "@/components/dither-kit/area-chart"
import { Area } from "@/components/dither-kit/area"
import { Grid } from "@/components/dither-kit/grid"
import { Legend } from "@/components/dither-kit/legend"
import { Tooltip } from "@/components/dither-kit/tooltip"
import { XAxis } from "@/components/dither-kit/x-axis"
import { YAxis } from "@/components/dither-kit/y-axis"

export interface RevenueRow {
  month: string
  revenue: number
  trips: number
  [key: string]: unknown
}

const DEFAULT_DATA: RevenueRow[] = [
  { month: "Jan", revenue: 45, trips: 28 },
  { month: "Feb", revenue: 52, trips: 34 },
  { month: "Mar", revenue: 48, trips: 30 },
  { month: "Apr", revenue: 61, trips: 38 },
  { month: "May", revenue: 55, trips: 32 },
  { month: "Jun", revenue: 70, trips: 42 },
  { month: "Jul", revenue: 65, trips: 40 },
  { month: "Aug", revenue: 72, trips: 45 },
  { month: "Sep", revenue: 68, trips: 41 },
  { month: "Oct", revenue: 75, trips: 46 },
  { month: "Nov", revenue: 80, trips: 50 },
  { month: "Dec", revenue: 85, trips: 53 },
]

const CHART_CONFIG = {
  revenue: { label: "Revenue", color: "blue" as const },
  trips: { label: "Trips", color: "purple" as const },
}

interface FleetTrendChartProps {
  data?: RevenueRow[]
  className?: string
}

export default function FleetTrendChart({
  data = DEFAULT_DATA,
  className,
}: FleetTrendChartProps) {
  return (
    <div className={className}>
      <AreaChart
        data={data}
        config={CHART_CONFIG}
        bloom="aura"
        className="h-64 w-full"
      >
        <Grid horizontal strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickFormatter={(value: unknown) => String(value ?? "")}
          maxTicks={6}
        />
        <YAxis tickFormatter={(v: number) => `${v}`} tickCount={5} />
        <Legend isClickable align="right" />
        <Tooltip
          labelKey="month"
          valueFormatter={(value: number) => `${value.toLocaleString()}k`}
          variant="frosted-glass"
        />
        <Area dataKey="revenue" variant="gradient" isClickable />
        <Area dataKey="trips" variant="dotted" isClickable />
      </AreaChart>
    </div>
  )
}
