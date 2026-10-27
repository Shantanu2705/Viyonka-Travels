import React from 'react';
import { CompanySettings } from '@/types';
import { formatCurrency, formatDate, numberToWords } from '@/utils/formatters';

interface QuotationPdfTemplateProps {
  quotation: any;
  settings: CompanySettings | null;
}

export const QuotationPdfTemplate: React.FC<QuotationPdfTemplateProps> = ({ quotation, settings }) => {
  const companyName = settings?.companyName || 'VIYONKA TRAVELS';
  const companyAddress = settings?.companyAddress || settings?.address || 'Siliguri, West Bengal';
  const companyContact = settings?.phone || '+91 78119 94008 / 97343 24008 / 92423 04008';
  const companyEmail = settings?.email || 'info@viyankatravels.com';
  const companyWebsite = settings?.website || 'www.viyankatravels.com';

  const cabSummary = quotation.vehicles?.length > 0
    ? quotation.vehicles.map((v: any) => `${v.vehicle} × ${String(v.qty || 1).padStart(2, '0')}`).join(', ')
    : (quotation.vehicle || 'Standard Vehicle');

  const grandTotal = Number(quotation.grandTotal || quotation.totalAmount || 0);

  return (
    <div className="space-y-5 text-[13px] leading-relaxed text-slate-900 break-words font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#0284c7] pb-5 gap-4">
        {/* Left: Logo */}
        <div className="shrink-0">
          <img
            src="/logo.jpeg"
            alt="Viyonka Travels Logo"
            className="h-20 w-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Right: Company Details */}
        <div className="text-right">
          <h1 className="text-xl font-extrabold tracking-tight text-[#0284c7] m-0">
            {companyName}
          </h1>
          <div className="text-[11px] font-semibold tracking-wider text-[#f05438] uppercase">
            Go Find Explore
          </div>
          <div className="text-xs text-slate-600 mt-1">{companyAddress}</div>
          <div className="text-xs font-semibold text-slate-700">Phone: {companyContact}</div>
          <div className="text-xs text-slate-600">Email: {companyEmail} | Web: {companyWebsite}</div>
          {quotation.quotationNo && (
            <div className="mt-2 text-xs font-mono font-bold text-[#0284c7]">
              Ref No: {quotation.quotationNo}
            </div>
          )}
        </div>
      </div>

      {/* Greeting Banner */}
      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg text-justify text-slate-800 text-[12.5px] leading-relaxed">
        <strong>Dear {quotation.clientName || quotation.customerName || 'Valued Client'},</strong> with reference to your inquiry, we are pleased to provide you with the comprehensive itinerary and quotation for your upcoming tour to <strong>{quotation.destination || 'your destination'}</strong> ({quotation.packageDuration || 'as scheduled'}). Please review the details below.
      </div>

      {/* Meta Date & Pax Bar */}
      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div>
          <span className="font-bold text-slate-700">Travel Date:</span>{' '}
          <span className="font-semibold text-[#0284c7]">{formatDate(quotation.startDate || quotation.date || new Date().toISOString())}</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-slate-700">Client Mobile:</span>{' '}
          <span className="font-mono font-semibold">{quotation.clientPhone || quotation.mobile || 'Not provided'}</span>
        </div>
      </div>

      {/* Day-Wise Itinerary */}
      {quotation.itinerary && quotation.itinerary.length > 0 && (
        <div className="space-y-3.5 pt-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#0284c7] border-b pb-1">
            Day-Wise Tour Itinerary
          </div>
          {quotation.itinerary.map((item: any, idx: number) => (
            <div key={idx} className="border-l-2 border-[#0284c7] pl-3 py-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#0284c7] text-white font-bold text-[11px] px-2 py-0.5 rounded">
                  Day {idx + 1}
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {item.heading || item.title || `Day ${idx + 1}`}
                </span>
              </div>
              <div className="text-justify text-slate-700 text-xs leading-normal">
                {item.desc || item.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Passengers (Pax)</div>
          <div className="font-extrabold text-slate-900 text-sm mt-0.5">
            {quotation.passengers || quotation.persons || '1'} Person(s)
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Vehicles Allocated</div>
          <div className="font-bold text-slate-900 text-xs mt-0.5">{cabSummary}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Status</div>
          <div className="font-bold text-emerald-600 text-xs mt-0.5">
            {quotation.status || 'Draft'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Package Cost</div>
          <div className="font-extrabold text-[#f05438] text-sm mt-0.5">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="text-xs font-semibold text-slate-700 bg-sky-50/50 p-2 rounded border border-sky-100">
        <span className="font-bold text-slate-900">Total in Words:</span> Indian Rupees {numberToWords(grandTotal)}
      </div>

      {/* Inclusions & Exclusions */}
      {(quotation.inclusions?.length > 0 || quotation.exclusions?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {quotation.inclusions?.length > 0 && (
            <div className="border border-emerald-200/80 rounded-xl p-3 bg-emerald-50/30">
              <div className="font-bold text-emerald-800 uppercase tracking-wide text-[11px] mb-2">
                ✓ Package Inclusions:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {quotation.inclusions.map((inc: string, i: number) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>
          )}

          {quotation.exclusions?.length > 0 && (
            <div className="border border-rose-200/80 rounded-xl p-3 bg-rose-50/30">
              <div className="font-bold text-rose-800 uppercase tracking-wide text-[11px] mb-2">
                ✕ Package Exclusions:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {quotation.exclusions.map((exc: string, i: number) => (
                  <li key={i}>{exc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Terms & Conditions */}
      {(quotation.terms || settings?.terms) && (
        <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
          <div className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
            Terms & Conditions:
          </div>
          <div className="whitespace-pre-wrap leading-relaxed text-[11.5px] bg-slate-50 p-3 rounded-lg border border-slate-100">
            {quotation.terms || settings?.terms}
          </div>
        </div>
      )}

      {/* Signatory Block */}
      <div className="flex justify-between items-end pt-8 mt-6 border-t border-slate-200">
        <div className="text-[10px] text-slate-500">
          * This is an official quotation proposal generated by Viyonka Travels.<br />
          * Subject to availability of vehicle and room inventory at the time of final booking.
        </div>
        <div className="text-center w-56">
          <div className="border-b-2 border-dashed border-slate-300 pb-10 mb-1"></div>
          <div className="font-extrabold text-slate-800 uppercase text-[11px]">
            For {companyName}
          </div>
          <div className="text-[10px] text-slate-500">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
};
