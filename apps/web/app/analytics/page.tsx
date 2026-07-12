'use client';

import Sidebar from '@/components/sidebar';

const stats = [
  { label: 'FUEL EFFICIENCY', value: '8.4 km/l', color: 'border-l-green-500' },
  { label: 'FLEET UTILIZATION', value: '81%', color: 'border-l-green-500' },
  { label: 'OPERATIONAL COST', value: '34,070', color: 'border-l-orange-500' },
  { label: 'VEHICLE ROI', value: '14.2%', color: 'border-l-green-500' },
];

const monthlyRevenue = [45, 52, 48, 61, 55, 70, 65, 72, 68, 75, 80, 85];

const topCostliest = [
  { vehicle: 'TRUCK-12', cost: 18000, color: 'bg-pink-500' },
  { vehicle: 'MINI-08', cost: 6200, color: 'bg-amber-500' },
  { vehicle: 'VAN-05', cost: 2800, color: 'bg-blue-500' },
];

const maxCost = Math.max(...topCostliest.map((v) => v.cost));

export default function AnalyticsPage() {
  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-card border border-border rounded-lg p-4 border-l-4 ${stat.color}`}
            >
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </div>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ROI Formula */}
        <p className="text-xs text-muted-foreground italic">
          ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        </p>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8">
          {/* Monthly Revenue */}
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">MONTHLY REVENUE</h2>
            <div className="bg-card border border-border rounded-lg p-4 h-64 flex items-end gap-2">
              {monthlyRevenue.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(val / 100) * 180}px` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Top Costliest Vehicles */}
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">TOP COSTLIEST VEHICLES</h2>
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {topCostliest.map((v) => (
                <div key={v.vehicle}>
                  <div className="text-sm mb-1">{v.vehicle}</div>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${v.color} rounded-full`}
                      style={{ width: `${(v.cost / maxCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
