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
              <Popover open={showFuelForm} onOpenChange={setShowFuelForm}>
                <PopoverTrigger asChild>
                  <Button className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                    + Log Fuel
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Log Fuel</h4>
                      <p className="text-sm text-muted-foreground">Add new fuel record.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Select value={fuelForm.vehicle} onValueChange={(val) => setFuelForm({ ...fuelForm, vehicle: val })}>
                        <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <DatePicker value={fuelForm.date} onChange={(val) => setFuelForm({ ...fuelForm, date: val })} placeholder="Date" className="bg-transparent border-border h-[38px]" />
                      <input type="number" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                      <input type="number" placeholder="Cost" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                      <Button onClick={handleAddFuel} className="bg-chart-4 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">Save</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                  <TableHead className="text-left p-3 font-semibold">VEHICLE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">DATE</TableHead>
                  <TableHead className="text-left p-3 font-semibold">LITERS</TableHead>
                  <TableHead className="text-left p-3 font-semibold">FUEL COST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelLogs.map((log, i) => (
                  <TableRow key={i} className="border-b border-border last:border-0">
                    <TableCell className="p-3">{log.vehicle}</TableCell>
                    <TableCell className="p-3">{log.date}</TableCell>
                    <TableCell className="p-3">{log.liters} L</TableCell>
                    <TableCell className="p-3">{log.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Other Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold italic">OTHER EXPENSES (TOLL / MISC)</h2>
            <Popover open={showExpenseForm} onOpenChange={setShowExpenseForm}>
              <PopoverTrigger asChild>
                <Button className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                  + Add Expense
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Add Expense</h4>
                    <p className="text-sm text-muted-foreground">Record toll or misc expenses.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input placeholder="Trip ID" value={expenseForm.trip} onChange={(e) => setExpenseForm({ ...expenseForm, trip: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <Select value={expenseForm.vehicle} onValueChange={(val) => setExpenseForm({ ...expenseForm, vehicle: val })}>
                      <SelectTrigger className="bg-transparent border border-border h-[38px] text-sm">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <input type="number" placeholder="Toll" value={expenseForm.toll} onChange={(e) => setExpenseForm({ ...expenseForm, toll: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input type="number" placeholder="Other" value={expenseForm.other} onChange={(e) => setExpenseForm({ ...expenseForm, other: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
                    <input type="number" placeholder="Maint. (Linked)" value={expenseForm.maintLinked} onChange={(e) => setExpenseForm({ ...expenseForm, maintLinked: e.target.value })} className="bg-transparent border border-border rounded px-3 py-2 text-sm" />
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
                  <TableHead className="text-left p-3 font-semibold">TOLL</TableHead>
                  <TableHead className="text-left p-3 font-semibold">OTHER</TableHead>
                  <TableHead className="text-left p-3 font-semibold">MAINT. (LINKED)</TableHead>
                  <TableHead className="text-left p-3 font-semibold">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp, i) => (
                  <TableRow key={i} className="border-b border-border last:border-0">
                    <TableCell className="p-3">{exp.trip}</TableCell>
                    <TableCell className="p-3">{exp.vehicle}</TableCell>
                    <TableCell className="p-3">{exp.toll}</TableCell>
                    <TableCell className="p-3">{exp.other}</TableCell>
                    <TableCell className="p-3">{exp.maintLinked.toLocaleString()}</TableCell>
                    <TableCell className="p-3">
                      <StatusBadge status={exp.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
