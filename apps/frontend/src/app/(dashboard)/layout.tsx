'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Once loading is done, if no user → redirect to login
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Show loading spinner while restoring session
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading session...</p>
        </div>
      </div>
    );
  }

  // If auth is resolved but no user, show nothing while redirect fires
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar role={user.role} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
