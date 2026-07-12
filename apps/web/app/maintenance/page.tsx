'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState } from 'react';
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
import { DatePicker } from "@/components/ui/date-picker";

interface MaintenanceRecord {
  id: number;
  vehicle: string;
  service: string;
  cost: number;
  date: string;
  status: string;
}

const vehicles = ['VAN-05', 'TRUCK-12', 'MINI-08', 'VAN-09'];
const serviceTypes = ['Oil Change', 'Engine Repair', 'Tyre Replace', 'Brake Service', 'Battery Replace', 'AC Service', 'General Service', 'Clutch Repair'];

const initialRecords: MaintenanceRecord[] = [
  { id: 1, vehicle: 'VAN-05', service: 'Oil Change', cost: 2800, date: '05 Jul 2026', status: 'Completed' },
  { id: 2, vehicle: 'TRUCK-12', service: 'Engine Repair', cost: 18000, date: '06 Jul 2026', status: 'Completed' },
  { id: 3, vehicle: 'MINI-08', service: 'Tyre Replace', cost: 6200, date: '06 Jul 2026', status: 'In Progress' },
  { id: 4, vehicle: 'VAN-05', service: 'Brake Service', cost: 1800, date: '08 Jul 2026', status: 'Completed' },
  { id: 5, vehicle: 'TRUCK-12', service: 'AC Service', cost: 3500, date: '09 Jul 2026', status: 'In Progress' },
  { id: 6, vehicle: 'VAN-09', service: 'General Service', cost: 4200, date: '10 Jul 2026', status: 'Completed' },
];

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

export default function MaintenancePage() {
  const [records, setRecords] = useState(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: '', serviceType: '', cost: '', date: '' });
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Summary calculations
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const inProgressCount = records.filter(r => r.status === 'In Progress').length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const avgCost = records.length > 0 ? totalCost / records.length : 0;

  // Filtered records
  const filtered = records.filter(r => {
    if (vehicleFilter !== 'All' && r.vehicle !== vehicleFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  // Per-vehicle breakdown
  const vehicleBreakdown = vehicles.map(v => {
    const vRecords = records.filter(r => r.vehicle === v);
    return {
      vehicle: v,
      totalCost: vRecords.reduce((s, r) => s + r.cost, 0),
      count: vRecords.length,
      inProgress: vRecords.filter(r => r.status === 'In Progress').length,
      completed: vRecords.filter(r => r.status === 'Completed').length,
    };
  }).filter(v => v.count > 0).sort((a, b) => b.totalCost - a.totalCost);

  // Per-service breakdown
  const serviceBreakdown = serviceTypes.map(s => {
    const sRecords = records.filter(r => r.service === s);
    return {
      service: s,
      totalCost: sRecords.reduce((sum, r) => sum + r.cost, 0),
      count: sRecords.length,
    };
  }).filter(s => s.count > 0).sort((a, b) => b.totalCost - a.totalCost);

  const nextId = Math.max(0, ...records.map(r => r.id)) + 1;

  const handleSave = () => {
    if (!form.vehicle || !form.serviceType) return;
    setRecords([{
      id: nextId,
      vehicle: form.vehicle,
      service: form.serviceType,
      cost: Number(form.cost) || 0,
      date: form.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'In Progress',
    }, ...records]);
    setForm({ vehicle: '', serviceType: '', cost: '', date: '' });
    setShowForm(false);
  };

  const handleComplete = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  return (
    <Sidebar>
      <div className="p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Maintenance</h1>
            <p className="text-sm text-muted-foreground">
              {records.length} records · {inProgressCount} in progress
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
            {showForm ? 'Close' : '+ Log Service'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">TOTAL SPEND</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">{records.length} records</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">IN PROGRESS</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground mt-1">vehicles in shop</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">COMPLETED</p>
            <p className="text-2xl font-bold mt-1 text-green-500">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">services done</p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-primary/5">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">AVG COST</p>
            <p className="text-2xl font-bold mt-1">₹{formatCurrency(Math.round(avgCost))}</p>
            <p className="text-xs text-muted-foreground mt-1">per service</p>
          </div>
        </div>

        {/* Service Log */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold tracking-wider">SERVICE LOG</h2>
            <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v ?? 'All')}>
              <SelectTrigger className="w-[130px] bg-secondary border-border h-8 text-sm">
                <SelectValue placeholder="Vehicle: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Vehicle: All</SelectItem>
                {vehicles.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
              <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inline Form */}
          {showForm && (
            <div className="border border-border rounded-lg p-4 mb-4 bg-secondary/30">
              <h3 className="text-sm font-bold tracking-wider mb-3">LOG SERVICE RECORD</h3>
              <div className="grid grid-cols-4 gap-3">
                <Select value={form.vehicle} onValueChange={(val) => setForm({ ...form, vehicle: val ?? '' })}>
                  <SelectTrigger className="bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.serviceType} onValueChange={(val) => setForm({ ...form, serviceType: val ?? '' })}>
                  <SelectTrigger className="bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="number" placeholder="Cost (₹)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                <DatePicker value={form.date} onChange={(val) => setForm({ ...form, date: val })} placeholder="Date" className="bg-transparent border-border h-[38px]" />
              </div>
              <div className="flex gap-3 mt-3">
                <Button onClick={handleSave} disabled={!form.vehicle || !form.serviceType} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">
                  Save
                </Button>
                <Button onClick={() => setShowForm(false)} className="bg-transparent border border-border text-sm font-medium px-6 py-2 rounded transition-colors hover:bg-secondary">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">SERVICE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">DATE</TableHead>
                  <TableHead className="text-right p-3 font-semibold">COST</TableHead>
                  <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{log.vehicle}</TableCell>
                    <TableCell className="p-3">{log.service}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{log.date}</TableCell>
                    <TableCell className="p-3 text-right font-medium">₹{formatCurrency(log.cost)}</TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={log.status} />
                        {log.status === 'In Progress' && (
                          <Button onClick={() => handleComplete(log.id)} className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded">
                            Close
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Per-Vehicle Breakdown */}
        {vehicleBreakdown.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">PER-VEHICLE BREAKDOWN</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                    <TableHead className="text-right p-3 font-semibold">SERVICES</TableHead>
                    <TableHead className="text-right p-3 font-semibold">IN PROGRESS</TableHead>
                    <TableHead className="text-right p-3 font-semibold">COMPLETED</TableHead>
                    <TableHead className="text-right p-3 font-semibold">TOTAL COST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleBreakdown.map((v) => (
                    <TableRow key={v.vehicle} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{v.vehicle}</TableCell>
                      <TableCell className="p-3 text-right">{v.count}</TableCell>
                      <TableCell className="p-3 text-right">{v.inProgress > 0 ? <span className="text-amber-500">{v.inProgress}</span> : '—'}</TableCell>
                      <TableCell className="p-3 text-right">{v.completed > 0 ? <span className="text-green-500">{v.completed}</span> : '—'}</TableCell>
                      <TableCell className="p-3 text-right font-medium">₹{formatCurrency(v.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Per-Service Breakdown */}
        {serviceBreakdown.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">PER-SERVICE BREAKDOWN</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <TableHead className="text-left p-3 font-semibold">SERVICE TYPE</TableHead>
                    <TableHead className="text-right p-3 font-semibold">COUNT</TableHead>
                    <TableHead className="text-right p-3 font-semibold">AVG COST</TableHead>
                    <TableHead className="text-right p-3 font-semibold">TOTAL COST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceBreakdown.map((s) => (
                    <TableRow key={s.service} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{s.service}</TableCell>
                      <TableCell className="p-3 text-right">{s.count}</TableCell>
                      <TableCell className="p-3 text-right">₹{formatCurrency(Math.round(s.totalCost / s.count))}</TableCell>
                      <TableCell className="p-3 text-right font-medium">₹{formatCurrency(s.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      </div>
    </Sidebar>
  );
}
