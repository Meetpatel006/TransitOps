'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

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
                <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm">
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
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
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded transition-colors">
                Save
              </button>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <th className="text-left p-3 font-semibold">VEHICLE</th>
                    <th className="text-left p-3 font-semibold">SERVICE</th>
                    <th className="text-left p-3 font-semibold">COST</th>
                    <th className="text-left p-3 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="p-3">{log.vehicle}</td>
                      <td className="p-3">{log.service}</td>
                      <td className="p-3">{log.cost.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            log.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {log.status}
                          </span>
                          {log.status === 'In Progress' && (
                            <button onClick={() => handleComplete(log.id)} className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded">
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
