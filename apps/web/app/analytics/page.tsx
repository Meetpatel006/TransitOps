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
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics';
import { ResourceGuard } from '@/components/resource-guard';
import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '@transitops/shared';

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.get()
      .then((data) => {
        setVehicles(data.vehicles);
        setDrivers(data.drivers);
        setTrips(data.trips);
        setMaintenance(data.maintenance);
        setFuelLogs(data.fuel_logs);
        setExpenses(data.expenses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const avgDistance = trips.length > 0 ? trips.reduce((s, t) => s + t.planned_distance, 0) / trips.length : 0;
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const utilization = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;

  const metrics: MetricCard[] = [
    { label: 'TOTAL TRIPS', value: String(trips.length), sub: `${completedTrips} completed`, trend: 'up', change: `+${trips.length}` },
    { label: 'AVG TRIP DISTANCE', value: `${avgDistance.toFixed(1)} km`, sub: 'Across all trips', trend: 'neutral', change: '—' },
    { label: 'FLEET UTILIZATION', value: `${utilization}%`, sub: `${activeVehicles} of ${vehicles.length} active`, trend: 'up', change: `+${utilization}%` },
    { label: 'TOTAL FUEL COST', value: `₹${formatCurrency(fuelLogs.reduce((s, f) => s + f.cost, 0))}`, sub: 'Fuel logs', trend: 'up', change: '+' },
  ];

  const vehicleStatus = [
    { status: 'Available', count: vehicles.filter(v => v.status === 'Available').length, color: 'bg-green-500' },
    { status: 'On Trip', count: vehicles.filter(v => v.status === 'On Trip').length, color: 'bg-blue-500' },
    { status: 'In Shop', count: vehicles.filter(v => v.status === 'In Shop').length, color: 'bg-amber-500' },
    { status: 'Retired', count: vehicles.filter(v => v.status === 'Retired').length, color: 'bg-red-400' },
  ];

  const tripStatusDist = [
    { status: 'Completed', count: completedTrips, color: 'bg-green-500' },
    { status: 'Dispatched', count: trips.filter(t => t.status === 'Dispatched').length, color: 'bg-blue-500' },
    { status: 'Cancelled', count: trips.filter(t => t.status === 'Cancelled').length, color: 'bg-red-400' },
    { status: 'Draft', count: trips.filter(t => t.status === 'Draft').length, color: 'bg-slate-400' },
  ];

  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.cost, 0);
  const grandTotal = totalFuel + totalMaint + totalExpense;

  const spendByVehicle = new Map<number, number>();
  const addSpend = (vid: number, amount: number) => {
    spendByVehicle.set(vid, (spendByVehicle.get(vid) || 0) + amount);
  };
  fuelLogs.forEach(f => addSpend(f.vehicle_id, f.cost));
  maintenance.forEach(m => addSpend(m.vehicle_id, m.cost));
  expenses.forEach(e => addSpend(e.vehicle_id, e.cost));
  const costliestVehicle = vehicles
    .map(v => ({ id: v.id, name: v.name_model, spend: spendByVehicle.get(v.id) || 0 }))
    .sort((a, b) => b.spend - a.spend)[0];

  const costBreakdown = [
    { category: 'Fuel', amount: Math.round(totalFuel), pct: grandTotal > 0 ? Math.round((totalFuel / grandTotal) * 100) : 0, color: 'bg-amber-500' },
    { category: 'Maintenance', amount: Math.round(totalMaint), pct: grandTotal > 0 ? Math.round((totalMaint / grandTotal) * 100) : 0, color: 'bg-blue-500' },
    { category: 'Other', amount: Math.round(totalExpense), pct: grandTotal > 0 ? Math.round((totalExpense / grandTotal) * 100) : 0, color: 'bg-purple-500' },
  ];
  const totalCost = costBreakdown.reduce((s, c) => s + c.amount, 0);

  const routeMap = new Map<string, { count: number; dist: number }>();
  trips.forEach(t => {
    const key = `${t.source} → ${t.destination}`;
    const existing = routeMap.get(key) || { count: 0, dist: 0 };
    routeMap.set(key, { count: existing.count + 1, dist: t.planned_distance });
  });
  const topRoutes = [...routeMap.entries()]
    .map(([key, val]) => {
      const [from, to] = key.split(' → ');
      return { from, to, trips: val.count, dist: val.dist };
    })
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5);

  const driverTripCount = new Map<number, number>();
  trips.forEach(t => driverTripCount.set(t.driver_id, (driverTripCount.get(t.driver_id) || 0) + 1));
  const driverLeaderboard = drivers
    .map(d => ({ name: d.name, trips: driverTripCount.get(d.id) || 0, rating: (d.safety_score || 0) / 20, status: d.status }))
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 3);

  const monthlyData = MONTHS.slice(0, 6).map((month, i) => ({
    month,
    revenue: Math.round((totalFuel + totalMaint + totalExpense) / 6 / 1000 * (1 + i * 0.1)),
    trips: Math.round(trips.length / 6 * (1 + i * 0.05)),
    fuel: Math.round(totalFuel / 6 / 1000),
    maint: Math.round(totalMaint / 6 / 1000),
  }));

  const revenueChartConfig = { revenue: { label: 'Revenue (₹k)', color: 'blue' as const }, trips: { label: 'Trips', color: 'purple' as const } };
  const costChartConfig = { fuel: { label: 'Fuel (₹k)', color: 'orange' as const }, maint: { label: 'Maintenance (₹k)', color: 'green' as const } };

  return (
    <ResourceGuard resource="analytics">
    <Sidebar>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Fleet performance overview</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="border border-border rounded-lg p-4">
              <p className="text-xs font-bold tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">{m.sub}</p>
                {m.change !== '—' && (
                  <span className={`text-xs font-medium ${m.trend === 'up' ? 'text-green-500' : m.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>{m.change}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Stats13 title="Fleet Status" total={vehicles.length} totalLabel="vehicles" segments={vehicleStatus.map(v => ({ label: v.status, value: v.count, color: v.color }))} />
          <Stats13 title="Trip Status" total={trips.length} totalLabel="trips" segments={tripStatusDist.map(t => ({ label: t.status, value: t.count, color: t.color }))} />
        </div>

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

        <div className="grid grid-cols-2 gap-6">
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

        <div className="grid grid-cols-2 gap-6">
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
                  {driverLeaderboard.map((d, i) => (
                    <tr key={d.name} className="border-b border-border last:border-0">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3 font-medium">{d.name}</td>
                      <td className="p-3 text-right">{d.trips}</td>
                      <td className="p-3 text-right">{d.rating.toFixed(1)}</td>
                      <td className="p-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider mb-3">KEY INSIGHTS</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Most Costly Vehicle</p>
                <p className="text-sm font-bold mt-0.5">{costliestVehicle?.name || '—'}</p>
                <p className="text-xs text-muted-foreground">₹{formatCurrency(costliestVehicle?.spend || 0)} total spend</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Best Route</p>
                <p className="text-sm font-bold mt-0.5">{topRoutes[0]?.from || '—'} → {topRoutes[0]?.to || '—'}</p>
                <p className="text-xs text-muted-foreground">{topRoutes[0]?.trips || 0} trips · highest frequency</p>
              </div>
              <div className="border border-border rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-sm font-bold mt-0.5">{trips.length > 0 ? Math.round((completedTrips / trips.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">{completedTrips} of {trips.length} trips completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
    </ResourceGuard>
  );
}
