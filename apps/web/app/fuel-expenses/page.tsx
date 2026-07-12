'use client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { fuelLogsService } from '@/services/fuel-logs';
import { expensesService } from '@/services/expenses';
import { vehiclesService } from '@/services/vehicles';
import type { FuelLog, Expense, Vehicle } from '@transitops/shared';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicle_id: '', date: '', liters: '', costPerLiter: '' });
  const [expenseForm, setExpenseForm] = useState({ vehicle_id: '', category: '', cost: '', notes: '' });

  const fetchAll = () => Promise.all([fuelLogsService.list(), expensesService.list(), vehiclesService.list()])
    .then(([f, e, v]) => { setFuelLogs(f); setExpenses(e); setVehicles(v); })
    .catch(console.error)
    .finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v.name_model]));

  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalLiters = fuelLogs.reduce((sum, l) => sum + l.liters, 0);
  const avgCostPerLiter = totalLiters > 0 ? totalFuelCost / totalLiters : 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
  const grandTotal = totalFuelCost + totalExpenses;

  const vehicleBreakdown = vehicles.map(v => {
    const vFuel = fuelLogs.filter(l => l.vehicle_id === v.id);
    const vExpenses = expenses.filter(e => e.vehicle_id === v.id);
    return {
      vehicle: v.name_model,
      fuelCost: vFuel.reduce((s, l) => s + l.cost, 0),
      liters: vFuel.reduce((s, l) => s + l.liters, 0),
      expenseCost: vExpenses.reduce((s, e) => s + e.cost, 0),
      total: vFuel.reduce((s, l) => s + l.cost, 0) + vExpenses.reduce((s, e) => s + e.cost, 0),
    };
  }).filter(v => v.total > 0).sort((a, b) => b.total - a.total);

  const handleAddFuel = async () => {
    if (!fuelForm.vehicle_id || !fuelForm.liters) return;
    const liters = Number(fuelForm.liters);
    const cpl = Number(fuelForm.costPerLiter) || 75;
    try {
      await fuelLogsService.create({
        vehicle_id: Number(fuelForm.vehicle_id),
        liters,
        cost: Math.round(liters * cpl),
        date: fuelForm.date || new Date().toISOString().split('T')[0],
      });
      await fetchAll();
      setFuelForm({ vehicle_id: '', date: '', liters: '', costPerLiter: '' });
      setShowFuelForm(false);
    } catch {}
  };

  const handleAddExpense = async () => {
    if (!expenseForm.vehicle_id || !expenseForm.cost) return;
    try {
      await expensesService.create({
        vehicle_id: Number(expenseForm.vehicle_id),
        cost: Number(expenseForm.cost),
        date: new Date().toISOString().split('T')[0],
        category: expenseForm.category || 'Other',
        notes: expenseForm.notes,
      });
      await fetchAll();
      setExpenseForm({ vehicle_id: '', category: '', cost: '', notes: '' });
      setShowExpenseForm(false);
    } catch {}
  };

  if (loading) return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  return (
    <Sidebar>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold">Fuel & Expenses</h1>
          <p className="text-sm text-muted-foreground">{fuelLogs.length + expenses.length} records · ₹{grandTotal.toLocaleString('en-IN')} total</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">FUEL COST</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalFuelCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalLiters.toLocaleString()} L · ₹{avgCostPerLiter.toFixed(2)}/L avg</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">EXPENSES</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} records</p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-primary/5">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">GRAND TOTAL</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(grandTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{fuelLogs.length + expenses.length} records</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider">FUEL LOGS</h2>
            <Popover open={showFuelForm} onOpenChange={setShowFuelForm}>
              <PopoverTrigger className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer">+ Log Fuel</PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div><h4 className="font-medium">Log Fuel</h4><p className="text-sm text-muted-foreground">Add new fuel record.</p></div>
                  <div className="flex flex-col gap-3">
                    <Select value={fuelForm.vehicle_id} onValueChange={(val) => setFuelForm({ ...fuelForm, vehicle_id: val ?? '' })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name_model}</SelectItem>)}</SelectContent>
                    </Select>
                    <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
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
                    <TableCell className="p-3 font-medium">{vehicleMap[log.vehicle_id] || `Vehicle #${log.vehicle_id}`}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{formatDate(log.date)}</TableCell>
                    <TableCell className="p-3 text-right">{log.liters} L</TableCell>
                    <TableCell className="p-3 text-right">₹{(log.liters > 0 ? (log.cost / log.liters).toFixed(2) : '0.00')}</TableCell>
                    <TableCell className="p-3 text-right font-medium">₹{formatCurrency(log.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider">OTHER EXPENSES</h2>
            <Popover open={showExpenseForm} onOpenChange={setShowExpenseForm}>
              <PopoverTrigger className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer">+ Add Expense</PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div><h4 className="font-medium">Add Expense</h4><p className="text-sm text-muted-foreground">Record toll or misc expenses.</p></div>
                  <div className="flex flex-col gap-3">
                    <Select value={expenseForm.vehicle_id} onValueChange={(val) => setExpenseForm({ ...expenseForm, vehicle_id: val ?? '' })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name_model}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={expenseForm.category} onValueChange={(val) => setExpenseForm({ ...expenseForm, category: val ?? '' })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toll">Toll</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Parking">Parking</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="number" placeholder="Cost (₹)" value={expenseForm.cost} onChange={(e) => setExpenseForm({ ...expenseForm, cost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input placeholder="Notes" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
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
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">CATEGORY</TableHead>
                  <TableHead className="text-left p-3 font-semibold">DATE</TableHead>
                  <TableHead className="text-right p-3 font-semibold">COST</TableHead>
                  <TableHead className="text-left p-3 font-semibold">NOTES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-b border-border last:border-0">
                    <TableCell className="p-3 font-medium">{vehicleMap[exp.vehicle_id] || `Vehicle #${exp.vehicle_id}`}</TableCell>
                    <TableCell className="p-3">{exp.category}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{formatDate(exp.date)}</TableCell>
                    <TableCell className="p-3 text-right font-medium">₹{formatCurrency(exp.cost)}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{exp.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

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
                    <TableHead className="text-right p-3 font-semibold">EXPENSES</TableHead>
                    <TableHead className="text-right p-3 font-semibold">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleBreakdown.map((v) => (
                    <TableRow key={v.vehicle} className="border-b border-border last:border-0">
                      <TableCell className="p-3 font-medium">{v.vehicle}</TableCell>
                      <TableCell className="p-3 text-right">₹{formatCurrency(v.fuelCost)}</TableCell>
                      <TableCell className="p-3 text-right">{v.liters} L</TableCell>
                      <TableCell className="p-3 text-right">₹{formatCurrency(v.expenseCost)}</TableCell>
                      <TableCell className="p-3 text-right font-medium">₹{formatCurrency(v.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-bold tracking-wider">TOTAL OPERATIONAL COST = FUEL + EXPENSES</span>
          <span className="text-xl font-bold text-green-400">₹{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Sidebar>
  );
}
