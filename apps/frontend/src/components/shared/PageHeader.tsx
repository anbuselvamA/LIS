import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center space-x-1 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-blue-600">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex w-full shrink-0 sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
