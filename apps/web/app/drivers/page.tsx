'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: 'LMV' | 'HMV';
  license_expiry: string;
  contact: string;
  safety_score: number;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
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
import { DatePicker } from "@/components/ui/date-picker";

const initialDrivers: Driver[] = [
  { id: 1, name: 'Alex', license_number: 'DL-88213', license_category: 'LMV', license_expiry: '2028-12-01', contact: '98765xxxxx', safety_score: 96, status: 'Available' },
  { id: 2, name: 'John', license_number: 'DL-44120', license_category: 'HMV', license_expiry: '2025-03-01', contact: '98220xxxxx', safety_score: 91, status: 'Suspended' },
  { id: 3, name: 'Priya', license_number: 'DL-77031', license_category: 'LMV', license_expiry: '2027-08-01', contact: '99110xxxxx', safety_score: 99, status: 'On Trip' },
  { id: 4, name: 'Suresh', license_number: 'DL-90045', license_category: 'HMV', license_expiry: '2027-01-01', contact: '97440xxxxx', safety_score: 88, status: 'Off Duty' },
];

function getSafetyColor(score: number) {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function isLicenseExpired(expiry: string) {
  return new Date(expiry) < new Date();
}

const emptyForm: { name: string; license_number: string; license_category: 'LMV' | 'HMV'; license_expiry: string; contact: string; safety_score: string } = { name: '', license_number: '', license_category: 'LMV', license_expiry: '', contact: '', safety_score: '90' };

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filtered = drivers.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.license_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const availableCount = drivers.filter(d => d.status === 'Available').length;
  const onTripCount = drivers.filter(d => d.status === 'On Trip').length;
  const suspendedCount = drivers.filter(d => d.status === 'Suspended').length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (d: Driver) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      license_number: d.license_number,
      license_category: d.license_category,
      license_expiry: d.license_expiry,
      contact: d.contact,
      safety_score: String(d.safety_score),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.license_number) return;
    if (editingId !== null) {
      setDrivers(drivers.map(d => d.id === editingId ? {
        ...d,
        name: form.name,
        license_number: form.license_number,
        license_category: form.license_category,
        license_expiry: form.license_expiry,
        contact: form.contact,
        safety_score: Number(form.safety_score) || 90,
      } : d));
    } else {
      const nextId = Math.max(0, ...drivers.map(d => d.id)) + 1;
      setDrivers([...drivers, {
        id: nextId,
        name: form.name,
        license_number: form.license_number,
        license_category: form.license_category,
        license_expiry: form.license_expiry,
        contact: form.contact,
        safety_score: Number(form.safety_score) || 90,
        status: 'Available',
      }]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setDrivers(drivers.filter(d => d.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Drivers</h1>
            <p className="text-sm text-muted-foreground">
              {drivers.length} total · {availableCount} available
            </p>
          </div>
          <Button onClick={openAdd} className="bg-chart-4 hover:bg-chart-4/90 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
            + Add Driver
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">TOTAL DRIVERS</p>
            <p className="text-2xl font-bold mt-1">{drivers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">registered</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">AVAILABLE</p>
            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{availableCount}</p>
            <p className="text-xs text-muted-foreground mt-1">ready for trips</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">ON TRIP</p>
            <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{onTripCount}</p>
            <p className="text-xs text-muted-foreground mt-1">currently driving</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">SUSPENDED</p>
            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{suspendedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">blocked from trips</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Status: All</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="On Trip">On Trip</SelectItem>
              <SelectItem value="Off Duty">Off Duty</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Search name or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border border-border rounded px-3 py-1.5 text-sm"
          />
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="border border-border rounded-lg p-4 bg-secondary/30">
            <h2 className="text-sm font-bold tracking-wider mb-4">{editingId !== null ? 'EDIT DRIVER' : 'ADD DRIVER'}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">NAME</label>
                <input placeholder="Driver name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">LICENSE NO.</label>
                <input placeholder="DL-XXXXX" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CATEGORY</label>
                <Select value={form.license_category} onValueChange={(val) => setForm({ ...form, license_category: val as 'LMV' | 'HMV' })}>
                  <SelectTrigger className="bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LMV">LMV</SelectItem>
                    <SelectItem value="HMV">HMV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">EXPIRY DATE</label>
                <DatePicker value={form.license_expiry} onChange={(val) => setForm({ ...form, license_expiry: val })} placeholder="Expiry date" className="bg-transparent border-border h-[38px]" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CONTACT</label>
                <input placeholder="Phone number" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">SAFETY SCORE</label>
                <input type="number" placeholder="0-100" value={form.safety_score} onChange={(e) => setForm({ ...form, safety_score: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSave} disabled={!form.name || !form.license_number} className="bg-chart-4 hover:bg-chart-4/90 text-white text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">
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
                <TableHead className="text-left p-3 font-semibold">DRIVER</TableHead>
                <TableHead className="text-left p-3 font-semibold">LICENSE NO.</TableHead>
                <TableHead className="text-left p-3 font-semibold">CATEGORY</TableHead>
                <TableHead className="text-left p-3 font-semibold">EXPIRY</TableHead>
                <TableHead className="text-left p-3 font-semibold">CONTACT</TableHead>
                <TableHead className="text-left p-3 font-semibold">SAFETY SCORE</TableHead>
                <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
                <TableHead className="text-right p-3 font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const expired = isLicenseExpired(d.license_expiry);
                return (
                  <TableRow key={d.id} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{d.name}</TableCell>
                    <TableCell className="p-3 font-mono text-xs">{d.license_number}</TableCell>
                    <TableCell className="p-3">{d.license_category}</TableCell>
                    <TableCell className={`p-3 ${expired ? 'text-destructive font-bold' : ''}`}>
                      {d.license_expiry}{expired ? ' EXPIRED' : ''}
                    </TableCell>
                    <TableCell className="p-3">{d.contact}</TableCell>
                    <TableCell className="p-3">
                      <span className={`font-bold ${getSafetyColor(d.safety_score)}`}>{d.safety_score}%</span>
                    </TableCell>
                    <TableCell className="p-3">
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      {deleteConfirmId === d.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">Delete?</span>
                          <Button onClick={() => handleDelete(d.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Yes</Button>
                          <Button onClick={() => setDeleteConfirmId(null)} className="text-xs bg-transparent border border-border px-2 py-1 rounded hover:bg-secondary">No</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEdit(d)} className="text-xs bg-transparent border border-border px-2 py-1 rounded hover:bg-secondary">Edit</Button>
                          <Button onClick={() => setDeleteConfirmId(d.id)} className="text-xs bg-transparent border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">Delete</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Rule note */}
        <p className="text-xs text-chart-4 italic">
          Rule: Expired license or Suspended status = blocked from trip assignment
        </p>
      </div>
    </Sidebar>
  );
}
