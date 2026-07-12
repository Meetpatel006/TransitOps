'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { tripsService } from '@/services/trips';
import { vehiclesService } from '@/services/vehicles';
import { driversService } from '@/services/drivers';
import { ResourceGuard } from '@/components/resource-guard';
import { useAuth } from '@/hooks/use-auth';
import { canWrite } from '@/lib/rbac';
import type { Trip, Vehicle, Driver } from '@transitops/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TripsPage() {
  const { user } = useAuth();
  const canWriteTrips = canWrite(user?.role_name, 'trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
  const [formError, setFormError] = useState('');
  const [completeForm, setCompleteForm] = useState({ final_odometer: '', fuel_consumed: '' });
  const [completingId, setCompletingId] = useState<number | null>(null);

  const fetchAll = () => Promise.all([tripsService.list(), vehiclesService.list(), driversService.list()])
    .then(([t, v, d]) => { setTrips(t); setVehicles(v); setDrivers(d); })
    .catch(console.error)
    .finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));

  const filtered = trips.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (vehicleFilter !== 'All' && String(t.vehicle_id) !== vehicleFilter) return false;
    if (driverFilter !== 'All' && String(t.driver_id) !== driverFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const vName = vehicleMap[t.vehicle_id]?.name_model?.toLowerCase() || '';
      const dName = driverMap[t.driver_id]?.name?.toLowerCase() || '';
      if (!t.source.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q) && !vName.includes(q) && !dName.includes(q)) return false;
    }
    return true;
  });

  const activeTrips = filtered.filter(t => t.status === 'Dispatched');
  const otherTrips = filtered.filter(t => t.status !== 'Dispatched');
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  const selectedVehicle = vehicles.find(v => v.id === Number(form.vehicle_id));
  const cargoNum = Number(form.cargo_weight) || 0;
  const capacityNum = selectedVehicle?.maximum_load_capacity ?? 0;
  const overCapacity = cargoNum > capacityNum && capacityNum > 0;
  const canSubmit = form.source && form.destination && form.vehicle_id && form.driver_id && cargoNum > 0 && !overCapacity;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setFormError('');
    try {
      await tripsService.create({
        source: form.source,
        destination: form.destination,
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
        cargo_weight: cargoNum,
        planned_distance: Number(form.planned_distance) || 0,
      });
      await fetchAll();
      setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
      setShowCreate(false);
    } catch (e) { setFormError('Failed to create trip'); }
  };

  const handleDispatch = async (id: number) => { await tripsService.dispatch(id).then(fetchAll).catch(console.error); };
  const handleComplete = async (id: number) => {
    await tripsService.complete(id, Number(completeForm.final_odometer) || 0, Number(completeForm.fuel_consumed) || 0).then(fetchAll).catch(console.error);
    setCompletingId(null);
    setCompleteForm({ final_odometer: '', fuel_consumed: '' });
  };
  const handleCancel = async (id: number) => { await tripsService.cancel(id).then(fetchAll).catch(console.error); };

  if (loading) return <Sidebar><div className="p-6 text-muted-foreground">Loading...</div></Sidebar>;

  return (
    <ResourceGuard resource="trips">
    <Sidebar>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Trips</h1>
            <p className="text-sm text-muted-foreground">{activeTrips.length} active · {trips.length} total</p>
          </div>
          {canWriteTrips && (
            <Button onClick={() => setShowCreate(!showCreate)} className="text-sm font-medium px-4 py-2 rounded transition-colors">
              {showCreate ? 'Close' : '+ Create Trip'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {vehicles.map(v => (<SelectItem key={v.id} value={String(v.id)}>{v.name_model}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={(v) => setDriverFilter(v ?? 'All')}>
            <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {drivers.map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <input type="text" placeholder="Search route, vehicle, or driver..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary border border-border rounded px-3 py-1.5 text-sm" />
        </div>

        {showCreate && (
          <div className="border border-border rounded-lg p-4 mb-6 bg-secondary/30">
            <h2 className="text-sm font-bold tracking-wider mb-4">CREATE TRIP</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">SOURCE</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DESTINATION</label>
                <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">VEHICLE</label>
                <Select value={form.vehicle_id} onValueChange={(val) => setForm({ ...form, vehicle_id: val ?? '' })}>
                  <SelectTrigger className="w-full bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.name_model} ({v.maximum_load_capacity} kg)</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DRIVER</label>
                <Select value={form.driver_id} onValueChange={(val) => setForm({ ...form, driver_id: val ?? '' })}>
                  <SelectTrigger className="w-full bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((d) => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CARGO WEIGHT (KG)</label>
                <input type="number" value={form.cargo_weight} onChange={(e) => setForm({ ...form, cargo_weight: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">PLANNED DISTANCE (KM)</label>
                <input type="number" value={form.planned_distance} onChange={(e) => setForm({ ...form, planned_distance: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            {overCapacity && (<div className="border border-red-500 rounded p-3 text-sm text-destructive mt-3">Cargo ({cargoNum} kg) exceeds vehicle capacity ({capacityNum} kg)</div>)}
            {formError && (<div className="border border-red-500 rounded p-3 text-sm text-destructive mt-3">{formError}</div>)}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleCreate} disabled={!canSubmit} className="text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">Dispatch Trip</Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); setFormError(''); }} className="text-sm font-medium px-6 py-2 rounded transition-colors">Cancel</Button>
            </div>
          </div>
        )}

        {activeTrips.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground mb-3">LIVE BOARD</h2>
            <div className="space-y-2">
              {activeTrips.map((trip) => {
                const isExpanded = expandedId === trip.id;
                const vName = vehicleMap[trip.vehicle_id]?.name_model || `Vehicle #${trip.vehicle_id}`;
                const dName = driverMap[trip.driver_id]?.name || `Driver #${trip.driver_id}`;
                return (
                  <div key={trip.id} className="border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setExpandedId(isExpanded ? null : trip.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">TR{String(trip.id).padStart(3, '0')}</span>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trip.source} → {trip.destination}</span>
                        <span>{vName}</span>
                        <span>{dName}</span>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/20">
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">ROUTE</span><p className="mt-1">{trip.source} → {trip.destination}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">VEHICLE</span><p className="mt-1">{vName}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">DRIVER</span><p className="mt-1">{dName}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">CARGO</span><p className="mt-1">{trip.cargo_weight} kg</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">DISTANCE</span><p className="mt-1">{trip.planned_distance} km</p></div>
                        </div>
                        {canWriteTrips && (
                        <div className="flex gap-2">
                          {completingId === trip.id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" placeholder="Odometer" value={completeForm.final_odometer} onChange={(e) => setCompleteForm({ ...completeForm, final_odometer: e.target.value })} className="bg-transparent border border-border rounded px-3 py-1.5 text-sm w-32" />
                              <input type="number" placeholder="Fuel (L)" value={completeForm.fuel_consumed} onChange={(e) => setCompleteForm({ ...completeForm, fuel_consumed: e.target.value })} className="bg-transparent border border-border rounded px-3 py-1.5 text-sm w-32" />
                              <Button onClick={() => handleComplete(trip.id)} className="text-xs px-3 py-1.5 rounded">Confirm</Button>
                              <Button variant="outline" onClick={() => setCompletingId(null)} className="text-xs px-3 py-1.5 rounded">Back</Button>
                            </div>
                          ) : (
                            <>
                              <Button onClick={() => { setCompletingId(trip.id); setCompleteForm({ final_odometer: '', fuel_consumed: '' }); }} className="text-xs px-3 py-1.5 rounded">Complete</Button>
                              <Button variant="destructive" onClick={() => handleCancel(trip.id)} className="text-xs px-3 py-1.5 rounded">Cancel</Button>
                            </>
                          )}
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {otherTrips.length > 0 && (
          <div>
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground mb-3">HISTORY</h2>
            <div className="space-y-2">
              {otherTrips.map((trip) => {
                const isExpanded = expandedId === trip.id;
                const vName = vehicleMap[trip.vehicle_id]?.name_model || `Vehicle #${trip.vehicle_id}`;
                const dName = driverMap[trip.driver_id]?.name || `Driver #${trip.driver_id}`;
                return (
                  <div key={trip.id} className="border border-border rounded-lg overflow-hidden opacity-70">
                    <button onClick={() => setExpandedId(isExpanded ? null : trip.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">TR{String(trip.id).padStart(3, '0')}</span>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trip.source} → {trip.destination}</span>
                        <span>{vName}</span>
                        <span>{dName}</span>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/20">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">ROUTE</span><p className="mt-1">{trip.source} → {trip.destination}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">VEHICLE</span><p className="mt-1">{vName}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">DRIVER</span><p className="mt-1">{dName}</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">CARGO</span><p className="mt-1">{trip.cargo_weight} kg</p></div>
                          <div><span className="text-xs font-bold tracking-wider text-muted-foreground">DISTANCE</span><p className="mt-1">{trip.planned_distance} km</p></div>
                          {trip.final_odometer != null && (<div><span className="text-xs font-bold tracking-wider text-muted-foreground">FINAL ODOMETER</span><p className="mt-1">{trip.final_odometer}</p></div>)}
                          {trip.fuel_consumed != null && (<div><span className="text-xs font-bold tracking-wider text-muted-foreground">FUEL CONSUMED</span><p className="mt-1">{trip.fuel_consumed} L</p></div>)}
                        </div>
                        {trip.status === 'Draft' && canWriteTrips && (
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleDispatch(trip.id)} className="text-xs px-3 py-1.5 rounded">Dispatch</Button>
                            <Button variant="destructive" onClick={() => handleCancel(trip.id)} className="text-xs px-3 py-1.5 rounded">Cancel</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
    </ResourceGuard>
  );
}
