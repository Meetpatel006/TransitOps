'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Trip {
  id: number;
  source: string;
  destination: string;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  planned_distance: number;
  status: string;
  final_odometer: number | null;
  fuel_consumed: number | null;
}

interface Vehicle {
  id: number;
  name_model: string;
  maximum_load_capacity: number;
  status: string;
}

interface Driver {
  id: number;
  name: string;
  status: string;
}

const initialVehicles: Vehicle[] = [
  { id: 1, name_model: 'VAN-05', maximum_load_capacity: 500, status: 'Available' },
  { id: 2, name_model: 'TRUCK-12', maximum_load_capacity: 5000, status: 'On Trip' },
  { id: 3, name_model: 'MINI-08', maximum_load_capacity: 1000, status: 'In Shop' },
  { id: 4, name_model: 'VAN-09', maximum_load_capacity: 750, status: 'Retired' },
];

const initialDrivers: Driver[] = [
  { id: 1, name: 'Alex', status: 'Available' },
  { id: 2, name: 'John', status: 'Suspended' },
  { id: 3, name: 'Priya', status: 'On Trip' },
  { id: 4, name: 'Suresh', status: 'Off Duty' },
];

const initialTrips: Trip[] = [
  { id: 1, source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicle_id: 1, driver_id: 1, cargo_weight: 450, planned_distance: 38, status: 'Dispatched', final_odometer: null, fuel_consumed: null },
  { id: 2, source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicle_id: 2, driver_id: 3, cargo_weight: 2000, planned_distance: 25, status: 'Draft', final_odometer: null, fuel_consumed: null },
  { id: 3, source: 'Mansa', destination: 'Kalol Depot', vehicle_id: 1, driver_id: 4, cargo_weight: 300, planned_distance: 55, status: 'Completed', final_odometer: 74200, fuel_consumed: 12.5 },
  { id: 4, source: 'Naroda', destination: 'Vastral', vehicle_id: 2, driver_id: 1, cargo_weight: 1800, planned_distance: 15, status: 'Cancelled', final_odometer: null, fuel_consumed: null },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [vehicles] = useState(initialVehicles);
  const [drivers] = useState(initialDrivers);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    source: '', destination: '', vehicle_id: '', driver_id: '',
    cargo_weight: '', planned_distance: '',
  });
  const [formError, setFormError] = useState('');

  const [completeForm, setCompleteForm] = useState({ final_odometer: '', fuel_consumed: '' });
  const [completingId, setCompletingId] = useState<number | null>(null);

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

  const nextId = Math.max(0, ...trips.map(t => t.id)) + 1;

  const handleCreate = () => {
    if (!canSubmit) return;
    setFormError('');
    const trip: Trip = {
      id: nextId,
      source: form.source,
      destination: form.destination,
      vehicle_id: Number(form.vehicle_id),
      driver_id: Number(form.driver_id),
      cargo_weight: cargoNum,
      planned_distance: Number(form.planned_distance) || 0,
      status: 'Dispatched',
      final_odometer: null,
      fuel_consumed: null,
    };
    setTrips([trip, ...trips]);
    setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
    setShowCreate(false);
  };

  const handleDispatch = (tripId: number) => {
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Dispatched' } : t));
  };

  const handleComplete = (tripId: number) => {
    setTrips(trips.map(t => t.id === tripId ? {
      ...t, status: 'Completed',
      final_odometer: Number(completeForm.final_odometer) || 0,
      fuel_consumed: Number(completeForm.fuel_consumed) || 0,
    } : t));
    setCompletingId(null);
    setCompleteForm({ final_odometer: '', fuel_consumed: '' });
  };

  const handleCancel = (tripId: number) => {
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t));
  };

  return (
    <Sidebar>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Trips</h1>
            <p className="text-sm text-muted-foreground">
              {activeTrips.length} active · {trips.length} total
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-chart-1 hover:bg-chart-1/90 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            {showCreate ? 'Close' : '+ Create Trip'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Status: All</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v ?? 'All')}>
            <SelectTrigger className="w-[150px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Vehicle: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Vehicle: All</SelectItem>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={String(v.id)}>{v.name_model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={(v) => setDriverFilter(v ?? 'All')}>
            <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
              <SelectValue placeholder="Driver: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Driver: All</SelectItem>
              {drivers.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Search route, vehicle, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border border-border rounded px-3 py-1.5 text-sm"
          />
        </div>

        {/* Create Trip Panel */}
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
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name_model} ({v.maximum_load_capacity} kg)</SelectItem>
                    ))}
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
                    {availableDrivers.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
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

            {overCapacity && (
              <div className="border border-red-500 rounded p-3 text-sm text-destructive mt-3">
                Cargo ({cargoNum} kg) exceeds vehicle capacity ({capacityNum} kg)
              </div>
            )}
            {formError && (
              <div className="border border-red-500 rounded p-3 text-sm text-destructive mt-3">{formError}</div>
            )}

            <div className="flex gap-3 mt-4">
              <Button onClick={handleCreate} disabled={!canSubmit} className="bg-chart-1 hover:bg-chart-1/90 text-white text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50">
                Dispatch Trip
              </Button>
              <Button onClick={() => { setShowCreate(false); setFormError(''); }} className="bg-transparent border border-border text-sm font-medium px-6 py-2 rounded transition-colors hover:bg-secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Active / Dispatched Trips */}
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
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : trip.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">TR{String(trip.id).padStart(3, '0')}</span>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trip.source} → {trip.destination}</span>
                        <span>{vName}</span>
                        <span>{dName}</span>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/20">
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">ROUTE</span>
                            <p className="mt-1">{trip.source} → {trip.destination}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">VEHICLE</span>
                            <p className="mt-1">{vName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">DRIVER</span>
                            <p className="mt-1">{dName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">CARGO</span>
                            <p className="mt-1">{trip.cargo_weight} kg</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">DISTANCE</span>
                            <p className="mt-1">{trip.planned_distance} km</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {completingId === trip.id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" placeholder="Odometer" value={completeForm.final_odometer} onChange={(e) => setCompleteForm({ ...completeForm, final_odometer: e.target.value })} className="bg-transparent border border-border rounded px-3 py-1.5 text-sm w-32" />
                              <input type="number" placeholder="Fuel (L)" value={completeForm.fuel_consumed} onChange={(e) => setCompleteForm({ ...completeForm, fuel_consumed: e.target.value })} className="bg-transparent border border-border rounded px-3 py-1.5 text-sm w-32" />
                              <Button onClick={() => handleComplete(trip.id)} className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded">Confirm</Button>
                              <Button onClick={() => setCompletingId(null)} className="text-xs bg-transparent border border-border px-3 py-1.5 rounded hover:bg-secondary">Back</Button>
                            </div>
                          ) : (
                            <>
                              <Button onClick={() => { setCompletingId(trip.id); setCompleteForm({ final_odometer: '', fuel_consumed: '' }); }} className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded">Complete</Button>
                              <Button onClick={() => handleCancel(trip.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded">Cancel</Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History (Draft, Completed, Cancelled) */}
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
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : trip.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">TR{String(trip.id).padStart(3, '0')}</span>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trip.source} → {trip.destination}</span>
                        <span>{vName}</span>
                        <span>{dName}</span>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/20">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">ROUTE</span>
                            <p className="mt-1">{trip.source} → {trip.destination}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">VEHICLE</span>
                            <p className="mt-1">{vName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">DRIVER</span>
                            <p className="mt-1">{dName}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">CARGO</span>
                            <p className="mt-1">{trip.cargo_weight} kg</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold tracking-wider text-muted-foreground">DISTANCE</span>
                            <p className="mt-1">{trip.planned_distance} km</p>
                          </div>
                          {trip.final_odometer != null && (
                            <div>
                              <span className="text-xs font-bold tracking-wider text-muted-foreground">FINAL ODOMETER</span>
                              <p className="mt-1">{trip.final_odometer}</p>
                            </div>
                          )}
                          {trip.fuel_consumed != null && (
                            <div>
                              <span className="text-xs font-bold tracking-wider text-muted-foreground">FUEL CONSUMED</span>
                              <p className="mt-1">{trip.fuel_consumed} L</p>
                            </div>
                          )}
                        </div>
                        {trip.status === 'Draft' && (
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleDispatch(trip.id)} className="text-xs bg-chart-1 hover:bg-chart-1/90 text-white px-3 py-1.5 rounded">Dispatch</Button>
                            <Button onClick={() => handleCancel(trip.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded">Cancel</Button>
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
  );
}
