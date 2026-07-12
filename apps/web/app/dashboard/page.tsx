'use client';
import { StatusBadge } from '@/components/status-badge';
import Sidebar from '@/components/sidebar';
import VehicleStatusPie from '@/components/vehicle-status-pie';
import FleetStatsCards from '@/components/fleet-stats-cards';
import type { FleetStatItem } from '@/components/fleet-stats-cards';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { vehiclesService } from '@/services/vehicles';
import { tripsService } from '@/services/trips';
import { driversService } from '@/services/drivers';
import type { Vehicle, Trip, Driver } from '@transitops/shared';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function pct(n: number, total: number) {
  return total > 0 ? `${Math.round((n / total) * 100)}%` : '0%';
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role_name !== 'Admin') {
      router.replace('/settings');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || user?.role_name !== 'Admin') return;
    Promise.all([
      vehiclesService.list().catch(() => []),
      tripsService.list().catch(() => []),
      driversService.list().catch(() => [])
    ])
      .then(([v, t, d]) => { setVehicles(v); setTrips(t); setDrivers(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const vehicleTypes = ['All', ...Array.from(new Set(vehicles.map(v => v.type)))];
  const vehicleStatuses = ['All', ...Array.from(new Set(vehicles.map(v => v.status)))];

  const recentTrips = [...trips]
    .filter(t => {
      const v = vehicleMap[t.vehicle_id];
      if (!v) return true;
      if (typeFilter && typeFilter !== 'All' && v.type !== typeFilter) return false;
      if (statusFilter && statusFilter !== 'All' && v.status !== statusFilter) return false;
      return true;
    })
    .slice(-4)
    .reverse()
    .map(t => ({
      trip: `TR${String(t.id).padStart(3, '0')}`,
      vehicle: vehicleMap[t.vehicle_id]?.name_model || `Vehicle #${t.vehicle_id}`,
      driver: driverMap[t.driver_id]?.name || `Driver #${t.driver_id}`,
      status: t.status,
    }));

  const filteredVehicles = vehicles.filter(v => {
    if (typeFilter && typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter && statusFilter !== 'All' && v.status !== statusFilter) return false;
    return true;
  });

  const vehicleStatusData = [
    { status: 'Available', count: filteredVehicles.filter(v => v.status === 'Available').length },
    { status: 'On Trip', count: filteredVehicles.filter(v => v.status === 'On Trip').length },
    { status: 'In Shop', count: filteredVehicles.filter(v => v.status === 'In Shop').length },
    { status: 'Retired', count: filteredVehicles.filter(v => v.status === 'Retired').length },
  ];

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status !== 'Off Duty' && d.status !== 'Suspended').length;
  const utilization = pct(activeVehicles, totalVehicles);

  const fleetOverview: FleetStatItem[] = [
    { metric: 'Active Vehicles', current: String(activeVehicles), previous: String(totalVehicles), trend: 'up', difference: `+${activeVehicles - inMaintenance}` },
    { metric: 'Available Vehicles', current: String(availableVehicles), previous: String(totalVehicles), trend: 'up', difference: `+${availableVehicles}` },
    { metric: 'In Maintenance', current: String(inMaintenance).padStart(2, '0'), previous: String(totalVehicles), trend: 'down', difference: `-${inMaintenance}` },
    { metric: 'Active Trips', current: String(activeTrips), previous: String(pendingTrips), trend: 'up', difference: `+${activeTrips}` },
  ];

  const operations: FleetStatItem[] = [
    { metric: 'Pending Trips', current: String(pendingTrips).padStart(2, '0'), previous: String(activeTrips), trend: 'down', difference: `-${pendingTrips}` },
    { metric: 'Drivers on Duty', current: String(driversOnDuty), previous: String(drivers.length), trend: 'up', difference: `+${driversOnDuty}` },
    { metric: 'Fleet Utilization', current: utilization, previous: '0%', trend: 'up', difference: `+${utilization}` },
  ];

  if (authLoading || loading || user?.role_name !== 'Admin') return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Fleet operations overview</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
            <SelectTrigger className="w-[180px] bg-secondary border-border h-8 text-sm"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
            <SelectContent>
              {vehicleTypes.map(t => (<SelectItem key={t} value={t}>{t === 'All' ? 'Vehicle Type: All' : t}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-[180px] bg-secondary border-border h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {vehicleStatuses.map(s => (<SelectItem key={s} value={s}>{s === 'All' ? 'Status: All' : s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-wider mb-4">FLEET OVERVIEW</h2>
              <FleetStatsCards items={fleetOverview} cols={4} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider mb-4">OPERATIONS</h2>
              <FleetStatsCards items={operations} cols={3} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">VEHICLE STATUS</h2>
              <div className="bg-card border border-border rounded-lg p-2 flex flex-col justify-center h-[calc(100%-2rem)]">
                <VehicleStatusPie data={vehicleStatusData} />
              </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wider mb-4">RECENT TRIPS</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-muted-foreground text-xs tracking-wider">
                  <TableHead className="text-left p-3 font-semibold">TRIP</TableHead>
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">DRIVER</TableHead>
                  <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrips.map((trip) => (
                  <TableRow key={trip.trip} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{trip.trip}</TableCell>
                    <TableCell className="p-3">{trip.vehicle}</TableCell>
                    <TableCell className="p-3">{trip.driver}</TableCell>
                    <TableCell className="p-3"><StatusBadge status={trip.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
