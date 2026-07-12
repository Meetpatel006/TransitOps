'use client';
import Sidebar from '@/components/sidebar';
import { StatusBadge } from '@/components/status-badge';
import { AreaChart } from '@/components/dither-kit/area-chart';
import { Area } from '@/components/dither-kit/area';
import { Grid } from '@/components/dither-kit/grid';
import { Legend } from '@/components/dither-kit/legend';
import { Tooltip } from '@/components/dither-kit/tooltip';
import { XAxis } from '@/components/dither-kit/x-axis';
import { YAxis } from '@/components/dither-kit/y-axis';
import Stats13 from '@/components/stats13';

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

const metrics: MetricCard[] = [
  { label: 'TOTAL REVENUE', value: '₹8,45,200', sub: 'This quarter', trend: 'up', change: '+12.3%' },
  { label: 'TOTAL TRIPS', value: '142', sub: '87 completed', trend: 'up', change: '+8 this month' },
  { label: 'AVG TRIP DISTANCE', value: '34.2 km', sub: 'Across all trips', trend: 'neutral', change: '—' },
  { label: 'FLEET UTILIZATION', value: '78%', sub: '3 of 4 vehicles active', trend: 'up', change: '+5.2%' },
];

const vehicleStatus = [
  { status: 'Available', count: 1, color: 'bg-green-500' },
  { status: 'On Trip', count: 1, color: 'bg-blue-500' },
  { status: 'In Shop', count: 1, color: 'bg-amber-500' },
  { status: 'Retired', count: 1, color: 'bg-red-400' },
];
const totalVehicles = vehicleStatus.reduce((s, v) => s + v.count, 0);

const monthlyData = [
  { month: 'Jan', revenue: 45, trips: 28, fuel: 12, maint: 8 },
  { month: 'Feb', revenue: 52, trips: 34, fuel: 14.5, maint: 3 },
  { month: 'Mar', revenue: 48, trips: 30, fuel: 13.2, maint: 6.2 },
  { month: 'Apr', revenue: 61, trips: 38, fuel: 16, maint: 18 },
  { month: 'May', revenue: 55, trips: 32, fuel: 15, maint: 4.2 },
  { month: 'Jun', revenue: 70, trips: 42, fuel: 18, maint: 2.8 },
];

const revenueChartConfig = {
  revenue: { label: 'Revenue (₹k)', color: 'blue' as const },
  trips: { label: 'Trips', color: 'purple' as const },
};

const costChartConfig = {
  fuel: { label: 'Fuel (₹k)', color: 'orange' as const },
  maint: { label: 'Maintenance (₹k)', color: 'green' as const },
};

const costBreakdown = [
  { category: 'Fuel', amount: 88700, pct: 68, color: 'bg-amber-500' },
  { category: 'Maintenance', amount: 42200, pct: 24, color: 'bg-blue-500' },
  { category: 'Toll & Other', amount: 10500, pct: 8, color: 'bg-purple-500' },
];
const totalCost = costBreakdown.reduce((s, c) => s + c.amount, 0);

const topRoutes = [
  { from: 'Gandhinagar Depot', to: 'Ahmedabad Hub', trips: 34, dist: 38 },
  { from: 'Vatva Industrial', to: 'Sanand Warehouse', trips: 28, dist: 25 },
  { from: 'Naroda', to: 'Vastral', trips: 22, dist: 15 },
  { from: 'Mansa', to: 'Kalol Depot', trips: 18, dist: 55 },
  { from: 'SG Highway', to: 'Airport Cargo', trips: 14, dist: 12 },
];

const driverLeaderboard = [
  { name: 'Alex', trips: 48, rating: 4.8, status: 'Available' },
  { name: 'Priya', trips: 42, rating: 4.6, status: 'On Trip' },
  { name: 'Suresh', trips: 35, rating: 4.3, status: 'Off Duty' },
  { name: 'John', trips: 17, rating: 3.9, status: 'Suspended' },
];

const tripStatusDist = [
  { status: 'Completed', count: 87, color: 'bg-green-500' },
  { status: 'Dispatched', count: 12, color: 'bg-blue-500' },
  { status: 'Cancelled', count: 8, color: 'bg-red-400' },
  { status: 'Draft', count: 35, color: 'bg-slate-400' },
];
const totalTrips = tripStatusDist.reduce((s, t) => s + t.count, 0);

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

export default function AnalyticsPage() {
  return (
    <Sidebar>
      <div className="p-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Fleet performance overview
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="border border-border rounded-lg p-4">
              <p className="text-xs font-bold tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">{m.sub}</p>
                {m.change && m.change !== '—' && (
                  <span className={`text-xs font-medium ${m.trend === 'up' ? 'text-green-500' : m.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {m.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Status + Trip Status */}
        <div className="grid grid-cols-2 gap-6">
          <Stats13
            title="Fleet Status"
            total={4}
            totalLabel="vehicles"
            segments={vehicleStatus.map(v => ({
              label: v.status,
              value: v.count,
              color: v.color,
            }))}
          />
          <Stats13
            title="Trip Status"
            total={142}
            totalLabel="trips"
            segments={tripStatusDist.map(t => ({
              label: t.status,
              value: t.count,
              color: t.color,
            }))}
          />
        </div>

        {/* Monthly Revenue & Trips Chart */}
        <div>
          <h2 className="text-sm font-bold tracking-wider mb-3">MONTHLY REVENUE & TRIPS</h2>
          <div className="border border-border rounded-lg p-4">
            <AreaChart data={monthlyData} config={revenueChartConfig} bloom="aura" className="h-72 w-full">
              <Grid horizontal strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(v: unknown) => String(v ?? '')} maxTicks={6} />
              <YAxis tickFormatter={(v: number) => `${v}`} tickCount={5} />
              <Legend isClickable align="right" />
              <Tooltip labelKey="month" valueFormatter={(v: number) => `${v.toLocaleString()}k`} variant="frosted-glass" />
              <Area dataKey="revenue" variant="gradient" isClickable />
              <Area dataKey="trips" variant="dotted" isClickable />
            </AreaChart>
          </div>
        </div>

        {/* Monthly Costs Chart */}
        <div>
          <h2 className="text-sm font-bold tracking-wider mb-3">MONTHLY COSTS</h2>
          <div className="border border-border rounded-lg p-4">
            <AreaChart data={monthlyData} config={costChartConfig} bloom="aura" className="h-64 w-full">
              <Grid horizontal strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(v: unknown) => String(v ?? '')} maxTicks={6} />
              <YAxis tickFormatter={(v: number) => `₹${v}k`} tickCount={5} />
              <Legend isClickable align="right" />
              <Tooltip labelKey="month" valueFormatter={(v: number) => `₹${v.toLocaleString()}k`} variant="frosted-glass" />
              <Area dataKey="fuel" variant="gradient" isClickable />
              <Area dataKey="maint" variant="dotted" isClickable />
            </AreaChart>
          </div>
        </div>

        {/* Cost Breakdown + Top Routes */}
        <div className="grid grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <div>
            <h2 className="text-sm font-bold tracking-wider mb-3">COST BREAKDOWN</h2>
            <div className="border border-border rounded-lg p-4 space-y-4">
              {costBreakdown.map(c => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{c.category}</span>
                    <span className="font-medium">₹{formatCurrency(c.amount)} ({c.pct}%)</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex items-center justify-between text-sm font-bold">
                <span>Total</span>
                <span>₹{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Top Routes */}
          <div>
            <h2 className="text-sm font-bold tracking-wider mb-3">TOP ROUTES</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <th className="text-left p-3 font-semibold">ROUTE</th>
                    <th className="text-right p-3 font-semibold">TRIPS</th>
                    <th className="text-right p-3 font-semibold">DISTANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {topRoutes.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-3">{r.from} → {r.to}</td>
                      <td className="p-3 text-right font-medium">{r.trips}</td>
                      <td className="p-3 text-right text-muted-foreground">{r.dist} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Driver Leaderboard + Key Insights */}
        <div className="grid grid-cols-2 gap-6">
          {/* Driver Leaderboard */}
          <div>
            <h2 className="text-sm font-bold tracking-wider mb-3">DRIVER LEADERBOARD</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <th className="text-left p-3 font-semibold">#</th>
                    <th className="text-left p-3 font-semibold">DRIVER</th>
                    <th className="text-right p-3 font-semibold">TRIPS</th>
                    <th className="text-right p-3 font-semibold">RATING</th>
                    <th className="text-left p-3 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {driverLeaderboard.slice(0, 3).map((d, i) => (
                    <tr key={d.name} className="border-b border-border last:border-0">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3 font-medium">{d.name}</td>
                      <td className="p-3 text-right">{d.trips}</td>
                      <td className="p-3 text-right">{d.rating}</td>
                      <td className="p-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h2 className="text-sm font-bold tracking-wider mb-3">KEY INSIGHTS</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Most Costly Vehicle</p>
                <p className="text-sm font-bold mt-0.5">TRUCK-12</p>
                <p className="text-xs text-muted-foreground">₹42,200 total spend</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Best Route</p>
                <p className="text-sm font-bold mt-0.5">Gandhinagar → Ahmedabad</p>
                <p className="text-xs text-muted-foreground">34 trips · highest frequency</p>
              </div>
              <div className="border border-border rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-sm font-bold mt-0.5">61.3%</p>
                <p className="text-xs text-muted-foreground">87 of 142 trips completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
