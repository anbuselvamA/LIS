'use client';

import * as React from 'react';
import { useBarcode } from '../../../../../hooks/useBarcode';
import { Loader2, AlertCircle, Printer, Download } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function BarcodePreview({ sampleId, barcodeText }: { sampleId: string, barcodeText: string }) {
  const { data: barcodeUrl, isLoading, isError } = useBarcode(sampleId);

  const handlePrint = () => {
    if (!barcodeUrl) return;
    
    // Create an iframe to print just the image
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
    
    // Write an image tag to the iframe document
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
              @media print {
                @page { size: auto; margin: 0mm; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <img src="${barcodeUrl}" alt="Barcode" />
          </body>
        </html>
      `);
      doc.close();
    }
  };

  const handleDownload = () => {
    if (!barcodeUrl) return;
    const link = document.createElement('a');
    link.href = barcodeUrl;
    link.download = `barcode-${barcodeText}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
        <span className="text-sm text-slate-500">Generating barcode...</span>
      </div>
    );
  }

  if (isError || !barcodeUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-200 rounded-xl bg-red-50 text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-sm font-medium">Failed to load barcode</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={barcodeUrl} alt="Sample Barcode" className="max-w-full h-auto mix-blend-multiply" />
      </div>
      
      <div className="flex items-center justify-center gap-3 w-full">
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print Label
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
