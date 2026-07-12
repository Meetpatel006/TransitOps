'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

interface FuelLog {
  vehicle: string;
  date: string;
  liters: number;
  cost: number;
}

interface Expense {
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
  maintLinked: number;
  status: string;
}

const initialFuelLogs: FuelLog[] = [
  { vehicle: 'VAN-05', date: '05 Jul 2026', liters: 42, cost: 3150 },
  { vehicle: 'TRUCK-12', date: '06 Jul 2026', liters: 110, cost: 8400 },
  { vehicle: 'MINI-08', date: '06 Jul 2026', liters: 28, cost: 2050 },
];

const initialExpenses: Expense[] = [
  { trip: 'TR001', vehicle: 'VAN-05', toll: 120, other: 0, maintLinked: 0, status: 'Available' },
  { trip: 'TR002', vehicle: 'TRK-12', toll: 340, other: 150, maintLinked: 18000, status: 'Completed' },
];

const vehicles = ['VAN-05', 'TRUCK-12', 'MINI-08', 'VAN-09'];

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicle: '', date: '', liters: '', cost: '' });
  const [expenseForm, setExpenseForm] = useState({ trip: '', vehicle: '', toll: '', other: '', maintLinked: '' });

  const totalFuel = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalMaint = expenses.reduce((sum, e) => sum + e.maintLinked, 0);
  const totalCost = totalFuel + totalMaint;

  const handleAddFuel = () => {
    if (!fuelForm.vehicle || !fuelForm.liters) return;
    setFuelLogs([{ vehicle: fuelForm.vehicle, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) || 0 }, ...fuelLogs]);
    setFuelForm({ vehicle: '', date: '', liters: '', cost: '' });
    setShowFuelForm(false);
  };

  const handleAddExpense = () => {
    if (!expenseForm.trip || !expenseForm.vehicle) return;
    setExpenses([{ trip: expenseForm.trip, vehicle: expenseForm.vehicle, toll: Number(expenseForm.toll) || 0, other: Number(expenseForm.other) || 0, maintLinked: Number(expenseForm.maintLinked) || 0, status: 'Available' }, ...expenses]);
    setExpenseForm({ trip: '', vehicle: '', toll: '', other: '', maintLinked: '' });
    setShowExpenseForm(false);
  };

  return (
    <Sidebar>
      <div className="p-6 space-y-8">
        {/* Fuel Logs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold italic">FUEL LOGS</h2>
            <div className="flex gap-2">
              <button onClick={() => { setShowFuelForm(!showFuelForm); setShowExpenseForm(false); }} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                + Log Fuel
              </button>
              <button onClick={() => { setShowExpenseForm(!showExpenseForm); setShowFuelForm(false); }} className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                + Add Expense
              </button>
            </div>
          </div>

          {/* Add Fuel Form */}
          {showFuelForm && (
            <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-4 gap-3">
              <select value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm">
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Cost" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <button onClick={handleAddFuel} className="col-span-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</button>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <th className="text-left p-3 font-semibold">VEHICLE</th>
                  <th className="text-left p-3 font-semibold">DATE</th>
                  <th className="text-left p-3 font-semibold">LITERS</th>
                  <th className="text-left p-3 font-semibold">FUEL COST</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((log, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3">{log.vehicle}</td>
                    <td className="p-3">{log.date}</td>
                    <td className="p-3">{log.liters} L</td>
                    <td className="p-3">{log.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Expenses */}
        <div>
          <h2 className="text-lg font-bold italic mb-4">OTHER EXPENSES (TOLL / MISC)</h2>

          {/* Add Expense Form */}
          {showExpenseForm && (
            <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-5 gap-3">
              <input placeholder="Trip ID" value={expenseForm.trip} onChange={(e) => setExpenseForm({ ...expenseForm, trip: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <select value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm">
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <input type="number" placeholder="Toll" value={expenseForm.toll} onChange={(e) => setExpenseForm({ ...expenseForm, toll: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Other" value={expenseForm.other} onChange={(e) => setExpenseForm({ ...expenseForm, other: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Maint. (Linked)" value={expenseForm.maintLinked} onChange={(e) => setExpenseForm({ ...expenseForm, maintLinked: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
              <button onClick={handleAddExpense} className="col-span-5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</button>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <th className="text-left p-3 font-semibold">TRIP</th>
                  <th className="text-left p-3 font-semibold">VEHICLE</th>
                  <th className="text-left p-3 font-semibold">TOLL</th>
                  <th className="text-left p-3 font-semibold">OTHER</th>
                  <th className="text-left p-3 font-semibold">MAINT. (LINKED)</th>
                  <th className="text-left p-3 font-semibold">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3">{exp.trip}</td>
                    <td className="p-3">{exp.vehicle}</td>
                    <td className="p-3">{exp.toll}</td>
                    <td className="p-3">{exp.other}</td>
                    <td className="p-3">{exp.maintLinked.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${exp.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}`}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-bold tracking-wider">TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT</span>
          <span className="text-xl font-bold text-green-400">{totalCost.toLocaleString()}</span>
        </div>
      </div>
    </Sidebar>
  );
}
