'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
interface Vehicle {
  id: number;
  registration_number: string;
  name_model: string;
  type: 'Van' | 'Truck' | 'Mini';
  capacity_kg: number;
  odometer: number;
  acquisition_cost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
}
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

const initialVehicles: Vehicle[] = [
  { id: 1, registration_number: 'GJ01AB4521', name_model: 'VAN-05', type: 'Van', capacity_kg: 500, odometer: 74000, acquisition_cost: 620000, status: 'Available' },
  { id: 2, registration_number: 'GJ01AB9981', name_model: 'TRUCK-12', type: 'Truck', capacity_kg: 5000, odometer: 182000, acquisition_cost: 2450000, status: 'On Trip' },
  { id: 3, registration_number: 'GJ01AB1120', name_model: 'MINI-08', type: 'Mini', capacity_kg: 1000, odometer: 66000, acquisition_cost: 410000, status: 'In Shop' },
  { id: 4, registration_number: 'GJ01AB0008', name_model: 'VAN-09', type: 'Van', capacity_kg: 750, odometer: 241900, acquisition_cost: 590000, status: 'Retired' },
];

function formatCost(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function formatOdometer(n: number) {
  return n.toLocaleString('en-IN') + ' km';
}

const emptyForm: { registration_number: string; name_model: string; type: 'Van' | 'Truck' | 'Mini'; capacity_kg: string; odometer: string; acquisition_cost: string } = { registration_number: '', name_model: '', type: 'Van', capacity_kg: '', odometer: '', acquisition_cost: '' };

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
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
      type: v.type,
      capacity_kg: String(v.capacity_kg),
      odometer: String(v.odometer),
      acquisition_cost: String(v.acquisition_cost),
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = () => {
    setFormError('');
    if (!form.registration_number || !form.name_model) {
      setFormError('Registration No. and Name are required');
      return;
    }
    const isDuplicate = vehicles.some(v => v.registration_number === form.registration_number && v.id !== editingId);
    if (isDuplicate) {
      setFormError('Registration No. must be unique');
      return;
    }
    if (editingId !== null) {
      setVehicles(vehicles.map(v => v.id === editingId ? {
        ...v,
        registration_number: form.registration_number,
        name_model: form.name_model,
        type: form.type,
        capacity_kg: Number(form.capacity_kg) || 0,
        odometer: Number(form.odometer) || 0,
        acquisition_cost: Number(form.acquisition_cost) || 0,
      } : v));
    } else {
      const nextId = Math.max(0, ...vehicles.map(v => v.id)) + 1;
      setVehicles([...vehicles, {
        id: nextId,
        registration_number: form.registration_number,
        name_model: form.name_model,
        type: form.type,
        capacity_kg: Number(form.capacity_kg) || 0,
        odometer: Number(form.odometer) || 0,
        acquisition_cost: Number(form.acquisition_cost) || 0,
        status: 'Available',
      }]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Fleet</h1>
            <p className="text-sm text-muted-foreground">
              {vehicles.length} total · {availableCount} available
            </p>
          </div>
          <Button onClick={openAdd} className="bg-chart-4 hover:bg-chart-4/90 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
            + Add Vehicle
          </Button>
        </div>

        {/* Stat Cards */}
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

        {/* Filters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'All')}>
            <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Type: All</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Mini">Mini</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Status: All</SelectItem>
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

        {/* Add/Edit Form */}
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
                <input type="number" placeholder="500" value={form.capacity_kg} onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
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
              <Button onClick={handleSave} disabled={!form.registration_number || !form.name_model} className="bg-chart-4 hover:bg-chart-4/90 text-white text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">
                {editingId !== null ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-transparent border border-border text-sm font-medium px-6 py-2 rounded transition-colors hover:bg-secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
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
                  <TableCell className="p-3 text-right">{v.capacity_kg.toLocaleString('en-IN')} kg</TableCell>
                  <TableCell className="p-3 text-right">{formatOdometer(v.odometer)}</TableCell>
                  <TableCell className="p-3 text-right">{formatCost(v.acquisition_cost)}</TableCell>
                  <TableCell className="p-3">
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    {deleteConfirmId === v.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">Delete?</span>
                        <Button onClick={() => handleDelete(v.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Yes</Button>
                        <Button onClick={() => setDeleteConfirmId(null)} className="text-xs bg-transparent border border-border px-2 py-1 rounded hover:bg-secondary">No</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => openEdit(v)} className="text-xs bg-transparent border border-border px-2 py-1 rounded hover:bg-secondary">Edit</Button>
                        <Button onClick={() => setDeleteConfirmId(v.id)} className="text-xs bg-transparent border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">Delete</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Rule note */}
        <p className="text-xs text-chart-4 italic">
          Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
        </p>
      </div>
    </Sidebar>
  );
}
