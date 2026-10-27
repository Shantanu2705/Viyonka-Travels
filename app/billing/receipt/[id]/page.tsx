'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Receipt, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { ReceiptPdfTemplate } from '@/components/pdf/receipt-template';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, Trash2, Save, Download } from 'lucide-react';

function ReceiptEditorPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const { receipts, addReceipt, updateReceipt, deleteReceipt, quotations, settings } = useFleetStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const quotationId = searchParams.get('quotationId');

  const defaultReceiptNo = `VT-REC-${new Date().getFullYear()}-${String(receipts.length + 101).padStart(4, '0')}`;

  const [receipt, setReceipt] = useState<Partial<Receipt>>({
    receiptNo: defaultReceiptNo,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientMobile: '',
    quotationNo: '',
    bookingReference: '',
    destination: 'Gangtok & Darjeeling',
    grandTotal: 30000,
    advancePercent: 30,
    advanceAmount: 9000,
    receivedAmount: 9000,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    referenceNo: '',
    receivedBy: 'Viyonka Accounts Desk',
    remarks: 'Advance booking confirmation for tour package.',
  });

  useEffect(() => {
    if (!isNew) {
      const existing = receipts.find((r) => r.id === id);
      if (existing) setReceipt(existing);
    } else if (quotationId) {
      const q = quotations.find((x) => x.id === quotationId);
      if (q) {
        const total = q.baseAmount || q.totalAmount || q.grandTotal || 0;
        const advAmt = Math.round((total * 30) / 100);
        setReceipt((prev) => ({
          ...prev,
          clientName: q.clientName || q.customerName || '',
          clientMobile: q.clientPhone || q.mobile || '',
          quotationNo: q.quotationNo || '',
          destination: q.destination || '',
          grandTotal: total,
          advancePercent: 30,
          advanceAmount: advAmt,
          receivedAmount: advAmt,
        }));
      }
    }
  }, [isNew, id, receipts, quotationId, quotations]);

  useEffect(() => {
    const total = Number(receipt.grandTotal) || 0;
    const percent = Number(receipt.advancePercent) || 0;
    const calcAdvance = Math.round((total * percent) / 100);
    if (receipt.advanceAmount !== calcAdvance) {
      setReceipt((prev) => ({
        ...prev,
        advanceAmount: calcAdvance,
        receivedAmount: calcAdvance,
      }));
    }
  }, [receipt.grandTotal, receipt.advancePercent]);

  const handleUpdate = (field: keyof Receipt, value: any) => {
    setReceipt((prev) => ({ ...prev, [field]: value }));
  };

  const grandTotal = Number(receipt.grandTotal) || 0;
  const advanceReceived = Number(receipt.receivedAmount) || 0;
  const balance = Math.max(0, grandTotal - advanceReceived);

  const handleSave = async () => {
    if (!receipt.clientName) {
      window.alert('Please enter a customer name.');
      return;
    }

    const payload: Receipt = {
      ...receipt,
      id: isNew ? `rec-${Date.now()}` : id,
      receiptNo: receipt.receiptNo || defaultReceiptNo,
      clientName: receipt.clientName || 'Valued Client',
      amount: advanceReceived,
      receivedAmount: advanceReceived,
      paymentMethod: (receipt.paymentMethod as PaymentMethod) || 'UPI',
    } as Receipt;

    if (isNew) {
      await addReceipt(payload);
    } else {
      await updateReceipt(payload);
    }
    router.push('/billing?tab=receipts');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto pb-24">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/billing?tab=receipts')}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Receipts
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">
              Money Receipt {receipt.receiptNo}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <Button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this receipt?')) {
                    deleteReceipt(id);
                    router.push('/billing?tab=receipts');
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
              <Save className="w-4 h-4 mr-1.5" /> Save Receipt
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
            title="Money Receipt Preview"
            documentNo={receipt.receiptNo}
          >
            <ReceiptPdfTemplate receipt={receipt} settings={settings} />
          </PdfPreviewModal>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Receipt Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white rounded-3xl border-slate-200 space-y-5">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Receipt & Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Receipt Number</Label>
                  <Input
                    value={receipt.receiptNo}
                    onChange={(e) => handleUpdate('receiptNo', e.target.value)}
                    className="font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Receipt Date</Label>
                  <Input
                    type="date"
                    value={receipt.date}
                    onChange={(e) => handleUpdate('date', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Customer Name *</Label>
                  <Input
                    value={receipt.clientName}
                    onChange={(e) => handleUpdate('clientName', e.target.value)}
                    placeholder="e.g. Sourav Mukherjee"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Customer Mobile</Label>
                  <Input
                    value={receipt.clientMobile}
                    onChange={(e) => handleUpdate('clientMobile', e.target.value)}
                    placeholder="e.g. 98765 43210"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Quotation Reference #</Label>
                  <Input
                    value={receipt.quotationNo}
                    onChange={(e) => handleUpdate('quotationNo', e.target.value)}
                    placeholder="e.g. VT/2026/1001"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tour Destination</Label>
                  <Input
                    value={receipt.destination}
                    onChange={(e) => handleUpdate('destination', e.target.value)}
                    placeholder="e.g. North Sikkim & Darjeeling"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-3xl border-slate-200 space-y-5">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Payment Channel & Transaction
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={receipt.paymentMethod || 'UPI'}
                    onValueChange={(val) => handleUpdate('paymentMethod', val)}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI (Google Pay / PhonePe / Paytm)</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer (IMPS / NEFT / RTGS)</SelectItem>
                      <SelectItem value="Cash">Cash at Counter</SelectItem>
                      <SelectItem value="Credit Card">Credit / Debit Card</SelectItem>
                      <SelectItem value="Cheque">Cheque / Demand Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Transaction / UTR Reference ID</Label>
                  <Input
                    value={receipt.referenceNo}
                    onChange={(e) => handleUpdate('referenceNo', e.target.value)}
                    placeholder="e.g. UPI Ref # 428198273619"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>Remarks / Instructions</Label>
                  <Textarea
                    value={receipt.remarks}
                    onChange={(e) => handleUpdate('remarks', e.target.value)}
                    placeholder="e.g. Advance paid against Sikkim luxury tour package."
                    className="min-h-[70px]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Ledger Calculation Card */}
          <div className="space-y-6">
            <Card className="p-6 bg-white rounded-3xl border-slate-200 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Financial Breakdown
              </h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Total Package Cost (₹)</Label>
                  <Input
                    type="number"
                    value={receipt.grandTotal}
                    onChange={(e) => handleUpdate('grandTotal', Number(e.target.value))}
                    className="font-extrabold text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Advance Required (%)</Label>
                  <Input
                    type="number"
                    value={receipt.advancePercent}
                    onChange={(e) => handleUpdate('advancePercent', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Actual Amount Received (₹)</Label>
                  <Input
                    type="number"
                    value={receipt.receivedAmount}
                    onChange={(e) => handleUpdate('receivedAmount', Number(e.target.value))}
                    className="font-extrabold text-emerald-700 text-base"
                  />
                </div>

                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 space-y-2 mt-4 text-xs">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Package Value:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Amount Received:</span>
                    <span className="font-bold">{formatCurrency(advanceReceived)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm border-t border-sky-200 pt-2 text-[#f05438]">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(balance)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-xl h-11 mt-2"
                >
                  Save Money Receipt
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReceiptEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Receipt Editor...</div>}>
      <ReceiptEditorPageInner />
    </Suspense>
  );
}
