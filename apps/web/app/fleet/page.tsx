'use client';
import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

const initialVehicles = [
  { regNo: 'GJ01AB4521', name: 'VAN-05', type: 'Van', capacity: 500, capacityUnit: 'kg', odometer: 74000, acqCost: 620000, status: 'Available' },
  { regNo: 'GJ01AB9981', name: 'TRUCK-12', type: 'Truck', capacity: 5000, capacityUnit: 'kg', odometer: 182000, acqCost: 2450000, status: 'On Trip' },
  { regNo: 'GJ01AB1120', name: 'MINI-08', type: 'Mini', capacity: 1000, capacityUnit: 'kg', odometer: 66000, acqCost: 410000, status: 'In Shop' },
  { regNo: 'GJ01AB0008', name: 'VAN-09', type: 'Van', capacity: 750, capacityUnit: 'kg', odometer: 241900, acqCost: 590000, status: 'Retired' },
];

const statusColors: Record<string, string> = {
  'Available': 'bg-primary',
  'On Trip': 'bg-chart-1',
  'In Shop': 'bg-chart-4',
  'Retired': 'bg-red-400',
};

function formatCost(n: number) {
  return n.toLocaleString('en-IN');
}

function formatOdometer(n: number) {
  return n.toLocaleString('en-IN');
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ regNo: '', name: '', type: 'Van', capacity: '', odometer: '', acqCost: '' });
  const [error, setError] = useState('');

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search && !v.regNo.toLowerCase().includes(search.toLowerCase()) && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = () => {
    setError('');
    if (!form.regNo || !form.name) {
      setError('Registration No. and Name are required');
      return;
    }
    if (vehicles.some((v) => v.regNo === form.regNo)) {
      setError('Registration No. must be unique');
      return;
    }
    setVehicles([...vehicles, {
      regNo: form.regNo,
      name: form.name,
      type: form.type,
      capacity: Number(form.capacity) || 0,
      capacityUnit: 'kg',
      odometer: Number(form.odometer) || 0,
      acqCost: Number(form.acqCost) || 0,
      status: 'Available',
    }]);
    setForm({ regNo: '', name: '', type: 'Van', capacity: '', odometer: '', acqCost: '' });
    setShowForm(false);
  };

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <input type="text" placeholder="Search reg. no..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary border border-border rounded px-3 py-1.5 text-sm" />

          <div className="flex-1" />

          <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
              <Button className="bg-chart-4 hover:bg-chart-4 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                + Add Vehicle
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Add Vehicle</h4>
                  <p className="text-sm text-muted-foreground">Enter new vehicle details.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <input placeholder="Reg. No." value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <input placeholder="Name/Model" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                    <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Van">Van</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Mini">Mini</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="number" placeholder="Capacity (kg)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <input type="number" placeholder="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <input type="number" placeholder="Acq. Cost" value={form.acqCost} onChange={(e) => setForm({ ...form, acqCost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <Button onClick={handleAdd} className="bg-primary hover:bg-primary text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                <TableHead className="text-left p-3 font-semibold">REG. NO. (UNIQUE)</TableHead>
                <TableHead className="text-left p-3 font-semibold">NAME/MODE</TableHead>
                <TableHead className="text-left p-3 font-semibold">TYPE</TableHead>
                <TableHead className="text-left p-3 font-semibold">CAPACITY</TableHead>
                <TableHead className="text-left p-3 font-semibold">ODOMETER</TableHead>
                <TableHead className="text-left p-3 font-semibold">ACQ. COST</TableHead>
                <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.regNo} className="border-b border-border last:border-0">
                  <TableCell className="p-3 font-medium">{v.regNo}</TableCell>
                  <TableCell className="p-3">{v.name}</TableCell>
                  <TableCell className="p-3">{v.type}</TableCell>
                  <TableCell className="p-3">{v.capacity} {v.capacityUnit}</TableCell>
                  <TableCell className="p-3">{formatOdometer(v.odometer)}</TableCell>
                  <TableCell className="p-3">{formatCost(v.acqCost)}</TableCell>
                  <TableCell className="p-3">
                    <StatusBadge status={v.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-chart-4 italic mt-3">
          Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
        </p>
      </div>
    </Sidebar>
  );
}
