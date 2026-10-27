'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Enquiry, EnquiryType, VehicleType, ClientType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/ui/button';
import {
  PlusCircle,
  Search,
  Trash2,
  Filter,
  Sparkles,
  Truck,
  Palmtree,
  Briefcase,
} from 'lucide-react';

function EnquiriesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { enquiries, addEnquiry, updateEnquiry, deleteEnquiry, isInitialized } = useFleetStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);

  // Form states
  const [formType, setFormType] = useState<EnquiryType | string>('tourist');
  const [enquiryPrefix, setEnquiryPrefix] = useState<'TR' | 'PKG' | 'B2B'>('PKG');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Bagdogra Airport (IXB)');
  const [destination, setDestination] = useState('Gangtok, Sikkim');
  const [vehicle, setVehicle] = useState<VehicleType | string>('Innova Crysta');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(4);
  const [whatsapp, setWhatsapp] = useState('');
  const [clientType, setClientType] = useState<ClientType | string>('B2C');
  const [ticketConfirmed, setTicketConfirmed] = useState(true);
  const [hotelConfirmed, setHotelConfirmed] = useState(false);
  const [hotelType, setHotelType] = useState('Without Hotel');
  const [interestedPlaces, setInterestedPlaces] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('new');

  const openNewModal = () => {
    setIsTypeSelectorOpen(true);
  };

  const handleTypeSelect = (type: 'transport' | 'package' | 'b2b') => {
    setIsTypeSelectorOpen(false);
    setEditingEnquiry(null);
    setEnquiryPrefix(type === 'package' ? 'PKG' : type === 'b2b' ? 'B2B' : 'TR');
    setFormType(type === 'package' ? 'tourist' : type === 'b2b' ? 'b2b' : 'corporate');
    setCustomerName('');
    setMobile('');
    setEmail('');
    setPickupLocation(type === 'b2b' ? 'Siliguri / NJP' : 'Bagdogra Airport (IXB)');
    setDestination(type === 'package' ? 'Gangtok & Darjeeling' : 'Darjeeling');
    setVehicle('Innova Crysta');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
    setPassengers(4);
    setWhatsapp('');
    setClientType(type === 'b2b' ? 'B2B' : 'B2C');
    setTicketConfirmed(true);
    setHotelConfirmed(false);
    setHotelType('Without Hotel');
    setInterestedPlaces('');
    setSpecialRequirements('');
    setInternalNotes('');
    setCustomerRemarks('');
    setEnquiryStatus('new');
    setIsModalOpen(true);
  };

  const openEditModal = (e: Enquiry) => {
    setEditingEnquiry(e);
    setFormType((e.type || 'tourist') as any);
    setEnquiryPrefix(e.type === 'b2b' ? 'B2B' : e.type === 'tourist' ? 'PKG' : 'TR');
    setCustomerName(e.customerName || '');
    setMobile(e.mobile || '');
    setEmail(e.email || '');
    setPickupLocation(e.pickupLocation || '');
    setDestination(e.destination || '');
    setVehicle((e.vehicle || 'Innova Crysta') as any);
    setStartDate(e.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setEndDate(e.endDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setPassengers(e.passengers || 2);
    setWhatsapp(e.whatsapp || '');
    setClientType(e.clientType || 'B2C');
    setTicketConfirmed(e.ticketRequired ?? true);
    setHotelConfirmed(e.hotelRequired ?? false);
    setHotelType(e.hotelType || 'Without Hotel');
    setInterestedPlaces(e.places || '');
    setSpecialRequirements(e.specialRequirements || '');
    setInternalNotes(e.internalNotes || '');
    setCustomerRemarks(e.customerRemarks || '');
    setEnquiryStatus(e.status || 'new');
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isInitialized && editId && enquiries.length > 0) {
      const enq = enquiries.find((e) => e.id === editId);
      if (enq && !isModalOpen) {
        openEditModal(enq);
        router.replace('/enquiries');
      }
    }
  }, [isInitialized, editId, enquiries, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile) return;

    const diffDays = Math.max(
      1,
      Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))
    );

    if (editingEnquiry) {
      await updateEnquiry({
        ...editingEnquiry,
        type: formType,
        customerName,
        mobile,
        email,
        pickupLocation,
        destination,
        vehicle,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        days: diffDays,
        passengers: Number(passengers),
        whatsapp,
        clientType,
        ticketRequired: ticketConfirmed,
        hotelRequired: hotelConfirmed,
        hotelType,
        places: interestedPlaces,
        specialRequirements,
        internalNotes,
        customerRemarks,
        status: enquiryStatus,
      });
    } else {
      const newId = `enq-${Date.now()}`;
      const typeEnquiries = enquiries.filter(
        (eq) => (eq.type === 'tourist' ? 'PKG' : eq.type === 'b2b' ? 'B2B' : 'TR') === enquiryPrefix
      );
      const nextNum = typeEnquiries.length + 1;

      await addEnquiry({
        id: newId,
        enquiryNo: `VT-${enquiryPrefix}-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`,
        type: formType,
        customerName,
        mobile,
        email,
        pickupLocation,
        destination,
        vehicle,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        days: diffDays,
        passengers: Number(passengers),
        whatsapp,
        clientType,
        ticketRequired: ticketConfirmed,
        hotelRequired: hotelConfirmed,
        hotelType,
        places: interestedPlaces,
        specialRequirements,
        internalNotes,
        customerRemarks,
        status: enquiryStatus,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleConvertToQuotation = (enq: Enquiry) => {
    router.push(`/quotations/new?enquiryId=${enq.id}`);
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      (e.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.mobile || '').includes(searchTerm) ||
      (e.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.enquiryNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Customer Enquiries & Lead Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage incoming inquiries, multi-day tour requests, and transform leads to quotations in one click.
            </p>
          </div>
          <Button onClick={openNewModal} className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-xs">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Log New Enquiry
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 shadow-soft bg-white rounded-2xl border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, phone, destination, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9.5 rounded-xl border-slate-200 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <div className="flex flex-wrap gap-1.5">
                {['all', 'new', 'follow-up', 'quotation-sent', 'confirmed', 'cancelled'].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'h-8 text-xs font-bold rounded-lg capitalize',
                      statusFilter === st ? 'bg-[#0284c7] text-white' : 'border-slate-200'
                    )}
                  >
                    {st.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Enquiries Table */}
        <Card className="shadow-soft bg-white rounded-2xl overflow-hidden border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50/70 border-b border-sky-100">
                <TableHead className="font-extrabold text-slate-700 text-xs">Ref Serial</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Customer</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Category</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Client Type</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Route & Details</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Vehicle</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Dates</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Ticket</TableHead>
                <TableHead className="font-extrabold text-slate-700 text-xs">Status</TableHead>
                <TableHead className="text-right font-extrabold text-slate-700 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-slate-400">
                    No matching enquiries found. Click "Log New Enquiry" to add travel leads!
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-mono text-xs font-bold text-[#0284c7]">
                      {e.enquiryNo || `VT-PKG-${e.id.slice(-4)}`}
                    </TableCell>
                    <TableCell>
                      <div
                        onClick={() => openEditModal(e)}
                        className="font-bold text-sm text-slate-900 cursor-pointer hover:text-[#0284c7] hover:underline"
                      >
                        {e.customerName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{e.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                        {e.enquiryNo?.includes('PKG') ? 'Tour Package' : e.enquiryNo?.includes('B2B') ? 'B2B' : 'Transport'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">{e.clientType || 'B2C'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-800">
                        {e.pickupLocation} → {e.destination}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {e.passengers} passengers · {e.days} days
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">{e.vehicle}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">
                      {e.startDate ? new Date(e.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-'}
                      {e.endDate ? ` - ${new Date(e.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : ''}
                    </TableCell>
                    <TableCell>
                      {e.ticketRequired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={e.status || 'new'}
                        onValueChange={(val) => updateEnquiry({ ...e, status: val })}
                      >
                        <SelectTrigger className="h-7 w-[120px] rounded-full text-[11px] font-bold border-slate-200 shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="quotation-sent">Quote Sent</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(e)}
                          className="text-xs font-bold text-slate-600 hover:text-[#0284c7] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleConvertToQuotation(e)}
                          className="flex items-center gap-1.5 h-7.5 px-3 rounded-full bg-[#f05438] hover:bg-[#ea580c] text-white text-[11px] font-extrabold cursor-pointer transition-colors shadow-xs"
                          title="Generate Smart Quotation"
                        >
                          <Sparkles className="h-3 w-3" /> Quote
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this enquiry?')) {
                              deleteEnquiry(e.id);
                            }
                          }}
                          className="flex items-center justify-center h-7.5 w-7.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Modal 1: Choose Enquiry Type */}
        <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
          <DialogContent className="sm:max-w-[800px] p-8 bg-white border border-slate-200 shadow-2xl rounded-3xl">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                Choose Enquiry Type
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-medium">
                Viyonka Travels generates dedicated serial prefixes for each travel vertical.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
              <button
                onClick={() => handleTypeSelect('package')}
                className="flex flex-col items-start p-6 text-left border-2 border-slate-200 rounded-2xl bg-sky-50/30 hover:border-[#0284c7] hover:bg-sky-50 transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-white text-[#0284c7] shadow-xs group-hover:scale-110 transition-transform mb-3">
                  <Palmtree className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Tour Package</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Multi-day leisure itinerary across Sikkim, Darjeeling & Dooars. (VT-PKG-YYYY-####)
                </p>
              </button>

              <button
                onClick={() => handleTypeSelect('transport')}
                className="flex flex-col items-start p-6 text-left border-2 border-slate-200 rounded-2xl bg-sky-50/30 hover:border-[#0284c7] hover:bg-sky-50 transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-white text-[#f05438] shadow-xs group-hover:scale-110 transition-transform mb-3">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Transport & Cabs</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Vehicle transfers, airport/railway drops, and day disposals. (VT-TR-YYYY-####)
                </p>
              </button>

              <button
                onClick={() => handleTypeSelect('b2b')}
                className="flex flex-col items-start p-6 text-left border-2 border-slate-200 rounded-2xl bg-sky-50/30 hover:border-[#0284c7] hover:bg-sky-50 transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform mb-3">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">B2B Agent Lead</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Agency partner bookings, corporate tariffs, and contract rates. (VT-B2B-YYYY-####)
                </p>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal 2: Create / Edit Enquiry Form */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <DialogTitle className="text-lg font-extrabold text-slate-900">
                {editingEnquiry ? 'Edit ' : 'New '}{enquiryPrefix === 'PKG' ? 'Tour Package' : enquiryPrefix === 'B2B' ? 'B2B Agency' : 'Transport'} Enquiry
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Log customer travel requirements, vehicle preferences, and trip notes.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-6 px-6 py-5 overflow-y-auto flex-1">
                {/* 1. Enquiry Classification */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Classification
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Select
                        value={enquiryPrefix}
                        onValueChange={(v) => {
                          setEnquiryPrefix(v as any);
                          setFormType(v === 'B2B' ? 'b2b' : v === 'PKG' ? 'tourist' : 'corporate');
                        }}
                      >
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PKG">Tour Package Enquiry (PKG)</SelectItem>
                          <SelectItem value="TR">Transport & Cab Hire (TR)</SelectItem>
                          <SelectItem value="B2B">B2B Partner Lead (B2B)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Client Segment</Label>
                      <Select value={clientType} onValueChange={setClientType as any}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2C">B2C (Individual / Family)</SelectItem>
                          <SelectItem value="B2B">B2B (Travel Agent)</SelectItem>
                          <SelectItem value="Corporate">Corporate / MICE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Profile */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Customer Name *</Label>
                      <Input
                        required
                        placeholder="e.g. Rahul Sen"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Mobile Number *</Label>
                      <Input
                        required
                        placeholder="e.g. 98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>WhatsApp Number</Label>
                      <Input
                        placeholder="e.g. 98765 43210"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Travel Route & Vehicle */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Travel Itinerary & Vehicle
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Pickup Location *</Label>
                      <Input
                        required
                        placeholder="e.g. Bagdogra Airport (IXB)"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Destination *</Label>
                      <Input
                        required
                        placeholder="e.g. Gangtok & Darjeeling"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Travel Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Travel End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Passengers (Pax)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={passengers}
                        onChange={(e) => setPassengers(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Vehicle Preference</Label>
                      <Input
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        placeholder="e.g. Innova Crysta / Dzire"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Service Checkpoints */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Service Checkpoints
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Flight/Train Ticket Confirmed?</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTicketConfirmed(true)}
                          className={cn(
                            'px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                            ticketConfirmed
                              ? 'bg-sky-50 border-[#0284c7] text-[#0284c7]'
                              : 'border-slate-200 text-slate-500'
                          )}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setTicketConfirmed(false)}
                          className={cn(
                            'px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                            !ticketConfirmed
                              ? 'bg-rose-50 border-rose-300 text-rose-700'
                              : 'border-slate-200 text-slate-500'
                          )}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Hotel Confirmed?</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setHotelConfirmed(true)}
                          className={cn(
                            'px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                            hotelConfirmed
                              ? 'bg-sky-50 border-[#0284c7] text-[#0284c7]'
                              : 'border-slate-200 text-slate-500'
                          )}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setHotelConfirmed(false)}
                          className={cn(
                            'px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                            !hotelConfirmed
                              ? 'bg-rose-50 border-rose-300 text-rose-700'
                              : 'border-slate-200 text-slate-500'
                          )}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Hotel Arrangement</Label>
                      <Select value={hotelType} onValueChange={setHotelType}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Without Hotel">Without Hotel (Cab Only)</SelectItem>
                          <SelectItem value="With Hotel">With Hotel (Complete Package)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 5. Additional Notes & Status */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Notes & Status
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Interested Places / Sightseeing Points</Label>
                      <Input
                        placeholder="e.g. Nathula, Changu, Tiger Hill, Pelling Glass Skywalk"
                        value={interestedPlaces}
                        onChange={(e) => setInterestedPlaces(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Special Requirements / Notes</Label>
                      <Textarea
                        placeholder="e.g. Senior citizens traveling, child car seat, pickup delay alert..."
                        value={specialRequirements}
                        onChange={(e) => setSpecialRequirements(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Lead Status</Label>
                      <Select value={enquiryStatus} onValueChange={setEnquiryStatus}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Lead</SelectItem>
                          <SelectItem value="follow-up">Follow-up Needed</SelectItem>
                          <SelectItem value="quotation-sent">Quotation Sent</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl px-6"
                >
                  {editingEnquiry ? 'Save Changes' : 'Create Enquiry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Enquiries...</div>}>
      <EnquiriesPageInner />
    </Suspense>
  );
}
