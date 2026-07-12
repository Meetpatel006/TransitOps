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

const initialRecords: MaintenanceRecord[] = [
  { id: 1, vehicle: 'VAN-05', service: 'Oil Change', cost: 2800, date: '05 Jul 2026', status: 'In Progress' },
  { id: 2, vehicle: 'TRUCK-12', service: 'Engine Repair', cost: 18000, date: '06 Jul 2026', status: 'Completed' },
  { id: 3, vehicle: 'MINI-08', service: 'Tyre Replace', cost: 6200, date: '06 Jul 2026', status: 'In Progress' },
];

export default function MaintenancePage() {
  const [records, setRecords] = useState(initialRecords);
  const [form, setForm] = useState({ vehicle: '', serviceType: '', cost: '', date: '', status: 'Available' });
  const [nextId, setNextId] = useState(4);

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
    setNextId(nextId + 1);
    setForm({ vehicle: '', serviceType: '', cost: '', date: '', status: 'Available' });
  };

  const handleComplete = (id: number) => {
    setRecords(records.map((r) => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  return (
    <Sidebar>
      <div className="p-6">
        <h1 className="text-3xl font-bold italic mb-6">5. Maintenance</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Log Service Record */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">LOG SERVICE RECORD</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">VEHICLE</label>
                <Select value={form.vehicle} onValueChange={(val) => setForm({ ...form, vehicle: val })}>
                  <SelectTrigger className="w-full bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">SERVICE TYPE</label>
                <input type="text" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Oil Change" className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">COST</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="2800" className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DATE</label>
                <DatePicker value={form.date} onChange={(val) => setForm({ ...form, date: val })} placeholder="Date" className="bg-transparent border-border h-[38px] w-full" />
              </div>

              <Button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded transition-colors">
                Save
              </Button>
            </div>

            {/* Status Flow */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">Available</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-amber-400">In Shop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">In Shop</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-green-400">Available</span>
              </div>
              <p className="text-xs text-amber-400 italic mt-2">
                Note: In Shop vehicles are removed from the dispatch pool.
              </p>
            </div>
          </div>

          {/* Service Log Table */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">SERVICE LOG</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                    <TableHead className="text-left p-3 font-semibold">SERVICE</TableHead>
                    <TableHead className="text-left p-3 font-semibold">COST</TableHead>
                    <TableHead className="text-left p-3 font-semibold">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((log) => (
                    <TableRow key={log.id} className="border-b border-border last:border-0">
                      <TableCell className="p-3">{log.vehicle}</TableCell>
                      <TableCell className="p-3">{log.service}</TableCell>
                      <TableCell className="p-3">{log.cost.toLocaleString()}</TableCell>
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
        </div>
      </div>
    </Sidebar>
  );
}
