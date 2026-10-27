'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Quotation } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { QuotationPdfTemplate } from '@/components/pdf/quotation-template';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function QuotationsListPage() {
  const router = useRouter();
  const { quotations, addQuotation, deleteQuotation, updateQuotation, settings } = useFleetStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      (q.quotationNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.clientName || q.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.clientPhone || q.mobile || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || (q.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = async (q: Quotation) => {
    const newId = `q-${Date.now()}`;
    const newNo = `VT/${new Date().getFullYear()}/${String(quotations.length + 1001).padStart(4, '0')}`;
    await addQuotation({
      ...q,
      id: newId,
      quotationNo: newNo,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
  };

  const handleEdit = (q: Quotation) => {
    router.push(`/quotations/new?editId=${q.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Quotations & Tour Proposals
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Build custom multi-day travel itineraries, vehicle packages, and generate branded PDF estimates for clients.
            </p>
          </div>
          <Link href="/quotations/new">
            <Button className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-xs">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Create Quotation
            </Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 shadow-soft bg-white rounded-2xl border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search quote #, client, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9.5 rounded-xl border-slate-200 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <div className="flex flex-wrap gap-1.5">
                {['all', 'draft', 'sent', 'confirmed', 'cancelled'].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(st)}
                    className={`h-8 text-xs font-bold rounded-lg capitalize ${
                      statusFilter === st ? 'bg-[#0284c7] text-white' : 'border-slate-200'
                    }`}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Quotations Table */}
        <Card className="shadow-soft bg-white rounded-2xl overflow-hidden border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50/70 border-b border-sky-100">
                <TableHead className="font-extrabold text-slate-700 text-xs">Quotation #</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Customer</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Destination</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Travel Date</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Category</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Status</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs text-right">Grand Total</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs text-center w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                    No quotations found. Click "Create Quotation" to generate your first tour proposal!
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((q) => (
                  <TableRow key={q.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-mono text-xs font-bold text-[#0284c7]">
                      <div
                        onClick={() => handleEdit(q)}
                        className="cursor-pointer hover:underline"
                      >
                        {q.quotationNo || `VT-${q.id.slice(-4)}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-slate-900">{q.clientName || q.customerName}</div>
                      {(q.clientPhone || q.mobile) && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{q.clientPhone || q.mobile}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {q.destination || 'Custom Tour'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {formatDate(q.startDate)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                        {q.qType || q.type || 'Tour Package'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={q.status || 'draft'}
                        onValueChange={(val) => updateQuotation({ ...q, status: val })}
                      >
                        <SelectTrigger className="h-7 w-[110px] rounded-full text-[11px] font-bold border-slate-200 shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-sm text-slate-900">
                      {formatCurrency(q.totalAmount || q.grandTotal || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#0284c7] hover:bg-sky-50 rounded-lg"
                          onClick={() => setPreviewQuotation(q)}
                          title="Preview & Print PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-lg"
                          onClick={() => handleDuplicate(q)}
                          title="Duplicate Quotation"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this quotation?')) {
                              deleteQuotation(q.id);
                            }
                          }}
                          title="Delete Quotation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* PDF Preview Modal */}
        {previewQuotation && (
          <PdfPreviewModal
            isOpen={!!previewQuotation}
            onClose={() => setPreviewQuotation(null)}
            title="Quotation & Tour Proposal"
            documentNo={previewQuotation.quotationNo}
          >
            <QuotationPdfTemplate quotation={previewQuotation} settings={settings} />
          </PdfPreviewModal>
        )}
      </div>
    </DashboardLayout>
  );
}
