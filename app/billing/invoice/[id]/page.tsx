'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Invoice, InvoiceItem, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { InvoicePdfTemplate } from '@/components/pdf/invoice-template';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, Trash2, Save, Download, Plus } from 'lucide-react';

const INDIAN_STATES = [
  'West Bengal', 'Sikkim', 'Assam', 'Bihar', 'Delhi', 'Maharashtra', 'Karnataka',
  'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Odisha', 'Kerala', 'Rajasthan',
  'Punjab', 'Haryana', 'Madhya Pradesh', 'Telangana', 'Andhra Pradesh', 'Goa'
];

function InvoiceEditorPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const { invoices, addInvoice, updateInvoice, deleteInvoice, quotations, bookings, settings } = useFleetStore();
  const quotationId = searchParams.get('quotationId');
  const bookingId = searchParams.get('bookingId');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const defaultInvoiceNo = `VT-INV-${new Date().getFullYear()}-${String(invoices.length + 101).padStart(3, '0')}`;

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNo: defaultInvoiceNo,
    hasGst: true,
    status: 'unpaid',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Due on Tour Completion',
    travellers: '2 Pax',
    clientName: '',
    clientGstin: '',
    clientState: 'West Bengal',
    supplyType: 'Intra-State (CGST + SGST)',
    billingAddress: '',
    items: [
      {
        id: Math.random().toString(36).substring(2, 9),
        serviceDetails: 'Complete North Bengal & Sikkim Tour Package',
        vehicles: 'Innova Crysta',
        hsnSac: '998552',
        quantity: 1,
        rate: 25000,
        discountPercent: 0,
        gstPercent: 5,
      },
    ],
    roundOff: 0,
    advanceReceived: 0,
    placeOfIssue: 'Siliguri',
    signatoryName: 'Authorized Signatory',
  });

  useEffect(() => {
    if (!isNew) {
      const existing = invoices.find((i) => i.id === id);
      if (existing) setInvoice(existing);
    } else if (quotationId) {
      const q = quotations.find((x) => x.id === quotationId);
      if (q) {
        setInvoice((prev) => ({
          ...prev,
          quotationId: q.id,
          clientName: q.clientName || q.customerName || '',
          clientPhone: q.clientPhone || q.mobile || '',
          clientState: 'West Bengal',
          travellers: `${q.passengers || q.persons || 2} Pax`,
          items: [
            {
              id: Math.random().toString(36).substring(2, 9),
              serviceDetails: `Tour Package for ${q.clientName || q.customerName}\nDestination: ${q.destination || 'North Bengal / Sikkim'}\nDuration: ${q.packageDuration || 'Tour Package'}`,
              vehicles: q.vehicles?.[0]?.vehicle || q.vehicle || 'Innova Crysta',
              hsnSac: '998552',
              quantity: 1,
              rate: q.subtotal || q.baseAmount || q.totalAmount || 25000,
              discountPercent: 0,
              gstPercent: 5,
            },
          ],
        }));
      }
    } else if (bookingId) {
      const b = bookings.find((x) => x.id === bookingId);
      if (b) {
        setInvoice((prev) => ({
          ...prev,
          bookingId: b.id,
          clientName: b.clientName || '',
          advanceReceived: b.advance || 0,
          items: [
            {
              id: Math.random().toString(36).substring(2, 9),
              serviceDetails: `Vehicle Rental & Travel Transfer\nRoute: ${b.pickup} to ${b.destination}`,
              vehicles: b.vehicle || '',
              hsnSac: '998552',
              quantity: 1,
              rate: b.amount || 0,
              discountPercent: 0,
              gstPercent: 5,
            },
          ],
        }));
      }
    }
  }, [isNew, id, invoices, quotationId, bookingId, quotations, bookings]);

  // Intra-state vs Inter-state
  useEffect(() => {
    if (invoice.clientState === 'West Bengal') {
      setInvoice((prev) => ({ ...prev, supplyType: 'Intra-State (CGST + SGST)' }));
    } else if (invoice.clientState) {
      setInvoice((prev) => ({ ...prev, supplyType: 'Inter-State (IGST)' }));
    }
  }, [invoice.clientState]);

  const handleUpdate = (field: keyof Invoice, value: any) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineUpdate = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(invoice.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    handleUpdate('items', newItems);
  };

  const addLine = () => {
    handleUpdate('items', [
      ...(invoice.items || []),
      {
        id: Math.random().toString(36).substring(2, 9),
        serviceDetails: '',
        hsnSac: '998552',
        quantity: 1,
        rate: 0,
        discountPercent: 0,
        gstPercent: 5,
      },
    ]);
  };

  const removeLine = (index: number) => {
    const newItems = [...(invoice.items || [])];
    newItems.splice(index, 1);
    handleUpdate('items', newItems);
  };

  // Math
  const items = invoice.items || [];
  let taxable = 0;
  let totalGst = 0;
  const applyGst = invoice.hasGst !== false;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPercent) || 0;
    const gstPercent = applyGst ? Number(item.gstPercent) || 0 : 0;
    const lineBase = qty * rate;
    const lineTaxable = lineBase - lineBase * (discount / 100);
    const lineGst = lineTaxable * (gstPercent / 100);
    taxable += lineTaxable;
    totalGst += lineGst;
  });

  const isIntra = invoice.supplyType?.includes('CGST') || invoice.supplyType?.includes('Intra');
  const cgst = isIntra ? totalGst / 2 : 0;
  const sgst = isIntra ? totalGst / 2 : 0;
  const igst = !isIntra ? totalGst : 0;
  const roundOff = Number(invoice.roundOff) || 0;
  const grandTotal = Math.round(taxable + totalGst + roundOff);
  const advance = Number(invoice.advanceReceived || 0);
  const balance = Math.max(0, grandTotal - advance);

  const handleSave = async () => {
    if (!invoice.clientName) {
      window.alert('Please specify a client name.');
      return;
    }

    const payload: Invoice = {
      ...invoice,
      id: isNew ? `inv-${Date.now()}` : id,
      invoiceNo: invoice.invoiceNo || defaultInvoiceNo,
      clientName: invoice.clientName || 'Valued Client',
      subtotal: taxable,
      cgst,
      sgst,
      igst,
      gstAmount: totalGst,
      totalAmount: grandTotal,
      paidAmount: advance,
      balanceAmount: balance,
      status: (invoice.status as PaymentStatus) || 'unpaid',
      items: invoice.items as InvoiceItem[],
    } as Invoice;

    if (isNew) {
      await addInvoice(payload);
    } else {
      await updateInvoice(payload);
    }
    router.push('/billing?tab=invoices');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1300px] mx-auto pb-24">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/billing?tab=invoices')}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Invoices
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">
              Tax Invoice {invoice.invoiceNo}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this invoice?')) {
                    deleteInvoice(id);
                    router.push('/billing?tab=invoices');
                  }
                }}
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Invoice
            </Button>
            <Button
              onClick={() => setIsPreviewOpen(true)}
              className="bg-[#f05438] hover:bg-[#ea580c] text-white font-bold rounded-xl shadow-xs"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download / Print PDF
            </Button>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {isPreviewOpen && (
          <PdfPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            title="GST Tax Invoice Preview"
            documentNo={invoice.invoiceNo}
          >
            <InvoicePdfTemplate
              invoice={{ ...invoice, items, totalAmount: grandTotal, balanceAmount: balance }}
              settings={settings}
            />
          </PdfPreviewModal>
        )}

        {/* Invoice Metadata Card */}
        <Card className="p-6 bg-white rounded-3xl border-slate-200 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>Invoice Number</Label>
              <Input
                value={invoice.invoiceNo}
                onChange={(e) => handleUpdate('invoiceNo', e.target.value)}
                className="font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoice.date}
                onChange={(e) => handleUpdate('date', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Due Date</Label>
              <Input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => handleUpdate('dueDate', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Status</Label>
              <Select
                value={invoice.status || 'unpaid'}
                onValueChange={(val) => handleUpdate('status', val)}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <Label>Client / Organization Name *</Label>
              <Input
                value={invoice.clientName}
                onChange={(e) => handleUpdate('clientName', e.target.value)}
                placeholder="e.g. Travel Holidays Pvt Ltd"
              />
            </div>
            <div className="space-y-1">
              <Label>Client State (GST Logic)</Label>
              <Select
                value={invoice.clientState}
                onValueChange={(val) => handleUpdate('clientState', val)}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>GST Supply Classification</Label>
              <Input
                readOnly
                value={invoice.supplyType}
                className="bg-slate-50 font-bold text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>Client GSTIN (if B2B)</Label>
              <Input
                value={invoice.clientGstin}
                onChange={(e) => handleUpdate('clientGstin', e.target.value)}
                placeholder="15-digit GSTIN"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label>Billing Address</Label>
              <Input
                value={invoice.billingAddress}
                onChange={(e) => handleUpdate('billingAddress', e.target.value)}
                placeholder="Complete office / residential address"
              />
            </div>
          </div>
        </Card>

        {/* Line Items Table */}
        <Card className="p-6 bg-white rounded-3xl border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Service Items & SAC Tariff</h2>
              <p className="text-xs text-slate-500">HSN/SAC 998552 for tour operator and passenger transport services.</p>
            </div>
            <Button
              onClick={addLine}
              size="sm"
              className="bg-sky-50 text-[#0284c7] hover:bg-sky-100 border border-sky-200 font-bold rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Service Line
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4 space-y-1">
                    <Label>Service Description</Label>
                    <Input
                      value={item.serviceDetails}
                      onChange={(e) => handleLineUpdate(idx, 'serviceDetails', e.target.value)}
                      placeholder="e.g. 5D/4N Gangtok & Darjeeling Tour"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label>HSN / SAC</Label>
                    <Input
                      value={item.hsnSac || '998552'}
                      onChange={(e) => handleLineUpdate(idx, 'hsnSac', e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleLineUpdate(idx, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label>Rate (₹)</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleLineUpdate(idx, 'rate', Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <Label>GST %</Label>
                    <Input
                      type="number"
                      value={item.gstPercent || 5}
                      onChange={(e) => handleLineUpdate(idx, 'gstPercent', Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <div className="space-y-1 flex-1">
                      <Label>Taxable</Label>
                      <Input
                        readOnly
                        value={formatCurrency((item.quantity || 1) * (item.rate || 0))}
                        className="bg-white font-bold"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeLine(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-2 cursor-pointer mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-slate-100 gap-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="space-y-1">
                <Label>Advance Payment Deducted (₹)</Label>
                <Input
                  type="number"
                  value={invoice.advanceReceived || 0}
                  onChange={(e) => handleUpdate('advanceReceived', Number(e.target.value))}
                  placeholder="e.g. 10000"
                  className="max-w-xs font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="w-full sm:w-[350px] space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(taxable)}</span>
              </div>
              {applyGst && isIntra && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST (2.5%):</span>
                    <span className="font-mono">{formatCurrency(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST (2.5%):</span>
                    <span className="font-mono">{formatCurrency(sgst)}</span>
                  </div>
                </>
              )}
              {applyGst && !isIntra && (
                <div className="flex justify-between text-slate-500">
                  <span>IGST (5%):</span>
                  <span className="font-mono">{formatCurrency(igst)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-[#0284c7] border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              {advance > 0 && (
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Advance Received:</span>
                  <span>-{formatCurrency(advance)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-2">
                <span>Balance Payable:</span>
                <span className="text-[#f05438]">{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function InvoiceEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Invoice Editor...</div>}>
      <InvoiceEditorPageInner />
    </Suspense>
  );
}
