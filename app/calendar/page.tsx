'use client';
import React, { useState, useMemo } from 'react';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Booking, VehicleType, BookingStatus, ClientType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Trash2, Search, GripVertical } from 'lucide-react';
import { cn } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LEGEND_ITEMS = [
  { label: 'Confirmed', color: 'bg-emerald-500' },
  { label: 'Pending', color: 'bg-amber-500' },
  { label: 'Cancelled', color: 'bg-rose-500' },
  { label: 'Corporate', color: 'bg-slate-800' },
  { label: 'Tourist Package', color: 'bg-[#0284c7]' },
];

const getBookingColor = (b: Booking) => {
  if (b.status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (b.status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (b.status === 'completed') return 'bg-sky-50 text-sky-700 border-sky-100';

  if (b.clientType === 'corporate' || b.clientType === 'Corporate') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (b.clientType === 'tourist' || b.clientType === 'B2C') return 'bg-sky-50 text-[#0284c7] border-sky-200';

  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const { bookings, quotations, addBooking, updateBooking, deleteBooking } = useFleetStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState<ClientType>('tourist');
  const [vehicle, setVehicle] = useState<VehicleType | string>('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<BookingStatus>('confirmed');

  const allCalendarItems = useMemo(() => {
    const items = [...bookings];

    // Auto-inject confirmed quotations into the calendar
    const confirmedQuotes = (quotations || []).filter((q) => q.status === 'confirmed' || q.status === 'Confirmed');
    confirmedQuotes.forEach((q) => {
      items.push({
        id: `quote-${q.id}`,
        clientName: q.customerName || q.clientName || 'Valued Client',
        vehicle: q.vehicles?.[0]?.vehicle || q.vehicle || 'Tour Package',
        destination: q.destination || '',
        pickup: q.pickupLocation || '',
        startDate: q.startDate,
        endDate: q.endDate || q.startDate,
        status: 'confirmed',
        clientType: (q.clientType?.toLowerCase() as ClientType) || 'tourist',
        amount: q.totalAmount || 0,
        bookingNo: q.quotationNo || 'Q-Ref',
        createdAt: q.date || new Date().toISOString(),
        isQuotation: true,
        originalQuotationId: q.id,
      });
    });
    return items;
  }, [bookings, quotations]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return allCalendarItems;
    const lower = searchQuery.toLowerCase();
    return allCalendarItems.filter(
      (b) =>
        b.clientName?.toLowerCase().includes(lower) ||
        b.vehicle?.toLowerCase().includes(lower) ||
        b.destination?.toLowerCase().includes(lower) ||
        b.pickup?.toLowerCase().includes(lower)
    );
  }, [allCalendarItems, searchQuery]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    if (viewMode === 'week') next.setDate(next.getDate() - 7);
    if (viewMode === 'day') next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    if (viewMode === 'week') next.setDate(next.getDate() + 7);
    if (viewMode === 'day') next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startMonth = start.toLocaleString('default', { month: 'short' });
      const endMonth = end.toLocaleString('default', { month: 'short' });

      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return '';
  }, [currentDate, viewMode]);

  const openNewModal = (dateStr?: string) => {
    setEditingBooking(null);
    setClientName('');
    setClientType('tourist');
    setVehicle('');
    setPickup('Siliguri / NJP');
    setDestination('Gangtok, Sikkim');
    const today = getLocalDateString(new Date());
    setStartDate(dateStr || today);
    setEndDate(dateStr || today);
    setAmount(0);
    setStatus('confirmed');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setClientName(b.clientName || '');
    setClientType(b.clientType || 'tourist');
    setVehicle(b.vehicle || '');
    setPickup(b.pickup || '');
    setDestination(b.destination || '');
    setStartDate(b.startDate?.split('T')[0] || '');
    setEndDate(b.endDate?.split('T')[0] || '');
    setAmount(b.amount || 0);
    setStatus(b.status || 'confirmed');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !vehicle || !startDate || !endDate) return;

    if (editingBooking) {
      await updateBooking({
        ...editingBooking,
        clientName,
        clientType,
        vehicle,
        pickup,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        amount: Number(amount),
        status,
      });
    } else {
      const newId = `cal-b-${Date.now()}`;
      await addBooking({
        id: newId,
        bookingNo: `VT-CAL-${String(bookings.length + 101).padStart(3, '0')}`,
        clientName,
        clientType,
        vehicle,
        pickup,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        amount: Number(amount),
        status,
        advance: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingBooking) return;
    if (window.confirm('Are you sure you want to delete this trip booking?')) {
      await deleteBooking(editingBooking.id);
      setIsModalOpen(false);
    }
  };

  const renderCell = (date: Date, isMonthView: boolean = true) => {
    const dateStr = getLocalDateString(date);
    const isToday = dateStr === getLocalDateString(new Date());

    const dayBookings = filteredBookings.filter((b) => {
      if (!b.startDate) return false;
      const start = b.startDate.split('T')[0];
      const end = b.endDate?.split('T')[0] || start;
      return dateStr >= start && dateStr <= end;
    });

    return (
      <div
        key={dateStr}
        className={cn(
          'border-r border-b border-slate-200/80 p-2 transition-colors group flex flex-col bg-white relative',
          isToday && 'bg-sky-50/40',
          isMonthView ? 'min-h-[120px]' : 'min-h-[300px]'
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <span
            className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded-md',
              isToday ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-600'
            )}
          >
            {date.getDate()}
          </span>
          <div className="flex items-center gap-1">
            {dayBookings.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400">
                +{dayBookings.length - 3}
              </span>
            )}
            <div
              className="p-1 rounded-md hover:bg-sky-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[#0284c7]"
              onClick={(e) => {
                e.stopPropagation();
                openNewModal(dateStr);
              }}
              title="Add Trip Booking"
            >
              <PlusCircle className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-0.5">
          {dayBookings.slice(0, 3).map((b) => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                if ((b as any).isQuotation) {
                  window.location.href = `/quotations/new?editId=${(b as any).originalQuotationId}`;
                } else {
                  openEditModal(b);
                }
              }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-lg border cursor-pointer hover:brightness-95 transition-all text-[11px] font-bold truncate shadow-xs',
                getBookingColor(b)
              )}
              title={`${b.clientName} - ${b.vehicle}${b.destination ? ` to ${b.destination}` : ''}`}
            >
              <GripVertical className="h-3 w-3 opacity-40 shrink-0" />
              <span className="truncate">{b.clientName} · {b.vehicle}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/50 p-2" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(renderCell(new Date(year, month, i), true));
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {cells}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());

    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
          {cells.map((d, i) => (
            <div key={i} className="py-3 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {DAYS_OF_WEEK[d.getDay()]}
              </span>
              <span
                className={cn(
                  'text-sm font-extrabold h-7 w-7 flex items-center justify-center rounded-full',
                  getLocalDateString(d) === getLocalDateString(new Date())
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'text-slate-800'
                )}
              >
                {d.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d) => renderCell(d, false))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 text-center py-4">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {DAYS_OF_WEEK[currentDate.getDay()]}
          </span>
          <span
            className={cn(
              'text-xl font-extrabold h-10 w-10 mx-auto flex items-center justify-center rounded-full',
              getLocalDateString(currentDate) === getLocalDateString(new Date())
                ? 'bg-[#0284c7] text-white'
                : 'text-slate-900'
            )}
          >
            {currentDate.getDate()}
          </span>
        </div>
        <div className="grid grid-cols-1">
          {renderCell(currentDate, false)}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
        {/* Navigation Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-xl border-slate-200">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday} className="h-9 rounded-xl px-4 font-bold border-slate-200">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 rounded-xl border-slate-200">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 min-w-[200px]">
              {headerTitle}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search trip, vehicle, route..."
                className="pl-9 rounded-xl bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as ViewMode)} className="w-full sm:w-auto">
              <TabsList className="rounded-xl p-1 bg-slate-100">
                <TabsTrigger value="day" className="rounded-lg px-3.5">Day</TabsTrigger>
                <TabsTrigger value="week" className="rounded-lg px-3.5">Week</TabsTrigger>
                <TabsTrigger value="month" className="rounded-lg px-3.5">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => openNewModal()} className="rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold shadow-xs">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Trip
            </Button>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex flex-wrap items-center gap-6 px-5 py-3 bg-sky-50/70 border border-sky-100 rounded-xl">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-full', item.color)} />
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}

        {/* Booking Dialog Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-200">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <CalendarIcon className="h-5 w-5 text-[#0284c7]" />
                {editingBooking ? 'Edit Trip Schedule' : 'Schedule New Tour Trip'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Client Name *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Type</Label>
                  <Select value={clientType} onValueChange={(val: ClientType) => setClientType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist Package (B2C)</SelectItem>
                      <SelectItem value="b2b">B2B Agent</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Vehicle Type *</Label>
                  <Input
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="e.g. Innova Crysta / Dzire"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(val: BookingStatus) => setStatus(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Pickup Location</Label>
                  <Input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="e.g. Bagdogra Airport (IXB)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Destination</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Gangtok & Pelling"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="max-w-[50%]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-200 flex justify-between gap-3">
                {editingBooking ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className="mr-auto font-bold rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                  </Button>
                ) : <div />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl">
                    Save Trip
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
