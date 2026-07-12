'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconSettings,
  IconUsers,
  IconUser,
  IconPalette,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/use-auth';

const tabs = [
  { id: 'general', label: 'General', icon: IconSettings },
  { id: 'roles', label: 'Roles & Access', icon: IconUsers },
  { id: 'profile', label: 'Profile', icon: IconUser },
] as const;

const rbacData = [
  { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuelExp: '—', analytics: '✓' },
  { role: 'Dispatcher', fleet: 'view', drivers: '—', trips: '✓', fuelExp: '—', analytics: '—' },
  { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'view', fuelExp: '—', analytics: '—' },
  { role: 'Financial Analyst', fleet: 'view', drivers: '—', trips: '—', fuelExp: '✓', analytics: '✓' },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const { user } = useAuth();

  const [form, setForm] = useState({
    depotName: 'Gandhinagar Depot GJW',
    currency: 'INR (₹)',
    distanceUnit: 'Kilometers',
  });
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
  });
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || 'User', email: user.email || '' });
    }
  }, [user]);

  const handleTabChange = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`);
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your depot configuration, users, and preferences.
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-52 shrink-0 border-r border-border p-3 space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="max-w-lg space-y-6">
                <div>
                  <h2 className="text-base font-semibold mb-1">Depot Settings</h2>
                  <p className="text-sm text-muted-foreground">Basic configuration for your fleet depot.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide">DEPOT NAME</Label>
                    <Input value={form.depotName} onChange={(e) => setForm({ ...form, depotName: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold tracking-wide">CURRENCY</Label>
                      <Select value={form.currency} onValueChange={(v) => v && setForm({ ...form, currency: v })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                          <SelectItem value="USD ($)">USD ($)</SelectItem>
                          <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                          <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold tracking-wide">DISTANCE UNIT</Label>
                      <Select value={form.distanceUnit} onValueChange={(v) => v && setForm({ ...form, distanceUnit: v })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kilometers">Kilometers</SelectItem>
                          <SelectItem value="Miles">Miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">Save changes</Button>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold mb-1">Roles & Access Control</h2>
                  <p className="text-sm text-muted-foreground">View which permissions each role has across your fleet.</p>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow className="border-b border-border text-xs tracking-wider text-muted-foreground">
                        <TableHead className="text-left p-3 font-semibold">ROLE</TableHead>
                        <TableHead className="text-center p-3 font-semibold">FLEET</TableHead>
                        <TableHead className="text-center p-3 font-semibold">DRIVERS</TableHead>
                        <TableHead className="text-center p-3 font-semibold">TRIPS</TableHead>
                        <TableHead className="text-center p-3 font-semibold">FUEL/EXP</TableHead>
                        <TableHead className="text-center p-3 font-semibold">ANALYTICS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rbacData.map((row) => (
                        <TableRow key={row.role} className="border-b border-border last:border-0">
                          <TableCell className="p-3 font-medium">{row.role}</TableCell>
                          <TableCell className="p-3 text-center">{row.fleet}</TableCell>
                          <TableCell className="p-3 text-center">{row.drivers}</TableCell>
                          <TableCell className="p-3 text-center">{row.trips}</TableCell>
                          <TableCell className="p-3 text-center">{row.fuelExp}</TableCell>
                          <TableCell className="p-3 text-center">{row.analytics}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-lg space-y-6">
                <div>
                  <h2 className="text-base font-semibold mb-1">Your Profile</h2>
                  <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    <AvatarImage src="" alt={profile.name} />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">Change avatar</Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide">FULL NAME</Label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide">EMAIL</Label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wide">NEW PASSWORD</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">Update profile</Button>

                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <IconPalette className="size-4" />
                      Appearance
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Control how the application looks and feels.</p>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex-1 py-6 rounded-lg border text-sm font-medium transition-colors ${
                          theme === opt.value ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400' : 'border-border hover:bg-accent/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
