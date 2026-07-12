'use client';
import { Button } from '@/components/ui/button';


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

const rbacData = [
  { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuelExp: '—', analytics: '✓' },
  { role: 'Dispatcher', fleet: 'view', drivers: '—', trips: '✓', fuelExp: '—', analytics: '—' },
  { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'view', fuelExp: '—', analytics: '—' },
  { role: 'Financial Analyst', fleet: 'view', drivers: '—', trips: '—', fuelExp: '✓', analytics: '✓' },
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    depotName: 'Gandhinagar Depot GJW',
    currency: 'INR (₹)',
    distanceUnit: 'Kilometers',
  });

  return (
    <Sidebar>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-12">
          {/* General */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">GENERAL</h2>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DEPOT NAME</label>
                <input
                  type="text"
                  value={form.depotName}
                  onChange={(e) => setForm({ ...form, depotName: e.target.value })}
                  className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CURRENCY</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DISTANCE UNIT</label>
                <input
                  type="text"
                  value={form.distanceUnit}
                  onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })}
                  className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm"
                />
              </div>

              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded transition-colors">
                Save changes
              </Button>
            </div>
          </div>

          {/* RBAC */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">ROLE-BASED ACCESS (RBAC)</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <TableHead className="text-left p-3 font-semibold">ROLE</TableHead>
                    <TableHead className="text-center p-3 font-semibold">FLEET</TableHead>
                    <TableHead className="text-center p-3 font-semibold">DRIVERS</TableHead>
                    <TableHead className="text-center p-3 font-semibold">TRIPS</TableHead>
                    <TableHead className="text-center p-3 font-semibold">FUEL/EXP</TableHead>
                    <TableHead className="text-center p-3 font-semibold">ANALYTICS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rbacData.map((row) => (
                    <TableRow key={row.role} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{row.role}</TableCell>
                      <TableCell className="p-3 text-center">{row.fleet}</TableCell>
                      <TableCell className="p-3 text-center">{row.drivers}</TableCell>
                      <TableCell className="p-3 text-center">{row.trips}</TableCell>
                      <TableCell className="p-3 text-center">{row.fuelExp}</TableCell>
                      <TableCell className="p-3 text-center">{row.analytics}</TableCell>
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
