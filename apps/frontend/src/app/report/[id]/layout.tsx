import * as React from 'react';
import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Laboratory Report',
  description: 'Enterprise Medical Laboratory Report',
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white !important;
            }
            .no-print {
              display: none !important;
            }
            .a4-page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 15mm;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
          }
          /* Screen styling to preview A4 format */
          @media screen {
            body {
              background-color: #f1f5f9;
              padding: 2rem 0;
              margin: 0;
            }
            .a4-page {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              margin: 0 auto;
              background: white;
              box-sizing: border-box;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            }
          }
        `}</style>
      </head>
      <body className={`font-sans text-slate-900 bg-white`}>
        {children}
      </body>
    </html>
  );
}
