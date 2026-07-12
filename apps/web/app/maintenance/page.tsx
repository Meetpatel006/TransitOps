'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { maintenanceService } from '@/services/maintenance';
import { vehiclesService } from '@/services/vehicles';
import { ResourceGuard } from '@/components/resource-guard';
import { useAuth } from '@/hooks/use-auth';
import { canWrite } from '@/lib/rbac';
import type { MaintenanceLog, Vehicle } from '@transitops/shared';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const serviceTypes = ['Oil Change', 'Engine Repair', 'Tyre Replace', 'Brake Service', 'Battery Replace', 'AC Service', 'General Service', 'Clutch Repair'];

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const canWriteFleet = canWrite(user?.role_name, 'fleet');
  const [records, setRecords] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_id: '', serviceType: '', cost: '' });
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAll = () => Promise.all([maintenanceService.list(), vehiclesService.list()])
    .then(([r, v]) => { setRecords(r); setVehicles(v); })
    .catch(console.error)
    .finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v.name_model]));

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const inProgressCount = records.filter(r => r.status === 'Open').length;
  const completedCount = records.filter(r => r.status === 'Closed').length;
  const avgCost = records.length > 0 ? totalCost / records.length : 0;

  const filtered = records.filter(r => {
    if (vehicleFilter !== 'All' && vehicleMap[r.vehicle_id] !== vehicleFilter) return false;
    const displayStatus = r.status === 'Open' ? 'In Progress' : 'Completed';
    if (statusFilter !== 'All' && displayStatus !== statusFilter) return false;
    return true;
  });

  const vehicleBreakdown = vehicles.map(v => {
    const vRecords = records.filter(r => r.vehicle_id === v.id);
    return {
      vehicle: v.name_model,
      totalCost: vRecords.reduce((s, r) => s + r.cost, 0),
      count: vRecords.length,
      inProgress: vRecords.filter(r => r.status === 'Open').length,
      completed: vRecords.filter(r => r.status === 'Closed').length,
    };
  }).filter(v => v.count > 0).sort((a, b) => b.totalCost - a.totalCost);

  const serviceBreakdown = serviceTypes.map(s => {
    const sRecords = records.filter(r => r.title === s);
    return {
      service: s,
      totalCost: sRecords.reduce((sum, r) => sum + r.cost, 0),
      count: sRecords.length,
    };
  }).filter(s => s.count > 0).sort((a, b) => b.totalCost - a.totalCost);

  const handleSave = async () => {
    if (!form.vehicle_id || !form.serviceType) return;
    try {
      await maintenanceService.create({
        vehicle_id: Number(form.vehicle_id),
        title: form.serviceType,
        cost: Number(form.cost) || 0,
      });
      await fetchAll();
      setForm({ vehicle_id: '', serviceType: '', cost: '' });
      setShowForm(false);
    } catch {}
  };

  const handleComplete = async (id: number) => {
    try { await maintenanceService.update(id, { status: 'Closed' }); await fetchAll(); } catch {}
  };

  if (loading) return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  return (
    <ResourceGuard resource="fleet">
    <Sidebar>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Maintenance</h1>
            <p className="text-sm text-muted-foreground">{records.length} records · {inProgressCount} in progress</p>
          </div>
          {canWriteFleet && (
            <Button onClick={() => setShowForm(!showForm)} className="text-sm font-medium px-4 py-2 rounded transition-colors">
              {showForm ? 'Close' : '+ Log Service'}
            </Button>
          )}
        </div>

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

        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold tracking-wider">SERVICE LOG</h2>
            <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v ?? 'All')}>
              <SelectTrigger className="w-[130px] bg-secondary border-border h-8 text-sm">
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {vehicles.map(v => <SelectItem key={v.id} value={v.name_model}>{v.name_model}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
              <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showForm && (
            <div className="border border-border rounded-lg p-4 mb-4 bg-secondary/30">
              <h3 className="text-sm font-bold tracking-wider mb-3">LOG SERVICE RECORD</h3>
              <div className="grid grid-cols-4 gap-3">
                <Select value={form.vehicle_id} onValueChange={(val) => setForm({ ...form, vehicle_id: val ?? '' })}>
                  <SelectTrigger className="bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name_model}</SelectItem>)}
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
              </div>
              <div className="flex gap-3 mt-3">
                <Button onClick={handleSave} disabled={!form.vehicle_id || !form.serviceType} className="text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">Save</Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="text-sm font-medium px-6 py-2 rounded transition-colors">Cancel</Button>
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
                {filtered.map((log) => {
                  const displayStatus = log.status === 'Open' ? 'In Progress' : 'Completed';
                  return (
                    <TableRow key={log.id} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{vehicleMap[log.vehicle_id] || `Vehicle #${log.vehicle_id}`}</TableCell>
                      <TableCell className="p-3">{log.title}</TableCell>
                      <TableCell className="p-3 text-muted-foreground">{formatDate(log.start_date)}</TableCell>
                      <TableCell className="p-3 text-right font-medium">₹{formatCurrency(log.cost)}</TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={displayStatus} />
                          {log.status === 'Open' && canWriteFleet && (
                            <Button size="sm" onClick={() => handleComplete(log.id)} className="text-xs font-semibold">Close</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

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
    </ResourceGuard>
  );
}
