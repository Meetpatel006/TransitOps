"use client"

import { PieChart } from "@/components/dither-kit/pie-chart"
import { Pie } from "@/components/dither-kit/pie"
import { Legend } from "@/components/dither-kit/legend"
import { Tooltip } from "@/components/dither-kit/tooltip"
import { cn } from "@/lib/utils"

const DATA = [
  { status: "Available", count: 75 },
  { status: "On Trip", count: 35 },
  { status: "In Shop", count: 15 },
  { status: "Retired", count: 5 },
] satisfies { status: string; count: number; [key: string]: unknown }[]

const CONFIG = {
  Available: { label: "Available", color: "green" as const },
  "On Trip": { label: "On Trip", color: "blue" as const },
  "In Shop": { label: "In Shop", color: "orange" as const },
  Retired: { label: "Retired", color: "grey" as const },
}

interface VehicleStatusPieProps {
  className?: string
}

export default function VehicleStatusPie({ className }: VehicleStatusPieProps) {
  return (
    <div className={cn("h-full", className)}>
      <PieChart
        data={DATA}
        config={CONFIG}
        dataKey="count"
        nameKey="status"
        innerRadius={0.5}
        bloom="aura"
        className="h-full w-full min-h-[220px]"
      >
        <Legend isClickable align="right" />
        <Tooltip variant="frosted-glass" />
        <Pie variant="gradient" />
      </PieChart>
    </div>
  )
}
