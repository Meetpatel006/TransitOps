'use client';
import { StatusBadge } from '@/components/status-badge';

import Sidebar from '@/components/sidebar';
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

const stats = [
  { label: 'ACTIVE VEHICLES', value: '53', color: 'border-l-chart-1' },
  { label: 'AVAILABLE VEHICLES', value: '42', color: 'border-l-chart-2' },
  { label: 'VEHICLES IN MAINTENANCE', value: '05', color: 'border-l-chart-2' },
  { label: 'ACTIVE TRIPS', value: '18', color: 'border-l-muted' },
  { label: 'PENDING TRIPS', value: '09', color: 'border-l-muted' },
  { label: 'DRIVERS ON DUTY', value: '26', color: 'border-l-muted' },
  { label: 'FLEET UTILIZATION', value: '81%', color: 'border-l-primary' },
];

const recentTrips = [
  { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', statusColor: 'bg-chart-2', eta: '45 min' },
  { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', statusColor: 'bg-primary', eta: '—' },
  { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', statusColor: 'bg-chart-1', eta: '1h 10m' },
  { trip: 'TR004', vehicle: '—', driver: '—', status: 'Draft', statusColor: 'bg-muted', eta: 'Awaiting vehicle' },
];

const vehicleStatus = [
  { label: 'Available', percentage: 75, color: 'bg-primary' },
  { label: 'On Trip', percentage: 35, color: 'bg-chart-1' },
  { label: 'In Shop', percentage: 15, color: 'bg-chart-2' },
  { label: 'Retired', percentage: 5, color: 'bg-chart-3' },
];

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="p-6 space-y-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-7 gap-4">
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Trips */}
          <div className="col-span-2">
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

          {/* Vehicle Status */}
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">VEHICLE STATUS</h2>
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {vehicleStatus.map((status) => (
                <div key={status.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{status.label}</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} rounded-full`}
                      style={{ width: `${status.percentage}%` }}
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
