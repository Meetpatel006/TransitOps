'use client';

import {
  IconCar,
  IconChartBar,
  IconGasStation,
  IconRoute,
  IconSettings,
  IconTools,
  IconTruckDelivery,
  IconUser,
  IconUsers,
  IconPalette,
} from '@tabler/icons-react';
import { LayoutDashboard } from 'lucide-react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { NavFooter } from '@/components/sidebar/nav-footer';
import { NavHeader } from '@/components/sidebar/nav-header';
import { NavMain } from '@/components/sidebar/nav-main';
import type { SidebarData } from '@/components/sidebar/types';
import { useAuth } from '@/hooks/use-auth';
import { canView, type Resource } from '@/lib/rbac';

const RESOURCE_FOR_NAV: Record<string, Resource> = {
  fleet: 'fleet',
  drivers: 'drivers',
  trips: 'trips',
  maintenance: 'fleet',
  'fuel-expenses': 'fuel_exp',
  analytics: 'analytics',
};

const navItems: SidebarData['navMain'] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    id: 'fleet',
    title: 'Fleet',
    url: '/fleet',
    icon: IconCar,
  },
  {
    id: 'drivers',
    title: 'Drivers',
    url: '/drivers',
    icon: IconTruckDelivery,
  },
  {
    id: 'trips',
    title: 'Trips',
    url: '/trips',
    icon: IconRoute,
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    url: '/maintenance',
    icon: IconTools,
  },
  {
    id: 'fuel-expenses',
    title: 'Fuel & Expenses',
    url: '/fuel-expenses',
    icon: IconGasStation,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    url: '/analytics',
    icon: IconChartBar,
  },
  {
    id: 'settings',
    title: 'Settings',
    url: '/settings',
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const visibleNav = navItems.filter(
    (item) => !RESOURCE_FOR_NAV[item.id] || canView(user?.role_name, RESOURCE_FOR_NAV[item.id]),
  );

  const data: SidebarData = {
    user: {
      name: user?.name || 'User',
      email: user?.email || '',
      avatar: '/avatar-01.png',
    },
    navMain: visibleNav,
  };

  return (
    <Sidebar {...props}>
      <NavHeader data={data} />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <NavFooter />
    </Sidebar>
  );
}
