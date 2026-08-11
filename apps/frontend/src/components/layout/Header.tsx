'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Bell, User, Activity, Settings, LogOut, Server, Printer, Database, Wifi } from 'lucide-react';
import { Button } from '../ui/button';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export function Header() {
  const { user } = useAuth();
  const [time, setTime] = useState<Date | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live Clock Effect
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const formattedDate = time ? time.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : 'Loading date...';

  const formattedTime = time ? time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) : 'Loading time...';

  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all">
      {/* Left Section: Branding */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight tracking-tight text-gray-900">
            Freelancerz Enterprise
          </span>
          <span className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
            Laboratory Information System
          </span>
        </div>
      </div>

      {/* Center Section: Live Clock */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <span className="text-sm font-medium text-gray-600">
          {formattedDate}
        </span>
        <span className="text-lg font-bold tracking-tight text-gray-900 font-mono">
          {formattedTime}
        </span>
      </div>

      {/* Right Section: Status, Notifications, User */}
      <div className="flex items-center gap-6">
        
        {/* Future Ready System Status Placeholders */}
        <div className="hidden lg:flex items-center gap-3 border-r border-gray-200 pr-6">
          <div className="flex flex-col items-center gap-1 group cursor-help">
            <Server className="h-4 w-4 text-green-500" />
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-help">
            <Database className="h-4 w-4 text-green-500" />
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-help">
            <Printer className="h-4 w-4 text-gray-300" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-help">
            <Wifi className="h-4 w-4 text-green-500" />
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 rounded-full border border-gray-200 p-1 pr-3 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold leading-none text-gray-900">
                  {user?.email ? user.email.split('@')[0] : 'Admin'}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  {user?.role ? user.role.replace('_', ' ') : 'Administrator'}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'admin@hospital.com'}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.role ? user.role.replace('_', ' ') : 'Administrator'}</p>
                </div>
                <div className="p-1 space-y-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <User className="h-4 w-4 text-gray-500" />
                    My Profile
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="h-4 w-4 text-gray-500" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 p-1 mt-1">
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
