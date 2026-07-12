'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

const initialVehicles = [
  { regNo: 'GJ01AB4521', name: 'VAN-05', type: 'Van', capacity: 500, capacityUnit: 'kg', odometer: 74000, acqCost: 620000, status: 'Available' },
  { regNo: 'GJ01AB9981', name: 'TRUCK-12', type: 'Truck', capacity: 5000, capacityUnit: 'kg', odometer: 182000, acqCost: 2450000, status: 'On Trip' },
  { regNo: 'GJ01AB1120', name: 'MINI-08', type: 'Mini', capacity: 1000, capacityUnit: 'kg', odometer: 66000, acqCost: 410000, status: 'In Shop' },
  { regNo: 'GJ01AB0008', name: 'VAN-09', type: 'Van', capacity: 750, capacityUnit: 'kg', odometer: 241900, acqCost: 590000, status: 'Retired' },
];

const statusColors: Record<string, string> = {
  'Available': 'bg-green-600',
  'On Trip': 'bg-blue-600',
  'In Shop': 'bg-amber-600',
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
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-secondary border border-border rounded px-3 py-1.5 text-sm">
            <option value="All">Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-secondary border border-border rounded px-3 py-1.5 text-sm">
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <input type="text" placeholder="Search reg. no..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary border border-border rounded px-3 py-1.5 text-sm" />

          <div className="flex-1" />

          <button onClick={() => setShowForm(!showForm)} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
            + Add Vehicle
          </button>
        </div>

        {/* Add Vehicle Form */}
        {showForm && (
          <div className="border border-border rounded-lg p-4 mb-4">
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="grid grid-cols-6 gap-3">
              <input placeholder="Reg. No." value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input placeholder="Name/Model" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm">
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Mini">Mini</option>
              </select>
              <input type="number" placeholder="Capacity (kg)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Odometer" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Acq. Cost" value={form.acqCost} onChange={(e) => setForm({ ...form, acqCost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
            </div>
            <button onClick={handleAdd} className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</button>
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                <th className="text-left p-3 font-semibold">REG. NO. (UNIQUE)</th>
                <th className="text-left p-3 font-semibold">NAME/MODE</th>
                <th className="text-left p-3 font-semibold">TYPE</th>
                <th className="text-left p-3 font-semibold">CAPACITY</th>
                <th className="text-left p-3 font-semibold">ODOMETER</th>
                <th className="text-left p-3 font-semibold">ACQ. COST</th>
                <th className="text-left p-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.regNo} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{v.regNo}</td>
                  <td className="p-3">{v.name}</td>
                  <td className="p-3">{v.type}</td>
                  <td className="p-3">{v.capacity} {v.capacityUnit}</td>
                  <td className="p-3">{formatOdometer(v.odometer)}</td>
                  <td className="p-3">{formatCost(v.acqCost)}</td>
                  <td className="p-3">
                    <span className={`${statusColors[v.status]} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-amber-400 italic mt-3">
          Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
        </p>
      </div>
    </Sidebar>
  );
}
