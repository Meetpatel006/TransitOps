'use client';

import Sidebar from '@/components/sidebar';

const stats = [
  { label: 'ACTIVE VEHICLES', value: '53', color: 'border-l-blue-500' },
  { label: 'AVAILABLE VEHICLES', value: '42', color: 'border-l-orange-500' },
  { label: 'VEHICLES IN MAINTENANCE', value: '05', color: 'border-l-orange-500' },
  { label: 'ACTIVE TRIPS', value: '18', color: 'border-l-gray-500' },
  { label: 'PENDING TRIPS', value: '09', color: 'border-l-gray-500' },
  { label: 'DRIVERS ON DUTY', value: '26', color: 'border-l-gray-500' },
  { label: 'FLEET UTILIZATION', value: '81%', color: 'border-l-green-500' },
];

const recentTrips = [
  { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', statusColor: 'bg-orange-500', eta: '45 min' },
  { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', statusColor: 'bg-green-500', eta: '—' },
  { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', statusColor: 'bg-blue-500', eta: '1h 10m' },
  { trip: 'TR004', vehicle: '—', driver: '—', status: 'Draft', statusColor: 'bg-gray-500', eta: 'Awaiting vehicle' },
];

const vehicleStatus = [
  { label: 'Available', percentage: 75, color: 'bg-green-500' },
  { label: 'On Trip', percentage: 35, color: 'bg-blue-500' },
  { label: 'In Shop', percentage: 15, color: 'bg-orange-500' },
  { label: 'Retired', percentage: 5, color: 'bg-pink-500' },
];

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">FILTERS</span>
          <select className="bg-secondary border border-border rounded px-3 py-1.5 text-sm">
            <option>Vehicle Type: All</option>
          </select>
          <select className="bg-secondary border border-border rounded px-3 py-1.5 text-sm">
            <option>Status: All</option>
          </select>
          <select className="bg-secondary border border-border rounded px-3 py-1.5 text-sm">
            <option>Region: All</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-7 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-card border border-border rounded-lg p-4 border-l-4 ${stat.color}`}
            >
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </div>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Trips */}
          <div className="col-span-2">
            <h2 className="text-sm font-semibold tracking-wider mb-4">RECENT TRIPS</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs tracking-wider">
                    <th className="text-left p-3 font-semibold">TRIP</th>
                    <th className="text-left p-3 font-semibold">VEHICLE</th>
                    <th className="text-left p-3 font-semibold">DRIVER</th>
                    <th className="text-left p-3 font-semibold">STATUS</th>
                    <th className="text-left p-3 font-semibold">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.trip} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{trip.trip}</td>
                      <td className="p-3">{trip.vehicle}</td>
                      <td className="p-3">{trip.driver}</td>
                      <td className="p-3">
                        <span className={`${trip.statusColor} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{trip.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Status */}
          <div>
            <h2 className="text-sm font-semibold tracking-wider mb-4">VEHICLE STATUS</h2>
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {vehicleStatus.map((status) => (
                <div key={status.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{status.label}</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} rounded-full`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
