import React from 'react';
import { Receipt, CompanySettings } from '@/types';
import { formatCurrency, formatDate, numberToWords } from '@/utils/formatters';

interface ReceiptPdfTemplateProps {
  receipt: any;
  settings: CompanySettings | null;
}

export const ReceiptPdfTemplate: React.FC<ReceiptPdfTemplateProps> = ({ receipt, settings }) => {
  const received = Number(receipt.amount || receipt.receivedAmount || 0);
  const grandTotal = Number(receipt.grandTotal || 0);
  const balance = Math.max(0, grandTotal - received);

  return (
    <div className="space-y-6 text-[13px] font-sans text-slate-900 leading-normal">
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

        {/* Right: Company & Receipt Details */}
        <div className="flex flex-col items-end text-right">
          <h1 className="text-xl font-extrabold tracking-tight uppercase text-[#0284c7]">
            {settings?.companyName || 'VIYONKA TRAVELS'}
          </h1>
          <div className="text-[11px] font-semibold tracking-wider text-[#f05438] uppercase">
            Go Find Explore
          </div>
          <p className="text-[11px] text-slate-600 mt-1 max-w-[320px]">
            {settings?.companyAddress || 'Siliguri, West Bengal'}
          </p>
          <div className="mt-1 text-[10px] font-mono space-y-0.5 text-slate-500">
            <div>Phone: {settings?.phone || '+91 78119 94008'}</div>
            <div>Email: {settings?.email || 'info@viyankatravels.com'}</div>
          </div>
          <div className="mt-3 text-sm font-mono font-extrabold text-slate-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            Receipt #: {receipt.receiptNo}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Date: {formatDate(receipt.date || new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Heading Title */}
      <div className="text-center font-extrabold text-base border-y-2 border-dashed border-slate-200 py-2.5 text-[#0284c7] uppercase tracking-widest bg-sky-50/50">
        {balance <= 0 && grandTotal > 0 ? 'Full Payment Acknowledgment Receipt' : 'Confirmation Cum Advance Money Receipt'}
      </div>

      {/* Receipt Body Statement */}
      <div className="space-y-5 pt-3 text-[14px] text-slate-800 leading-loose">
        <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
          <span className="font-bold text-slate-600 shrink-0">Received with thanks from:</span>
          <span className="font-extrabold text-slate-900 font-mono text-base pl-2">{receipt.clientName}</span>
        </div>

        <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
          <span className="font-bold text-slate-600 shrink-0">The sum of Rupees (in words):</span>
          <span className="italic font-bold text-[#0284c7] pl-2">
            Indian Rupees {numberToWords(received)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
            <span className="font-bold text-slate-600 shrink-0">Payment Mode:</span>
            <span className="font-bold text-slate-900 font-mono pl-2">{receipt.paymentMethod || 'UPI / Online'}</span>
          </div>
          <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
            <span className="font-bold text-slate-600 shrink-0">Transaction / Ref ID:</span>
            <span className="font-bold text-slate-900 font-mono pl-2">{receipt.referenceNo || 'N/A'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
            <span className="font-bold text-slate-600 shrink-0">Against Package Ref:</span>
            <span className="font-bold text-slate-900 font-mono pl-2">
              {receipt.quotationNo || receipt.bookingReference || 'Tour Booking'}
            </span>
          </div>
          <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
            <span className="font-bold text-slate-600 shrink-0">Destination:</span>
            <span className="font-bold text-slate-900 pl-2">{receipt.destination || 'North Bengal / Sikkim'}</span>
          </div>
        </div>

        {receipt.remarks && (
          <div className="flex items-end gap-2 border-b border-dotted border-slate-300 pb-1">
            <span className="font-bold text-slate-600 shrink-0">Remarks / Stay Notes:</span>
            <span className="font-medium text-slate-800 pl-2">{receipt.remarks}</span>
          </div>
        )}
      </div>

      {/* Ledger Highlight Box */}
      <div className="grid grid-cols-3 gap-4 pt-6 text-center">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase">Package Grand Total</div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">{formatCurrency(grandTotal)}</div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="text-xs font-bold text-emerald-700 uppercase">Amount Received</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{formatCurrency(received)}</div>
        </div>
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <div className="text-xs font-bold text-rose-700 uppercase">Balance Outstanding</div>
          <div className="text-lg font-extrabold text-rose-700 mt-1">{formatCurrency(balance)}</div>
        </div>
      </div>

      {/* Footer Notes & Signatures */}
      <div className="pt-10 flex justify-between items-end border-t border-slate-200">
        <div className="text-[10px] text-slate-500 max-w-sm space-y-1">
          <div>* Receipt subject to realization of Cheque / DD / Online Fund Transfer.</div>
          <div>* Computer-generated official receipt from Viyonka Travels.</div>
        </div>
        <div className="text-center w-56">
          <div className="border-b-2 border-dashed border-slate-300 pb-10 mb-1"></div>
          <div className="font-extrabold text-slate-800 uppercase text-[11px]">
            For {settings?.companyName || 'VIYONKA TRAVELS'}
          </div>
          <div className="text-[10px] text-slate-500">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
};
