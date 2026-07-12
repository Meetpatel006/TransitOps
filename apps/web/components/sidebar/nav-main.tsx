'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/components/sidebar/types';

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.id} item={item} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = item.children
    ? item.children.some((c) => c.url && pathname.startsWith(c.url))
    : pathname === item.url;
  const isExpanded = item.children
    ? item.children.some((c) => c.url && pathname.startsWith(c.url))
    : false;

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.url ?? '#'} />}
          isActive={isActive}
          tooltip={item.title}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={isExpanded}>
        <CollapsibleTrigger render={
          <SidebarMenuButton tooltip={item.title} isActive={isActive} />
        }>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          <span className="flex-1">{item.title}</span>
          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    render={<Link href={child.url ?? '#'} />}
                    isActive={pathname === child.url}
                  >
                    {ChildIcon && <ChildIcon className="h-4 w-4" />}
                    <span>{child.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
