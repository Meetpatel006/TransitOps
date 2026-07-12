'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

interface FuelLog {
  id: number;
  vehicle: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
}

interface Expense {
  id: number;
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
  maintLinked: number;
  total: number;
}

const vehicles = ['VAN-05', 'TRUCK-12', 'MINI-08', 'VAN-09'];

const initialFuelLogs: FuelLog[] = [
  { id: 1, vehicle: 'VAN-05', date: '05 Jul 2026', liters: 42, costPerLiter: 75, totalCost: 3150 },
  { id: 2, vehicle: 'TRUCK-12', date: '06 Jul 2026', liters: 110, costPerLiter: 76.36, totalCost: 8400 },
  { id: 3, vehicle: 'MINI-08', date: '06 Jul 2026', liters: 28, costPerLiter: 73.21, totalCost: 2050 },
  { id: 4, vehicle: 'VAN-05', date: '08 Jul 2026', liters: 38, costPerLiter: 74.50, totalCost: 2831 },
  { id: 5, vehicle: 'TRUCK-12', date: '10 Jul 2026', liters: 95, costPerLiter: 77.00, totalCost: 7315 },
];

const initialExpenses: Expense[] = [
  { id: 1, trip: 'TR001', vehicle: 'VAN-05', toll: 120, other: 0, maintLinked: 0, total: 120 },
  { id: 2, trip: 'TR002', vehicle: 'TRUCK-12', toll: 340, other: 150, maintLinked: 18000, total: 18490 },
  { id: 3, trip: 'TR003', vehicle: 'MINI-08', toll: 80, other: 200, maintLinked: 0, total: 280 },
];

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicle: '', date: '', liters: '', costPerLiter: '' });
  const [expenseForm, setExpenseForm] = useState({ trip: '', vehicle: '', toll: '', other: '', maintLinked: '' });

  // Summary calculations
  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = fuelLogs.reduce((sum, l) => sum + l.liters, 0);
  const avgCostPerLiter = totalLiters > 0 ? totalFuelCost / totalLiters : 0;
  const totalToll = expenses.reduce((sum, e) => sum + e.toll, 0);
  const totalOther = expenses.reduce((sum, e) => sum + e.other, 0);
  const totalMaint = expenses.reduce((sum, e) => sum + e.maintLinked, 0);
  const totalExpenses = totalToll + totalOther + totalMaint;
  const grandTotal = totalFuelCost + totalExpenses;

  // Per-vehicle breakdown
  const vehicleBreakdown = vehicles.map(v => {
    const vFuel = fuelLogs.filter(l => l.vehicle === v);
    const vExpenses = expenses.filter(e => e.vehicle === v);
    return {
      vehicle: v,
      fuelCost: vFuel.reduce((s, l) => s + l.totalCost, 0),
      liters: vFuel.reduce((s, l) => s + l.liters, 0),
      toll: vExpenses.reduce((s, e) => s + e.toll, 0),
      other: vExpenses.reduce((s, e) => s + e.other, 0),
      maint: vExpenses.reduce((s, e) => s + e.maintLinked, 0),
      total: vFuel.reduce((s, l) => s + l.totalCost, 0) + vExpenses.reduce((s, e) => s + e.total, 0),
    };
  }).filter(v => v.total > 0).sort((a, b) => b.total - a.total);

  const handleAddFuel = () => {
    if (!fuelForm.vehicle || !fuelForm.liters) return;
    const liters = Number(fuelForm.liters);
    const cpl = Number(fuelForm.costPerLiter) || 75;
    const nextId = Math.max(0, ...fuelLogs.map(l => l.id)) + 1;
    setFuelLogs([{
      id: nextId,
      vehicle: fuelForm.vehicle,
      date: fuelForm.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      liters,
      costPerLiter: cpl,
      totalCost: Math.round(liters * cpl),
    }, ...fuelLogs]);
    setFuelForm({ vehicle: '', date: '', liters: '', costPerLiter: '' });
    setShowFuelForm(false);
  };

  const handleAddExpense = () => {
    if (!expenseForm.trip || !expenseForm.vehicle) return;
    const toll = Number(expenseForm.toll) || 0;
    const other = Number(expenseForm.other) || 0;
    const maint = Number(expenseForm.maintLinked) || 0;
    const nextId = Math.max(0, ...expenses.map(e => e.id)) + 1;
    setExpenses([{
      id: nextId,
      trip: expenseForm.trip,
      vehicle: expenseForm.vehicle,
      toll,
      other,
      maintLinked: maint,
      total: toll + other + maint,
    }, ...expenses]);
    setExpenseForm({ trip: '', vehicle: '', toll: '', other: '', maintLinked: '' });
    setShowExpenseForm(false);
  };

  return (
    <Sidebar>
      <div className="p-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Fuel & Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {fuelLogs.length + expenses.length} records · ₹{grandTotal.toLocaleString('en-IN')} total
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">FUEL COST</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalFuelCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalLiters.toLocaleString()} L · ₹{avgCostPerLiter.toFixed(2)}/L avg</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">TOLL & OTHER</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalToll + totalOther)}</p>
            <p className="text-xs text-muted-foreground mt-1">Toll {formatCurrency(totalToll)} · Other {formatCurrency(totalOther)}</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">MAINTENANCE</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalMaint)}</p>
            <p className="text-xs text-muted-foreground mt-1">{expenses.filter(e => e.maintLinked > 0).length} linked records</p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-primary/5">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">GRAND TOTAL</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(grandTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{fuelLogs.length + expenses.length} records</p>
          </div>
        </div>

        {/* Fuel Logs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider">FUEL LOGS</h2>
            <Popover open={showFuelForm} onOpenChange={setShowFuelForm}>
              <PopoverTrigger className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer">
                + Log Fuel
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Log Fuel</h4>
                    <p className="text-sm text-muted-foreground">Add new fuel record.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Select value={fuelForm.vehicle} onValueChange={(val) => setFuelForm({ ...fuelForm, vehicle: val ?? '' })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <DatePicker value={fuelForm.date} onChange={(val) => setFuelForm({ ...fuelForm, date: val })} placeholder="Date" className="bg-transparent border-border h-[38px]" />
                    <input type="number" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input type="number" placeholder="Cost per liter (₹)" value={fuelForm.costPerLiter} onChange={(e) => setFuelForm({ ...fuelForm, costPerLiter: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <Button onClick={handleAddFuel} className="bg-chart-4 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">DATE</TableHead>
                  <TableHead className="text-right p-3 font-semibold">LITERS</TableHead>
                  <TableHead className="text-right p-3 font-semibold">COST/LITER</TableHead>
                  <TableHead className="text-right p-3 font-semibold">TOTAL COST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelLogs.map((log) => (
                  <TableRow key={log.id} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{log.vehicle}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{log.date}</TableCell>
                    <TableCell className="p-3 text-right">{log.liters} L</TableCell>
                    <TableCell className="p-3 text-right">₹{log.costPerLiter.toFixed(2)}</TableCell>
                    <TableCell className="p-3 text-right font-medium">₹{formatCurrency(log.totalCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Other Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider">OTHER EXPENSES</h2>
            <Popover open={showExpenseForm} onOpenChange={setShowExpenseForm}>
              <PopoverTrigger className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer">
                + Add Expense
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Add Expense</h4>
                    <p className="text-sm text-muted-foreground">Record toll or misc expenses.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input placeholder="Trip ID (e.g. TR001)" value={expenseForm.trip} onChange={(e) => setExpenseForm({ ...expenseForm, trip: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <Select value={expenseForm.vehicle} onValueChange={(val) => setExpenseForm({ ...expenseForm, vehicle: val ?? '' })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <input type="number" placeholder="Toll (₹)" value={expenseForm.toll} onChange={(e) => setExpenseForm({ ...expenseForm, toll: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input type="number" placeholder="Other (₹)" value={expenseForm.other} onChange={(e) => setExpenseForm({ ...expenseForm, other: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input type="number" placeholder="Maintenance linked (₹)" value={expenseForm.maintLinked} onChange={(e) => setExpenseForm({ ...expenseForm, maintLinked: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <Button onClick={handleAddExpense} className="bg-chart-4 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <TableHead className="text-left p-3 font-semibold">TRIP</TableHead>
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-right p-3 font-semibold">TOLL</TableHead>
                  <TableHead className="text-right p-3 font-semibold">OTHER</TableHead>
                  <TableHead className="text-right p-3 font-semibold">MAINT.</TableHead>
                  <TableHead className="text-right p-3 font-semibold">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{exp.trip}</TableCell>
                    <TableCell className="p-3">{exp.vehicle}</TableCell>
                    <TableCell className="p-3 text-right">{exp.toll > 0 ? `₹${formatCurrency(exp.toll)}` : '—'}</TableCell>
                    <TableCell className="p-3 text-right">{exp.other > 0 ? `₹${formatCurrency(exp.other)}` : '—'}</TableCell>
                    <TableCell className="p-3 text-right">{exp.maintLinked > 0 ? `₹${formatCurrency(exp.maintLinked)}` : '—'}</TableCell>
                    <TableCell className="p-3 text-right font-medium">₹{formatCurrency(exp.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Per-Vehicle Breakdown */}
        {vehicleBreakdown.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">PER-VEHICLE BREAKDOWN</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                    <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                    <TableHead className="text-right p-3 font-semibold">FUEL</TableHead>
                    <TableHead className="text-right p-3 font-semibold">LITERS</TableHead>
                    <TableHead className="text-right p-3 font-semibold">TOLL</TableHead>
                    <TableHead className="text-right p-3 font-semibold">OTHER</TableHead>
                    <TableHead className="text-right p-3 font-semibold">MAINT.</TableHead>
                    <TableHead className="text-right p-3 font-semibold">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleBreakdown.map((v) => (
                    <TableRow key={v.vehicle} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{v.vehicle}</TableCell>
                      <TableCell className="p-3 text-right">₹{formatCurrency(v.fuelCost)}</TableCell>
                      <TableCell className="p-3 text-right">{v.liters} L</TableCell>
                      <TableCell className="p-3 text-right">{v.toll > 0 ? `₹${formatCurrency(v.toll)}` : '—'}</TableCell>
                      <TableCell className="p-3 text-right">{v.other > 0 ? `₹${formatCurrency(v.other)}` : '—'}</TableCell>
                      <TableCell className="p-3 text-right">{v.maint > 0 ? `₹${formatCurrency(v.maint)}` : '—'}</TableCell>
                      <TableCell className="p-3 text-right font-medium">₹{formatCurrency(v.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-bold tracking-wider">TOTAL OPERATIONAL COST = FUEL + TOLL + OTHER + MAINT</span>
          <span className="text-xl font-bold text-green-400">₹{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Sidebar>
  );
}
