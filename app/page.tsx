'use client';
import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Car,
  Users,
  MessageSquareQuote,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  FileText,
  Receipt,
  ArrowUpRight,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { vehicles, drivers, enquiries, bookings, invoices, quotations } = useFleetStore();

  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const activeDrivers = drivers.filter((d) => d.status === 'active').length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new' || e.status === 'follow-up').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  const totalRevenue = invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const pendingCollections = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'partially-paid' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.balanceAmount || 0), 0);

  const recentEnquiries = enquiries.slice(0, 5);
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-[1400px] mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Operations & Quotation Dashboard
              </h1>
              <span className="bg-[#f05438]/10 text-[#f05438] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Viyonka Travels
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Live operational metrics, active quote proposals, and trip dispatches for Siliguri & Himalayan sectors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/enquiries">
              <Button size="sm" className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold h-9.5 px-4 rounded-xl shadow-xs">
                <PlusCircle className="mr-1.5 h-4 w-4" /> New Enquiry
              </Button>
            </Link>
            <Link href="/quotations/new">
              <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 font-bold h-9.5 px-4 rounded-xl text-slate-800">
                <FileText className="mr-1.5 h-4 w-4 text-[#f05438]" /> Smart Quote
              </Button>
            </Link>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="border-l-4 border-l-[#0284c7] shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fleet</CardTitle>
              <Car className="h-4 w-4 text-[#0284c7]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{activeVehicles} / {vehicles.length}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Ready for dispatch</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{activeDrivers} / {drivers.length}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">On-duty personnel</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Enquiries</CardTitle>
              <MessageSquareQuote className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{newEnquiries}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Requiring follow-up</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-600 shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Trips</CardTitle>
              <CalendarCheck className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{confirmedBookings}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Scheduled bookings</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sky-600 shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoiced</CardTitle>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-slate-900 truncate">{formatCurrency(totalRevenue)}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Gross billed volume</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#f05438] shadow-soft hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-[#f05438]" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-[#f05438] truncate">{formatCurrency(pendingCollections)}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Unpaid balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Module Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/quotations">
            <Card className="p-5 hover:border-[#0284c7]/60 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-sky-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 group-hover:text-[#0284c7] transition-colors">
                  Quotations Hub
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-2">{quotations.length} Proposals</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Multi-day tour packages</p>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="p-5 hover:border-[#0284c7]/60 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-sky-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 group-hover:text-[#0284c7] transition-colors">
                  Trip Calendar
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-2">Day/Week/Month</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Live fleet schedule</p>
            </Card>
          </Link>

          <Link href="/enquiries">
            <Card className="p-5 hover:border-[#0284c7]/60 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-sky-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 group-hover:text-[#0284c7] transition-colors">
                  Enquiry Leads
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-2">{enquiries.length} Inquiries</div>
              <p className="text-[11px] text-slate-500 mt-0.5">1-click quote convert</p>
            </Card>
          </Link>

          <Link href="/billing">
            <Card className="p-5 hover:border-[#0284c7]/60 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-sky-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 group-hover:text-[#0284c7] transition-colors">
                  Billing & GST
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-2">{invoices.length} Invoices</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Receipts & tax invoices</p>
            </Card>
          </Link>
        </div>

        {/* Live Tables Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Enquiries Table */}
          <Card className="shadow-soft bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-[#0284c7]" />
                  Recent Tourist & B2B Enquiries
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Incoming travel leads across Siliguri, Sikkim, Darjeeling, and Dooars.
                </CardDescription>
              </div>
              <Link href="/enquiries">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-[#0284c7]">
                  View All ({enquiries.length})
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route & Vehicle</TableHead>
                    <TableHead>Travel Dates</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-slate-400 text-sm">
                        No enquiries recorded yet. Click "New Enquiry" to add customer leads.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentEnquiries.map((e) => (
                      <TableRow key={e.id} className="hover:bg-slate-50/60">
                        <TableCell className="font-semibold text-slate-900">
                          <div className="truncate max-w-[130px]">{e.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{e.mobile}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                            {e.pickupLocation} → {e.destination}
                          </div>
                          <div className="text-[11px] text-[#0284c7] font-semibold mt-0.5">
                            {e.vehicle} ({e.passengers} pax)
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {formatDate(e.startDate)}
                          <span className="block text-[10px] text-slate-400">{e.days} Days tour</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={e.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Bookings Table */}
          <Card className="shadow-soft bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  Upcoming & Active Dispatches
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Confirmed bookings and vehicle departures scheduled.
                </CardDescription>
              </div>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-[#0284c7]">
                  View Calendar
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client & Vehicle</TableHead>
                    <TableHead>Itinerary</TableHead>
                    <TableHead>Driver Assigned</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-slate-400 text-sm">
                        No upcoming bookings scheduled yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingBookings.map((b) => {
                      const drv = drivers.find((d) => d.id === b.driverId);
                      return (
                        <TableRow key={b.id} className="hover:bg-slate-50/60">
                          <TableCell className="font-semibold text-slate-900">
                            <div className="truncate max-w-[130px]">{b.clientName}</div>
                            <div className="text-[11px] text-[#0284c7] font-medium mt-0.5">{b.vehicle}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                              {b.pickup} → {b.destination}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(b.startDate)}</div>
                          </TableCell>
                          <TableCell>
                            {drv ? (
                              <div className="text-xs font-medium text-emerald-700">
                                {drv.name}
                                <span className="block text-[10px] text-slate-400 font-mono">{drv.mobile}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 font-semibold">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-extrabold text-slate-900">
                            {formatCurrency(b.amount)}
                            <div className="mt-0.5">
                              <StatusBadge status={b.status} className="text-[9px] px-2 py-0" />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
