'use client';

import {
  IconDashboard,
  IconCar,
  IconUsers,
  IconMap2,
  IconTools,
  IconGasStation,
  IconChartBar,
} from '@tabler/icons-react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { NavMain } from '@/components/sidebar/nav-main';
import type { SidebarData } from '@/components/sidebar/types';

const data: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@transitops.com',
    avatar: '',
  },
  navMain: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
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
      icon: IconUsers,
    },
    {
      id: 'trips',
      title: 'Trips',
      url: '/trips',
      icon: IconMap2,
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
  ],
  navCollapsible: {
    favorites: [],
    teams: [],
    topics: [],
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
