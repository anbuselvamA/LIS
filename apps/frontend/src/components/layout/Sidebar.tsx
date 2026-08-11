'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMenuForRole, MenuItem } from '../../config/menu.config';
import { Role } from '../../types/auth.types';
import { cn } from '../../lib/utils';
import { useResults } from '../../hooks/useResults';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = getMenuForRole(role);
  const { readyResultsQuery, referralResultsQuery } = useResults();

  const newReportsCount = React.useMemo(() => {
    if (role === 'REFERRAL_DOCTOR') {
      if (!referralResultsQuery.data) return 0;
      return referralResultsQuery.data.filter((r: any) => r.isNew).length;
    }
    if (role === 'ADMIN' || role === 'RECEPTIONIST') {
      if (!readyResultsQuery.data) return 0;
      return readyResultsQuery.data.filter((r: any) => r.isNew).length;
    }
    return 0;
  }, [readyResultsQuery.data, referralResultsQuery.data, role]);

  // Group items by adminGroup if role is ADMIN
  const groupedItems = React.useMemo(() => {
    if (role !== 'ADMIN') {
      return { 'General': menuItems };
    }
    const groups: Record<string, MenuItem[]> = { 'Dashboard': [] };
    menuItems.forEach(item => {
      if (!item.adminGroup) {
        groups['Dashboard'].push(item);
      } else {
        if (!groups[item.adminGroup]) {
          groups[item.adminGroup] = [];
        }
        groups[item.adminGroup].push(item);
      }
    });
    return groups;
  }, [menuItems, role]);

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-4">
              {role === 'ADMIN' && groupName !== 'Dashboard' && items.length > 0 && (
                <h4 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {groupName}
                </h4>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                // Extra logic for Lab Test Catalogue (Read Only)
                const isLabTestCatalogue = role === 'LAB_TECHNICIAN' && item.title === 'Test Catalogue';
                const displayTitle = isLabTestCatalogue ? 'Test Catalogue (Read Only)' : item.title;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600',
                      isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-500'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {displayTitle}
                    {item.title === 'Reports & Analytics' && newReportsCount > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                        {newReportsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
