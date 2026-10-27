import React from 'react';
import { Invoice, CompanySettings } from '@/types';
import { formatCurrency, formatDate, numberToWords } from '@/utils/formatters';

interface InvoicePdfTemplateProps {
  invoice: any;
  settings: CompanySettings | null;
}

export const InvoicePdfTemplate: React.FC<InvoicePdfTemplateProps> = ({ invoice, settings }) => {
  const isIntra = invoice.supplyType?.includes('CGST') || invoice.supplyType?.includes('Intra');
  const applyGst = invoice.hasGst !== false;

  const taxableAmount = invoice.items?.reduce((sum: number, item: any) => {
    const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const disc = raw * ((Number(item.discountPercent) || 0) / 100);
    return sum + (raw - disc);
  }, 0) || 0;

  const totalGst = invoice.items?.reduce((sum: number, item: any) => {
    const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const disc = raw * ((Number(item.discountPercent) || 0) / 100);
    const itemTax = (raw - disc) * (applyGst ? ((Number(item.gstPercent) || 0) / 100) : 0);
    return sum + itemTax;
  }, 0) || 0;

  const cgst = isIntra ? totalGst / 2 : 0;
  const sgst = isIntra ? totalGst / 2 : 0;
  const igst = !isIntra ? totalGst : 0;

  const roundOff = invoice.roundOff || 0;
  const grandTotal = Math.round(taxableAmount + totalGst + roundOff);
  const advance = Number(invoice.advanceReceived || invoice.paidAmount || 0);
  const balance = Math.max(0, grandTotal - advance);

  return (
    <div className="space-y-6 text-[12px] font-sans text-slate-900 leading-normal">
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

        {/* Right: Company & Invoice Header */}
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
            <div>GSTIN: {settings?.companyGstin || '19AAACV1234F1Z5'}</div>
          </div>
          <div className="mt-3 text-sm font-mono font-extrabold text-slate-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            Tax Invoice #: {invoice.invoiceNo}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Date: {formatDate(invoice.date || invoice.issueDate || new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Bill To & Invoice Details Grid */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 border-b border-slate-200 pb-1">
            Billed To (Client / Organization)
          </div>
          <div className="font-extrabold text-sm text-slate-900">{invoice.clientName}</div>
          {invoice.billingAddress && (
            <div className="text-xs mt-1 text-slate-700 whitespace-pre-wrap">{invoice.billingAddress}</div>
          )}
          {invoice.clientState && (
            <div className="text-xs text-slate-600 mt-0.5">State: <strong>{invoice.clientState}</strong></div>
          )}
          {invoice.clientGstin && (
            <div className="text-xs font-mono text-slate-800 mt-0.5">GSTIN: {invoice.clientGstin}</div>
          )}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 border-b border-slate-200 pb-1">
            Dispatch Details
          </div>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="py-0.5 text-slate-500">Supply Type:</td>
                <td className="py-0.5 font-semibold text-right text-slate-800">{invoice.supplyType}</td>
              </tr>
              {invoice.travellers && (
                <tr>
                  <td className="py-0.5 text-slate-500">Travellers (Pax):</td>
                  <td className="py-0.5 font-semibold text-right text-slate-800">{invoice.travellers}</td>
                </tr>
              )}
              {invoice.placeOfIssue && (
                <tr>
                  <td className="py-0.5 text-slate-500">Place of Supply:</td>
                  <td className="py-0.5 font-semibold text-right text-slate-800">{invoice.placeOfIssue}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Lines Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 font-bold text-left text-slate-800 border-b border-slate-200">
            <tr>
              <th className="p-2.5 border-r border-slate-200 w-8 text-center">#</th>
              <th className="p-2.5 border-r border-slate-200">Service Description</th>
              <th className="p-2.5 border-r border-slate-200 text-center w-20">HSN/SAC</th>
              <th className="p-2.5 border-r border-slate-200 text-right w-12">Qty</th>
              <th className="p-2.5 border-r border-slate-200 text-right w-20">Rate</th>
              <th className="p-2.5 border-r border-slate-200 text-right w-16">Disc %</th>
              <th className="p-2.5 border-r border-slate-200 text-right w-24">Taxable</th>
              {applyGst && <th className="p-2.5 border-r border-slate-200 text-right w-16">GST %</th>}
              <th className="p-2.5 text-right font-bold w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items?.map((item: any, idx: number) => {
              const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
              const disc = raw * ((Number(item.discountPercent) || 0) / 100);
              const tax = raw - disc;
              const gstAmt = tax * (applyGst ? ((Number(item.gstPercent) || 0) / 100) : 0);
              const total = tax + gstAmt;

              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">{idx + 1}</td>
                  <td className="p-2.5 border-r border-slate-200">
                    <div className="font-semibold text-slate-900 whitespace-pre-wrap">{item.serviceDetails}</div>
                    {item.vehicles && (
                      <div className="text-[10px] text-slate-500 mt-0.5">Vehicle: {item.vehicles}</div>
                    )}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-center font-mono text-slate-600">
                    {item.hsnSac || '998552'}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-mono">{item.quantity}</td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                    {item.discountPercent ? `${item.discountPercent}%` : '-'}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-mono">{formatCurrency(tax)}</td>
                  {applyGst && (
                    <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                      {item.gstPercent ? `${item.gstPercent}%` : '5%'}
                    </td>
                  )}
                  <td className="p-2.5 text-right font-bold font-mono text-slate-900">{formatCurrency(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Bank Details */}
      <div className="flex justify-between items-start pt-2 gap-6">
        <div className="w-1/2 space-y-3">
          <div className="text-[11px] text-slate-600 border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <span className="font-bold uppercase tracking-wider block mb-1 text-slate-800">
              Bank Details For NEFT / RTGS
            </span>
            <div>Bank: {settings?.bankName || 'HDFC Bank'}</div>
            <div>Account: {settings?.accountName || 'Viyonka Travels'}</div>
            <div>A/c No: {settings?.accountNumber || '502000XXXXXXXX'}</div>
            <div>IFSC: {settings?.ifsc || 'HDFC0001234'} | Branch: {settings?.branch || 'Siliguri'}</div>
            <div className="font-semibold text-[#0284c7] mt-1">UPI ID: {settings?.upiId || 'viyonkatravels@upi'}</div>
          </div>
          <div className="text-xs text-slate-700 bg-sky-50/50 p-2.5 rounded border border-sky-100">
            <span className="font-bold">Total in Words:</span> Indian Rupees {numberToWords(grandTotal)}
          </div>
        </div>

        <div className="w-[45%]">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-1.5 text-slate-600">Total Taxable Value</td>
                <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(taxableAmount)}</td>
              </tr>
              {applyGst && isIntra && (
                <>
                  <tr>
                    <td className="py-1 text-slate-500">CGST (2.5%)</td>
                    <td className="py-1 text-right font-mono">{formatCurrency(cgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">SGST (2.5%)</td>
                    <td className="py-1 text-right font-mono">{formatCurrency(sgst)}</td>
                  </tr>
                </>
              )}
              {applyGst && !isIntra && (
                <tr>
                  <td className="py-1 text-slate-500">IGST (5%)</td>
                  <td className="py-1 text-right font-mono">{formatCurrency(igst)}</td>
                </tr>
              )}
              <tr className="bg-slate-100 font-extrabold text-sm text-[#0284c7]">
                <td className="py-2.5 px-2 uppercase">Grand Total</td>
                <td className="py-2.5 px-2 text-right font-mono">{formatCurrency(grandTotal)}</td>
              </tr>
              {advance > 0 && (
                <tr>
                  <td className="py-1.5 px-2 text-emerald-700 font-semibold">Advance Received</td>
                  <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-semibold">
                    -{formatCurrency(advance)}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-extrabold text-sm">
                <td className="py-2.5 px-3 uppercase tracking-wider">Balance Payable</td>
                <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="pt-8 flex justify-between items-end border-t border-slate-200">
        <div className="text-[10px] text-slate-500 max-w-sm">
          * Disputes are subject to Siliguri, West Bengal jurisdiction.<br />
          * This is a computer-generated tax invoice issued by Viyonka Travels.
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
