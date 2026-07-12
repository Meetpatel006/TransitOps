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

const tripStatusColors: Record<string, string> = {
  'Draft': 'bg-muted',
  'Dispatched': 'bg-chart-1',
  'Completed': 'bg-primary',
  'Cancelled': 'bg-red-400',
};

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

interface Driver {
  name: string;
  status: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle: string;
  driver: string;
  cargoWeight: number;
  distance: number;
  status: string;
  eta: string;
}

const initialVehicles: Vehicle[] = [
  { id: 'VAN-05', name: 'VAN-05', capacity: 500, status: 'Available' },
  { id: 'TRUCK-12', name: 'TRUCK-12', capacity: 5000, status: 'On Trip' },
  { id: 'MINI-08', name: 'MINI-08', capacity: 1000, status: 'In Shop' },
  { id: 'VAN-09', name: 'VAN-09', capacity: 750, status: 'Retired' },
];

const initialDrivers: Driver[] = [
  { name: 'Alex', status: 'Available' },
  { name: 'John', status: 'Suspended' },
  { name: 'Priya', status: 'On Trip' },
  { name: 'Suresh', status: 'Off Duty' },
];

const initialTrips: Trip[] = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicle: 'VAN-05', driver: 'Alex', cargoWeight: 450, distance: 38, status: 'Dispatched', eta: '45 min' },
  { id: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicle: 'TRUCK-04', driver: 'Suresh', cargoWeight: 2000, distance: 25, status: 'Draft', eta: 'Awaiting driver' },
  { id: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicle: '', driver: '', cargoWeight: 0, distance: 0, status: 'Cancelled', eta: 'Vehicle went to shop' },
];

// Ponytail: vehicles/drivers filtered by status for dispatch — simple filter, no shared state
function getAvailableVehicles(vehicles: Vehicle[]) {
  return vehicles.filter((v) => v.status === 'Available');
}

function getAvailableDrivers(drivers: Driver[]) {
  return drivers.filter((d) => d.status === 'Available' && d.name !== 'John');
}

export default function TripsPage() {
  const [vehicles] = useState(initialVehicles);
  const [drivers] = useState(initialDrivers);
  const [trips, setTrips] = useState(initialTrips);
  const [form, setForm] = useState({ source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', distance: '' });
  const [nextId, setNextId] = useState(7);

  const availableVehicles = getAvailableVehicles(vehicles);
  const availableDrivers = getAvailableDrivers(drivers);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle);
  const cargoNum = Number(form.cargoWeight) || 0;
  const capacityNum = selectedVehicle?.capacity ?? 0;
  const overCapacity = cargoNum > capacityNum && capacityNum > 0;
  const canDispatch = form.source && form.destination && form.vehicle && form.driver && !overCapacity && cargoNum > 0;

  const handleDispatch = () => {
    if (!canDispatch) return;
    const trip: Trip = {
      id: `TR00${nextId}`,
      source: form.source,
      destination: form.destination,
      vehicle: form.vehicle,
      driver: form.driver,
      cargoWeight: cargoNum,
      distance: Number(form.distance) || 0,
      status: 'Dispatched',
      eta: 'Calculating...',
    };
    setTrips([trip, ...trips]);
    setNextId(nextId + 1);
    setForm({ source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', distance: '' });
  };

  const handleComplete = (tripId: string) => {
    setTrips(trips.map((t) => t.id === tripId ? { ...t, status: 'Completed', eta: '—' } : t));
  };

  const handleCancel = (tripId: string) => {
    setTrips(trips.map((t) => t.id === tripId ? { ...t, status: 'Cancelled', eta: 'Cancelled' } : t));
  };

  return (
    <Sidebar>
      <div className="p-6">
        {/* Trip Lifecycle */}
        <div className="flex items-center gap-2 mb-6">
          {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                step === 'Dispatched' ? 'bg-chart-1' :
                step === 'Draft' ? 'bg-primary' :
                step === 'Completed' ? 'bg-muted' : 'bg-muted'
              }`} />
              <span className="text-xs">{step}</span>
              {i < 3 && <span className="text-muted-foreground mx-1">→</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Create Trip Form */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">CREATE TRIP</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">SOURCE</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DESTINATION</label>
                <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">VEHICLE (AVAILABLE ONLY)</label>
                <Select value={form.vehicle} onValueChange={(val) => setForm({ ...form, vehicle: val })}>
                  <SelectTrigger className="w-full bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name} - {v.capacity} kg capacity</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">DRIVER (AVAILABLE ONLY)</label>
                <Select value={form.driver} onValueChange={(val) => setForm({ ...form, driver: val })}>
                  <SelectTrigger className="w-full bg-transparent border-border h-[38px] text-sm">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((d) => (
                      <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">CARGO WEIGHT (KG)</label>
                <input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider block mb-1">PLANNED DISTANCE (KM)</label>
                <input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm" />
              </div>

              {overCapacity && (
                <div className="border border-red-500 rounded p-3 text-sm text-destructive">
                  <p>Vehicle Capacity: {capacityNum} kg</p>
                  <p>Cargo Weight: {cargoNum} kg</p>
                  <p>✗ Capacity exceeded by {cargoNum - capacityNum} kg — dispatch blocked</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleDispatch}
                  disabled={!canDispatch}
                  className="bg-chart-1 hover:bg-chart-1 text-white text-sm font-medium px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dispatch
                </Button>
                <Button onClick={() => setForm({ source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', distance: '' })} className="bg-transparent border border-border text-sm font-medium px-6 py-2 rounded transition-colors hover:bg-secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Live Board */}
          <div>
            <h2 className="text-lg font-bold italic mb-4">LIVE BOARD</h2>
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{trip.id}</p>
                      <p className="text-sm text-muted-foreground">{trip.source} → {trip.destination}</p>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{trip.vehicle ? `${trip.vehicle} / ${trip.driver}` : 'Unassigned'}</p>
                      <p className="mt-2">{trip.eta}</p>
                      {trip.status === 'Dispatched' && (
                        <div className="flex gap-2 mt-2 justify-end">
                          <Button onClick={() => handleComplete(trip.id)} className="text-xs bg-primary hover:bg-primary text-white px-2 py-1 rounded">Complete</Button>
                          <Button onClick={() => handleCancel(trip.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Cancel</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground italic mt-4">
              On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
            </p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
