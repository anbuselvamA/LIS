'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Printer, Download } from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff); 
  return Math.abs(ageDate.getUTCFullYear() - 1970) + ' Yrs';
}

export default function OrderLaboratoryReport() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isPrint = searchParams.get('print') === 'true';

  const { data: order, isLoading: isOrderLoading } = useOrder(orderId);
  const { settingsQuery } = useSettings();
  const isLoading = isOrderLoading || settingsQuery.isLoading;

  const hospitalProfile = settingsQuery.data?.HOSPITAL_PROFILE || {};
  const reportBranding = settingsQuery.data?.REPORT_BRANDING || { qrEnabled: true, barcodeEnabled: true, electronicVerification: true };

  React.useEffect(() => {
    if (isPrint && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isPrint, order]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center p-12">Report not found.</div>;
  }

  const patient = order.patient;
  const doctor = order.referringDoctor;
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Collect all results and find max verification date
  let allResults: any[] = [];
  let maxVerifiedTime: Date | null = null;
  let isFullyVerified = true;
  
  order.items?.forEach((item: any) => {
    if (item.sample?.results) {
      allResults = [...allResults, ...item.sample.results];
      item.sample.results.forEach((res: any) => {
         if (res.resultStatus !== 'VERIFIED') isFullyVerified = false;
         if (res.verifiedAt) {
           const vTime = new Date(res.verifiedAt);
           if (!maxVerifiedTime || vTime > maxVerifiedTime) maxVerifiedTime = vTime;
         }
      });
    } else {
      isFullyVerified = false; // missing samples/results means not verified
    }
  });

  const verifiedDate = maxVerifiedTime ? formatDate(maxVerifiedTime) : '-';

  return (
    <>
      <div className="no-print fixed bottom-8 right-8 flex flex-col gap-4">
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          title="Print Report"
        >
          <Printer className="w-6 h-6" />
        </button>
      </div>

      <div className="a4-page font-sans text-slate-900 flex flex-col bg-white">
        
        <header className="mb-6 flex justify-between items-start">
          <div className="flex gap-4">
            {reportBranding.logoUrl ? (
              <img src={reportBranding.logoUrl} alt="Laboratory Logo" className="w-20 h-20 object-contain rounded-lg border border-slate-200" />
            ) : (
              <div className="w-20 h-20 bg-primary-900 text-white flex items-center justify-center font-bold text-2xl rounded-lg">
                LOGO
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                {reportBranding.headerTitle || hospitalProfile.name || 'Diagnostic Laboratory'}
              </h1>
              <p className="text-xs text-slate-600 font-medium">{reportBranding.subtitle || hospitalProfile.license || ''}</p>
              <p className="text-xs text-slate-500 mt-1">
                {[hospitalProfile.address1, hospitalProfile.address2, hospitalProfile.city, hospitalProfile.state, hospitalProfile.zip].filter(Boolean).join(', ') || 'Address not configured'}
              </p>
              <p className="text-xs text-slate-500">
                Ph: {hospitalProfile.phone || '-'} | {hospitalProfile.email || '-'} | {hospitalProfile.website || '-'}
              </p>
            </div>
          </div>
          <div className="text-right">
            {reportBranding.barcodeEnabled && (
              <div className="flex justify-end mb-2">
                <Barcode value={order.orderNumber || '0000'} width={1.5} height={40} displayValue={false} margin={0} />
              </div>
            )}
            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Order No:</span> {order.orderNumber}</p>
            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Date:</span> {formatDate(order.createdAt).split(',')[0]}</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Status: </span> 
              <span className={isFullyVerified ? "text-emerald-700 font-bold" : "text-amber-600 font-bold"}>
                {isFullyVerified ? 'FINAL / VERIFIED' : 'PARTIAL / PENDING'}
              </span>
            </p>
          </div>
        </header>

        <div className="border-b-2 border-slate-800 mb-6 w-full"></div>

        <section className="mb-6">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 text-slate-500">Patient Name</td>
                <td className="w-1/4 py-1 font-semibold text-sm uppercase">{patient?.firstName} {patient?.lastName}</td>
                <td className="w-1/4 py-1 text-slate-500">Order Date</td>
                <td className="w-1/4 py-1 font-medium">{formatDate(order.createdAt)}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500">Age / Gender</td>
                <td className="py-1 font-medium">{patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : '-'} / {patient?.gender}</td>
                <td className="py-1 text-slate-500">Patient ID (MRN)</td>
                <td className="py-1 font-medium">{patient?.mrn}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500">Referring Doctor</td>
                <td className="py-1 font-medium">{doctor ? `Dr. ${(doctor as any).firstName || ''} ${(doctor as any).lastName || ''}` : 'Self'}</td>
                <td className="py-1 text-slate-500">Verified Date</td>
                <td className="py-1 font-medium">{verifiedDate}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="border-b border-slate-300 mb-6 w-full"></div>

        {order.items?.map((item: any) => (
          <section key={item.id} className="mb-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider">{item.testNameSnapshot}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sample: <span className="font-medium text-slate-800">{item.sample?.sampleNumber || '-'}</span> | 
                Barcode: <span className="font-medium text-slate-800">{item.sample?.barcode || '-'}</span> |
                Specimen: <span className="font-medium text-slate-800">{item.test?.specimenType || 'Blood/Serum'}</span>
              </p>
            </div>

            {item.sample?.results && item.sample.results.length > 0 ? (
              <table className="w-full text-xs mb-4">
                <thead className="border-y-2 border-slate-800">
                  <tr>
                    <th className="py-2 px-1 text-left font-bold w-2/5">Investigation</th>
                    <th className="py-2 px-1 text-right font-bold w-1/5">Result</th>
                    <th className="py-2 px-1 text-left font-bold w-1/5 pl-4">Unit</th>
                    <th className="py-2 px-1 text-center font-bold w-1/5">Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  {item.sample.results.map((res: any, idx: number) => {
                    const isAbnormal = res.abnormalFlag !== 'NORMAL';
                    const isCritical = res.abnormalFlag?.includes('CRITICAL');
                    
                    return (
                      <tr key={res.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="py-3 px-1 text-left font-medium">{res.parameterName}</td>
                        <td className="py-3 px-1 text-right font-bold">
                          <span className={isAbnormal ? 'font-bold' : ''}>{res.resultValue}</span>
                          {isAbnormal && (
                            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded ${isCritical ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}>
                              {res.abnormalFlag.replace('CRITICAL_', 'C-')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-1 text-left text-slate-600 pl-4">{res.unit || '-'}</td>
                        <td className="py-3 px-1 text-center text-slate-600">{res.referenceRange || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-center text-slate-500 italic py-4">Pending Results</p>
            )}
            
            {item.sample?.results?.some((r: any) => r.interpretation || r.remarks) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase mb-2">Clinical Interpretation & Remarks</h3>
                <ul className="list-disc pl-4 space-y-2">
                  {item.sample.results.map((r: any) => {
                    if (!r.interpretation && !r.remarks) return null;
                    return (
                      <li key={r.id} className="text-[11px] text-slate-700 leading-relaxed">
                        <span className="font-semibold">{r.parameterName}:</span> {r.remarks} {r.interpretation}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        ))}

        <section className="mt-auto pt-12 flex justify-between items-end break-inside-avoid">
          <div className="text-[10px] text-slate-500">
            {reportBranding.qrEnabled ? (
              <>
                <QRCodeSVG value={`ORD-${order.orderNumber}|${patient?.mrn}|${verifiedDate}`} size={64} className="mb-2" />
                <p>Scan to verify authenticity.</p>
              </>
            ) : null}
          </div>
          
          <div className="text-center w-48">
            {reportBranding.electronicVerification && isFullyVerified ? (
              <div className="mb-2 text-emerald-700 font-bold italic border-b border-dashed border-emerald-300 pb-2">
                Electronically Verified
              </div>
            ) : (
              <div className="h-12 border-b border-dashed border-slate-300 mb-2"></div>
            )}
            <p className="text-[11px] font-bold">Dr. {hospitalProfile.pathologist || 'Pathologist'}</p>
            <p className="text-[9px] text-slate-500">MD (Pathology)</p>
            <p className="text-[9px] text-slate-500">Authorized Signatory</p>
          </div>
        </section>

        <footer className="mt-8 pt-4 border-t border-slate-300 text-[8px] text-slate-500 text-center flex justify-between break-inside-avoid">
          <span>Confidential Medical Report</span>
          <span>This report is electronically verified and does not require a handwritten signature.</span>
          <span>End of Report</span>
        </footer>

      </div>
    </>
  );
}
