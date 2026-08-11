import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  dashboardHref: string;
  breadcrumbLabel: string;
  sprint?: string;
}

export function ComingSoonPage({
  icon: Icon,
  title,
  description,
  features,
  dashboardHref,
  breadcrumbLabel,
  sprint = 'Next Sprint',
}: ComingSoonPageProps) {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 sm:p-8 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={dashboardHref} className="hover:text-blue-600 transition-colors">
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">{breadcrumbLabel}</span>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Gradient background orb */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-50 opacity-60 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-50 opacity-50 blur-3xl" />

        <div className="relative flex flex-col items-center px-8 py-16 text-center sm:py-20">
          {/* Animated icon */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-inner ring-1 ring-blue-100">
            <Icon className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
          </div>

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Coming in {sprint}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-xl text-base text-gray-500 leading-relaxed">
            {description}
          </p>

          {/* Feature Pills */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600"
              >
                <Sparkles className="h-3 w-3 text-blue-500" />
                {feature}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
