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
import { DatePicker } from "@/components/ui/date-picker";

const initialDrivers = [
  { name: 'Alex', license: 'DL-88213', category: 'LMV', expiry: '2028-12-01', contact: '98765xxxxx', safetyScore: 96, status: 'Available' },
  { name: 'John', license: 'DL-44120', category: 'HMV', expiry: '2025-03-01', contact: '98220xxxxx', safetyScore: 91, status: 'Suspended' },
  { name: 'Priya', license: 'DL-77031', category: 'LMV', expiry: '2027-08-01', contact: '99110xxxxx', safetyScore: 99, status: 'On Trip' },
  { name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '2027-01-01', contact: '97440xxxxx', safetyScore: 88, status: 'Off Duty' },
];

const statusColors: Record<string, string> = {
  'Available': 'bg-primary',
  'On Trip': 'bg-chart-1',
  'Off Duty': 'bg-muted',
  'Suspended': 'bg-chart-2',
};

function getSafetyColor(score: number) {
  if (score >= 90) return 'text-primary';
  if (score >= 70) return 'text-chart-4';
  return 'text-destructive';
}

function isLicenseExpired(expiry: string) {
  const exp = new Date(expiry);
  return exp < new Date();
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', license: '', category: 'LMV', expiry: '', contact: '', safetyScore: '90' });

  const handleAdd = () => {
    if (!form.name || !form.license) return;
    setDrivers([...drivers, {
      name: form.name,
      license: form.license,
      category: form.category,
      expiry: form.expiry,
      contact: form.contact,
      safetyScore: Number(form.safetyScore) || 90,
      status: 'Available',
    }]);
    setForm({ name: '', license: '', category: 'LMV', expiry: '', contact: '', safetyScore: '90' });
    setShowForm(false);
  };

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
              <Button className="bg-chart-4 hover:bg-chart-4 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                + Add Driver
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Add Driver</h4>
                  <p className="text-sm text-muted-foreground">Enter driver details to register.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <input placeholder="License No." value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LMV">LMV</SelectItem>
                      <SelectItem value="HMV">HMV</SelectItem>
                    </SelectContent>
                  </Select>
                  <DatePicker value={form.expiry} onChange={(val) => setForm({ ...form, expiry: val })} placeholder="Expiry Date" className="bg-transparent border-border h-[38px]" />
                  <input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
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
                <TableHead className="text-left p-3 font-semibold">DRIVER</TableHead>
                <TableHead className="text-left p-3 font-semibold">LICENSE NO.</TableHead>
                <TableHead className="text-left p-3 font-semibold">CATEGORY</TableHead>
                <TableHead className="text-left p-3 font-semibold">EXPIRY</TableHead>
                <TableHead className="text-left p-3 font-semibold">CONTACT</TableHead>
                <TableHead className="text-left p-3 font-semibold">SAFETY SCORE</TableHead>
                <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.name} className="border-b border-border last:border-0">
                  <TableCell className="p-3 font-medium">{d.name}</TableCell>
                  <TableCell className="p-3">{d.license}</TableCell>
                  <TableCell className="p-3">{d.category}</TableCell>
                  <TableCell className={`p-3 ${isLicenseExpired(d.expiry) ? 'text-destructive font-bold' : ''}`}>
                    {d.expiry}{isLicenseExpired(d.expiry) ? ' EXPIRED' : ''}
                  </TableCell>
                  <TableCell className="p-3">{d.contact}</TableCell>
                  <TableCell className={`p-3 font-bold ${getSafetyColor(d.safetyScore)}`}>{d.safetyScore}%</TableCell>
                  <TableCell className="p-3">
                    <StatusBadge status={d.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-chart-4 italic mt-3">
          Rule: Expired license or Suspended status = blocked from trip assignment
        </p>
      </div>
    </Sidebar>
  );
}
