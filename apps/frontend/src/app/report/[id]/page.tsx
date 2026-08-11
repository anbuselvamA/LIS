'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useSample } from '@/hooks/useSamples';
import { useResults } from '@/hooks/useResults';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Printer, Download } from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

// Age calculation helper
function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff); 
  return Math.abs(ageDate.getUTCFullYear() - 1970) + ' Yrs';
}

export default function LaboratoryReport() {
  const params = useParams();
  const sampleId = params.id as string;

  const { data: sample, isLoading: sampleLoading } = useSample(sampleId);
  const { resultsQuery } = useResults();
  const { settingsQuery } = useSettings();
  
  const results = React.useMemo(() => {
    if (!resultsQuery.data) return [];
    return resultsQuery.data.filter(r => r.sampleId === sampleId);
  }, [resultsQuery.data, sampleId]);

  const isLoading = sampleLoading || resultsQuery.isLoading || settingsQuery.isLoading;
  const hospitalProfile = settingsQuery.data?.HOSPITAL_PROFILE || {};
  const reportBranding = settingsQuery.data?.REPORT_BRANDING || { qrEnabled: true, barcodeEnabled: true, electronicVerification: true };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!sample) {
    return <div className="text-center p-12">Report not found.</div>;
  }

  const patient = sample.testOrder?.patient;
  const doctor = sample.testOrder?.referringDoctor;
  
  // Date formatters
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Find verification details
  const verifiedResult = results.find(r => r.resultStatus === 'VERIFIED');
  const isVerified = !!verifiedResult;
  const verifiedDate = verifiedResult?.verifiedAt ? formatDate(verifiedResult.verifiedAt) : '-';

  return (
    <>
      {/* Floating Action Buttons for Screen (Hidden on Print) */}
      <div className="no-print fixed bottom-8 right-8 flex flex-col gap-4">
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          title="Print Report"
        >
          <Printer className="w-6 h-6" />
        </button>
      </div>

      <div className="a4-page font-sans text-slate-900 flex flex-col">
        
        {/* HEADER */}
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
                <Barcode value={sample.barcode || '0000'} width={1.5} height={40} displayValue={false} margin={0} />
              </div>
            )}
            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Report No:</span> RPT-{sample.barcode}</p>
            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Date:</span> {formatDate(new Date().toISOString()).split(',')[0]}</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Status: </span> 
              <span className={isVerified ? "text-emerald-700 font-bold" : "text-amber-600 font-bold"}>
                {isVerified ? 'FINAL / VERIFIED' : 'PENDING'}
              </span>
            </p>
          </div>
        </header>

        <div className="border-b-2 border-slate-800 mb-6 w-full"></div>

        {/* PATIENT INFO */}
        <section className="mb-6">
          <div className="flex justify-between text-xs">
            {/* Left Column */}
            <div className="w-[48%]">
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Patient Name</div>
                <div className="font-semibold text-sm uppercase">{patient?.firstName} {patient?.lastName}</div>
              </div>
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Age / Gender</div>
                <div className="font-medium">{patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : '-'} / {patient?.gender}</div>
              </div>
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Referring Doctor</div>
                <div className="font-medium">{doctor ? `Dr. ${(doctor as any).firstName || ''} ${(doctor as any).lastName || ''}` : 'Self'}</div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="w-[48%]">
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Order Date</div>
                <div className="font-medium">{formatDate(sample.testOrder?.createdAt)}</div>
              </div>
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Patient ID (MRN)</div>
                <div className="font-medium">{patient?.mrn}</div>
              </div>
              <div className="flex py-1">
                <div className="w-32 text-slate-500">Verified Date</div>
                <div className="font-medium">{verifiedDate}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-slate-300 mb-6 w-full"></div>

        {/* INVESTIGATION DETAILS */}
        <section className="mb-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider">{sample.orderItem?.testNameSnapshot}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sample: <span className="font-medium text-slate-800">{sample.id}</span>
            </p>
            <p className="text-xs text-slate-500">
              Barcode: <span className="font-medium text-slate-800">{sample.barcode}</span>
            </p>
            <p className="text-xs text-slate-500">
              Specimen: <span className="font-medium text-slate-800 uppercase">{(sample as any).specimenType || 'BLOOD'}</span>
            </p>
          </div>

          {/* RESULTS TABLE */}
          <table className="w-full text-xs">
            <thead className="border-y-2 border-slate-800">
              <tr>
                <th className="py-2 px-1 text-left font-bold w-2/5">Investigation</th>
                <th className="py-2 px-1 text-right font-bold w-1/5">Result</th>
                <th className="py-2 px-1 text-left font-bold w-1/5 pl-4">Unit</th>
                <th className="py-2 px-1 text-center font-bold w-1/5">Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res: any, idx: number) => {
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
        </section>

        {/* INTERPRETATION / REMARKS */}
        {results.some(r => r.interpretation || r.remarks) && (
          <section className="mb-6 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase mb-2">Clinical Interpretation & Remarks</h3>
            <ul className="list-disc pl-4 space-y-2">
              {results.map(r => {
                if (!r.interpretation && !r.remarks) return null;
                return (
                  <li key={r.id} className="text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-semibold">{r.parameterName}:</span> {r.remarks} {r.interpretation}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* VERIFICATION SIGNATURES */}
        <section className="mt-auto pt-8 flex justify-between items-end">
          <div className="text-[10px] text-slate-500">
            {reportBranding.qrEnabled ? (
              <>
                <QRCodeSVG value={`RPT-${sample.barcode}|${patient?.mrn}|${verifiedDate}`} size={72} className="mb-2" />
                <p>Scan to verify authenticity.</p>
              </>
            ) : null}
          </div>
          
          <div className="text-center w-48">
            {reportBranding.electronicVerification && isVerified ? (
              <div className="mb-2 text-emerald-700 font-bold italic">
                Electronically Verified
              </div>
            ) : (
              <div className="h-6 mb-2"></div>
            )}
            <p className="text-[11px] font-bold">Dr. {hospitalProfile.pathologist || 'Pathologist'}</p>
            <p className="text-[9px] text-slate-500">MD (Pathology)</p>
            <p className="text-[9px] text-slate-500 mt-1 border-t border-slate-300 pt-1">Authorized Signature</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-6 pt-3 border-t border-slate-300 text-[8px] text-slate-500 text-center flex justify-between">
          <span>Confidential Medical Report</span>
          <span>This report is electronically verified and does not require a handwritten signature.</span>
          <span>End of Report</span>
        </footer>

      </div>
    </>
  );
}
