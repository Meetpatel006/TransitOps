'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { vehiclesService } from '@/services/vehicles';
import { ResourceGuard } from '@/components/resource-guard';
import { useAuth } from '@/hooks/use-auth';
import { canWrite } from '@/lib/rbac';
import type { Vehicle } from '@transitops/shared';
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

function formatCost(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function formatOdometer(n: number) {
  return n.toLocaleString('en-IN') + ' km';
}

const emptyForm = { registration_number: '', name_model: '', type: 'Van' as 'Van' | 'Truck' | 'Mini', maximum_load_capacity: '', odometer: '', acquisition_cost: '' };

export default function FleetPage() {
  const { user } = useAuth();
  const canWriteFleet = canWrite(user?.role_name, 'fleet');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchVehicles = () => vehiclesService.list().then(setVehicles).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles.filter((v) => {
    if (typeFilter && typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter && statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search && !v.registration_number.toLowerCase().includes(search.toLowerCase()) && !v.name_model.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const availableCount = vehicles.filter(v => v.status === 'Available').length;
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length;
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({
      registration_number: v.registration_number,
      name_model: v.name_model,
      type: v.type as 'Van' | 'Truck' | 'Mini',
      maximum_load_capacity: String(v.maximum_load_capacity),
      odometer: String(v.odometer),
      acquisition_cost: String(v.acquisition_cost),
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.registration_number || !form.name_model) {
      setFormError('Registration No. and Name are required');
      return;
    }
    const payload = {
      registration_number: form.registration_number,
      name_model: form.name_model,
      type: form.type,
      maximum_load_capacity: Number(form.maximum_load_capacity) || 0,
      odometer: Number(form.odometer) || 0,
      acquisition_cost: Number(form.acquisition_cost) || 0,
    };
    try {
      if (editingId !== null) {
        await vehiclesService.update(editingId, payload);
      } else {
        await vehiclesService.create(payload);
      }
      await fetchVehicles();
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await vehiclesService.remove(id);
      await fetchVehicles();
    } catch {}
    setDeleteConfirmId(null);
  };

  if (loading) return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  return (
    <ResourceGuard resource="fleet">
    <Sidebar>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Fleet</h1>
            <p className="text-sm text-muted-foreground">
              {vehicles.length} total · {availableCount} available
            </p>
          </div>
          {canWriteFleet && (
            <Button onClick={openAdd} className="text-sm font-medium px-4 py-2 rounded transition-colors">
              + Add Vehicle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">TOTAL VEHICLES</p>
            <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">in fleet</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">AVAILABLE</p>
            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{availableCount}</p>
            <p className="text-xs text-muted-foreground mt-1">ready for dispatch</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">ON TRIP</p>
            <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{onTripCount}</p>
            <p className="text-xs text-muted-foreground mt-1">currently active</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">IN MAINTENANCE</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{inShopCount}</p>
            <p className="text-xs text-muted-foreground mt-1">in shop</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
            <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Mini">Mini</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="On Trip">On Trip</SelectItem>
              <SelectItem value="In Shop">In Shop</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Search reg. no. or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border border-border rounded px-3 py-1.5 text-sm"
          />
        </div>

        {showForm && (
          <div className="border border-border rounded-lg p-4 bg-secondary/30">
            <h2 className="text-sm font-bold tracking-wider mb-4">{editingId !== null ? 'EDIT VEHICLE' : 'ADD VEHICLE'}</h2>
            {formError && <p className="text-destructive text-sm mb-3">{formError}</p>}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">REG. NO.</label>
                <input placeholder="GJ01AB0000" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">NAME / MODEL</label>
                <input placeholder="VAN-05" value={form.name_model} onChange={(e) => setForm({ ...form, name_model: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">TYPE</label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val as 'Van' | 'Truck' | 'Mini' })}>
                  <SelectTrigger className="bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Mini">Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CAPACITY (KG)</label>
                <input type="number" placeholder="500" value={form.maximum_load_capacity} onChange={(e) => setForm({ ...form, maximum_load_capacity: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">ODOMETER</label>
                <input type="number" placeholder="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">ACQ. COST (₹)</label>
                <input type="number" placeholder="0" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave} disabled={!form.registration_number || !form.name_model} className="text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">
                {editingId !== null ? 'Update' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-sm font-medium px-6 py-2 rounded transition-colors">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                <TableHead className="text-left p-3 font-semibold">REG. NO.</TableHead>
                <TableHead className="text-left p-3 font-semibold">NAME / MODEL</TableHead>
                <TableHead className="text-left p-3 font-semibold">TYPE</TableHead>
                <TableHead className="text-right p-3 font-semibold">CAPACITY</TableHead>
                <TableHead className="text-right p-3 font-semibold">ODOMETER</TableHead>
                <TableHead className="text-right p-3 font-semibold">ACQ. COST</TableHead>
                <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
                <TableHead className="text-right p-3 font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} className="border-b border-border last:border-0">
                  <TableCell className="p-3 font-mono font-medium text-xs">{v.registration_number}</TableCell>
                  <TableCell className="p-3">{v.name_model}</TableCell>
                  <TableCell className="p-3">{v.type}</TableCell>
                  <TableCell className="p-3 text-right">{v.maximum_load_capacity.toLocaleString('en-IN')} kg</TableCell>
                  <TableCell className="p-3 text-right">{formatOdometer(v.odometer)}</TableCell>
                  <TableCell className="p-3 text-right">{formatCost(v.acquisition_cost)}</TableCell>
                  <TableCell className="p-3">
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    {canWriteFleet && (
                      deleteConfirmId === v.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">Delete?</span>
                          <Button variant="destructive" onClick={() => handleDelete(v.id)} className="text-xs px-2 py-1 rounded">Yes</Button>
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 rounded">No</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" onClick={() => openEdit(v)} className="text-xs px-2 py-1 rounded">Edit</Button>
                          <Button variant="destructive" onClick={() => setDeleteConfirmId(v.id)} className="text-xs px-2 py-1 rounded">Delete</Button>
                        </div>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-chart-4 italic">
          Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
        </p>
      </div>
    </Sidebar>
    </ResourceGuard>
  );
}
