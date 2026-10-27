'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Search, Plus, FileText, Receipt as ReceiptIcon, Trash2 } from 'lucide-react';

function BillingHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invoices, receipts, quotations, bookings, deleteReceipt, deleteInvoice } = useFleetStore();
  const tabParam = searchParams.get('tab') as 'quotations' | 'receipts' | 'invoices';
  const [activeTab, setActiveTab] = useState<'quotations' | 'receipts' | 'invoices'>(tabParam || 'quotations');
  const [searchTerm, setSearchTerm] = useState('');

  const confirmedQuotations = quotations.filter((q) => (q.status || '').toLowerCase() === 'confirmed');

  const filteredQuotations = confirmedQuotations.filter(
    (q) =>
      (q.clientName || q.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.quotationNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceipts = receipts.filter(
    (r) =>
      (r.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(
    (i) =>
      (i.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Billing, Money Receipts & GST Invoices
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {invoices.length} invoices · {receipts.length} receipts · {confirmedQuotations.length} confirmed packages
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => router.push('/billing/receipt/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              <ReceiptIcon className="mr-1.5 h-4 w-4" /> New Receipt
            </Button>
            <Button
              onClick={() => router.push('/billing/invoice/new')}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Blank Invoice
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="bg-transparent border-0 h-auto p-0 gap-3 flex justify-start border-b border-slate-200 pb-3 w-full">
            <TabsTrigger
              value="quotations"
              className="data-[state=active]:bg-[#0284c7] data-[state=active]:text-white data-[state=active]:shadow-xs rounded-xl px-5 py-2 text-xs font-extrabold text-slate-600 transition-all border border-transparent"
            >
              Confirmed Quotations ({confirmedQuotations.length})
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="data-[state=active]:bg-[#0284c7] data-[state=active]:text-white data-[state=active]:shadow-xs rounded-xl px-5 py-2 text-xs font-extrabold text-slate-600 transition-all border border-transparent"
            >
              Advance Money Receipts ({receipts.length})
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="data-[state=active]:bg-[#0284c7] data-[state=active]:text-white data-[state=active]:shadow-xs rounded-xl px-5 py-2 text-xs font-extrabold text-slate-600 transition-all border border-transparent"
            >
              GST Tax Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab 1: Confirmed Quotations */}
        {activeTab === 'quotations' && (
          <Card className="border-slate-200 shadow-soft rounded-2xl overflow-hidden bg-white">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Confirmed Tour Packages & Accounting Status
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/70 border-b border-sky-100">
                  <TableHead className="font-extrabold text-slate-700 text-xs">Quotation #</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Customer</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Destination</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Travel Date</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Payment State</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Package Cost</TableHead>
                  <TableHead className="text-right font-extrabold text-slate-700 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      No confirmed quotations found. Mark quotations as "Confirmed" to manage their receipts and invoices here!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((q) => {
                    const qReceipts = receipts.filter(
                      (r) => r.quotationNo === q.quotationNo || (r.bookingId && r.bookingId === q.id)
                    );
                    const totalReceived = qReceipts.reduce(
                      (sum, r) => sum + (Number(r.amount) || Number(r.receivedAmount) || 0),
                      0
                    );
                    const packageTotal = Number(q.totalAmount || q.grandTotal || 0);
                    const balance = packageTotal - totalReceived;
                    const isFullyPaid = balance <= 0 && packageTotal > 0;
                    const isPartiallyPaid = totalReceived > 0 && !isFullyPaid;
                    const existingInvoice = invoices.find(
                      (i) => i.quotationId === q.id || (q.quotationNo && i.invoiceNo.includes(q.quotationNo))
                    );

                    return (
                      <TableRow key={q.id} className="hover:bg-slate-50/60">
                        <TableCell className="font-mono text-xs font-bold text-[#0284c7]">
                          {q.quotationNo}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm text-slate-900">{q.clientName || q.customerName}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{q.clientPhone || q.mobile}</div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-800">{q.destination}</TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {q.startDate ? formatDate(q.startDate) : '-'}
                        </TableCell>
                        <TableCell>
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Fully Paid
                            </span>
                          ) : isPartiallyPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Partially Paid ({formatCurrency(totalReceived)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Payment Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-extrabold text-sm text-slate-900">
                          {formatCurrency(packageTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => router.push(`/billing/receipt/new?quotationId=${q.id}`)}
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                            >
                              <ReceiptIcon className="w-3.5 h-3.5 mr-1" /> Advance Receipt
                            </Button>
                            {existingInvoice ? (
                              <Button
                                onClick={() => router.push(`/billing/invoice/${existingInvoice.id}`)}
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" /> View Invoice
                              </Button>
                            ) : (
                              <Button
                                onClick={() => router.push(`/billing/invoice/new?quotationId=${q.id}`)}
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1]"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" /> GST Invoice
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Tab 2: Advance Receipts */}
        {activeTab === 'receipts' && (
          <Card className="border-slate-200 shadow-soft rounded-2xl overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search receipt #, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9.5 rounded-xl border-slate-200 bg-slate-50/50"
                />
              </div>
              <Button
                onClick={() => router.push('/billing/receipt/new')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Create Money Receipt
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/70 border-b border-sky-100">
                  <TableHead className="font-extrabold text-slate-700 text-xs">Receipt #</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Customer</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Quotation Ref</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Date</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Payment Mode</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Amount Received</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Balance Remaining</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                      No money receipts found. Click "Create Money Receipt" to issue a booking receipt.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((r) => {
                    const received = Number(r.amount || r.receivedAmount || 0);
                    const grand = Number(r.grandTotal || 0);
                    const balance = grand - received;
                    return (
                      <TableRow
                        key={r.id}
                        className="hover:bg-slate-50/60 cursor-pointer"
                        onClick={() => router.push(`/billing/receipt/${r.id}`)}
                      >
                        <TableCell className="font-mono text-xs font-bold text-[#0284c7]">
                          {r.receiptNo}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm text-slate-900">{r.clientName}</div>
                          {r.clientMobile && <div className="text-xs text-slate-400 font-mono">{r.clientMobile}</div>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {r.quotationNo || r.referenceNo || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {r.date ? formatDate(r.date.split('T')[0]) : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {r.paymentMethod || 'UPI'}
                          </span>
                        </TableCell>
                        <TableCell className="font-extrabold text-sm text-emerald-700">
                          {formatCurrency(received)}
                        </TableCell>
                        <TableCell className="font-extrabold text-sm text-slate-800">
                          {formatCurrency(balance > 0 ? balance : 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this receipt?')) {
                                deleteReceipt(r.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Tab 3: GST Invoices */}
        {activeTab === 'invoices' && (
          <Card className="border-slate-200 shadow-soft rounded-2xl overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoice #, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9.5 rounded-xl border-slate-200 bg-slate-50/50"
                />
              </div>
              <Button
                onClick={() => router.push('/billing/invoice/new')}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl h-9 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Create GST Invoice
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/70 border-b border-sky-100">
                  <TableHead className="font-extrabold text-slate-700 text-xs">Invoice #</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Billed Client</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Date</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Supply Type</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Payment State</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Grand Total</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs">Balance Due</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                      No GST invoices generated yet. Click "Create GST Invoice" to generate a tax invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="hover:bg-slate-50/60 cursor-pointer"
                      onClick={() => router.push(`/billing/invoice/${inv.id}`)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-[#0284c7]">
                        {inv.invoiceNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm text-slate-900">{inv.clientName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{inv.clientState || 'West Bengal'}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {inv.issueDate ? formatDate(inv.issueDate.split('T')[0]) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {inv.supplyType || 'CGST + SGST'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="font-extrabold text-sm text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="font-extrabold text-sm text-[#f05438]">
                        {formatCurrency(inv.balanceAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this invoice?')) {
                              deleteInvoice(inv.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BillingHubPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Billing Hub...</div>}>
      <BillingHubInner />
    </Suspense>
  );
}
