'use client';

import {
  IconCar,
  IconChartBar,
  IconGasStation,
  IconRoute,
  IconSettings,
  IconTools,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { LayoutDashboard } from 'lucide-react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { NavFooter } from '@/components/sidebar/nav-footer';
import { NavHeader } from '@/components/sidebar/nav-header';
import { NavMain } from '@/components/sidebar/nav-main';
import type { SidebarData } from '@/components/sidebar/types';

const data: SidebarData = {
  user: {
    name: 'ephraim',
    email: 'ephraim@blocks.so',
    avatar: '/avatar-01.png',
  },
  navMain: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <NavHeader data={data} />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <NavFooter user={data.user} />
    </Sidebar>
  );
}
