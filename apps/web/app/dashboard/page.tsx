'use client';
import { StatusBadge } from '@/components/status-badge';

import Sidebar from '@/components/sidebar';
import VehicleStatusPie from '@/components/vehicle-status-pie';
import FleetStatsCards from '@/components/fleet-stats-cards';
import type { FleetStatItem } from '@/components/fleet-stats-cards';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fleetOverview: FleetStatItem[] = [
  { metric: 'Active Vehicles', current: '53', previous: '50', trend: 'up', difference: '+3' },
  { metric: 'Available Vehicles', current: '42', previous: '38', trend: 'up', difference: '+4' },
  { metric: 'In Maintenance', current: '05', previous: '07', trend: 'down', difference: '-2' },
  { metric: 'Active Trips', current: '18', previous: '13', trend: 'up', difference: '+5' },
];

const operations: FleetStatItem[] = [
  { metric: 'Pending Trips', current: '09', previous: '12', trend: 'down', difference: '-3' },
  { metric: 'Drivers on Duty', current: '26', previous: '24', trend: 'up', difference: '+2' },
  { metric: 'Fleet Utilization', current: '81%', previous: '77%', trend: 'up', difference: '+4.2%' },
];

const recentTrips = [
  { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', statusColor: 'bg-chart-2', eta: '45 min' },
  { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', statusColor: 'bg-primary', eta: '—' },
  { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', statusColor: 'bg-chart-1', eta: '1h 10m' },
  { trip: 'TR004', vehicle: '—', driver: '—', status: 'Draft', statusColor: 'bg-muted', eta: 'Awaiting vehicle' },
];

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Fleet operations overview
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vehicle Type: All</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Region: All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Fleet Overview */}
            <div>
              <h2 className="text-sm font-semibold tracking-wider mb-4">FLEET OVERVIEW</h2>
              <FleetStatsCards items={fleetOverview} cols={4} />
            </div>

            {/* Operations */}
            <div>
              <h2 className="text-sm font-semibold tracking-wider mb-4">OPERATIONS</h2>
              <FleetStatsCards items={operations} cols={3} />
            </div>
          </div>

          {/* Vehicle Status — dither-kit pie chart */}
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">VEHICLE STATUS</h2>
            <div className="bg-card border border-border rounded-lg p-2 flex flex-col justify-center h-[calc(100%-2rem)]">
              <VehicleStatusPie />
            </div>
          </div>
        </div>

        {/* Recent Trips */}
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
                  <TableHead className="text-left p-3 font-semibold">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrips.map((trip) => (
                  <TableRow key={trip.trip} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{trip.trip}</TableCell>
                    <TableCell className="p-3">{trip.vehicle}</TableCell>
                    <TableCell className="p-3">{trip.driver}</TableCell>
                    <TableCell className="p-3">
                      <StatusBadge status={trip.status} />
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground">{trip.eta}</TableCell>
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
