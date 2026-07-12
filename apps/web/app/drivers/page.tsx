'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

const initialDrivers = [
  { name: 'Alex', license: 'DL-88213', category: 'LMV', expiry: '12/2028', contact: '98765xxxxx', safetyScore: 96, status: 'Available' },
  { name: 'John', license: 'DL-44120', category: 'HMV', expiry: '03/2025', contact: '98220xxxxx', safetyScore: 91, status: 'Suspended' },
  { name: 'Priya', license: 'DL-77031', category: 'LMV', expiry: '08/2027', contact: '99110xxxxx', safetyScore: 99, status: 'On Trip' },
  { name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '01/2027', contact: '97440xxxxx', safetyScore: 88, status: 'Off Duty' },
];

const statusColors: Record<string, string> = {
  'Available': 'bg-green-600',
  'On Trip': 'bg-blue-600',
  'Off Duty': 'bg-gray-500',
  'Suspended': 'bg-orange-600',
};

function getSafetyColor(score: number) {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function isLicenseExpired(expiry: string) {
  const [month, year] = expiry.split('/').map(Number);
  const exp = new Date(year, month - 1);
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            + Add Driver
          </button>
        </div>

        {/* Add Driver Form */}
        {showForm && (
          <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-6 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
            <input placeholder="License No." value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm">
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
            </select>
            <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
            <input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</button>
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                <th className="text-left p-3 font-semibold">DRIVER</th>
                <th className="text-left p-3 font-semibold">LICENSE NO.</th>
                <th className="text-left p-3 font-semibold">CATEGORY</th>
                <th className="text-left p-3 font-semibold">EXPIRY</th>
                <th className="text-left p-3 font-semibold">CONTACT</th>
                <th className="text-left p-3 font-semibold">SAFETY SCORE</th>
                <th className="text-left p-3 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.name} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3">{d.license}</td>
                  <td className="p-3">{d.category}</td>
                  <td className={`p-3 ${isLicenseExpired(d.expiry) ? 'text-red-400 font-bold' : ''}`}>
                    {d.expiry}{isLicenseExpired(d.expiry) ? ' EXPIRED' : ''}
                  </td>
                  <td className="p-3">{d.contact}</td>
                  <td className={`p-3 font-bold ${getSafetyColor(d.safetyScore)}`}>{d.safetyScore}%</td>
                  <td className="p-3">
                    <span className={`${statusColors[d.status]} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-amber-400 italic mt-3">
          Rule: Expired license or Suspended status = blocked from trip assignment
        </p>
      </div>
    </Sidebar>
  );
}
