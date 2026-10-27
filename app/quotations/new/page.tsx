'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Trash2, Plus, Download, Check, X, ChevronDown, Sparkles } from 'lucide-react';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { QuotationPdfTemplate } from '@/components/pdf/quotation-template';
import { formatCurrency } from '@/utils/formatters';

interface VehicleEntry {
  id: string;
  vehicle: string;
  qty: number;
  days: number;
  rate: number;
  packagePrice: string;
  total: number;
}

function SmartQuotationBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get('enquiryId');
  const editId = searchParams.get('editId');

  const {
    enquiries,
    quotations,
    updateQuotation,
    addQuotation,
    deleteQuotation,
    settings,
    itineraryTemplates,
  } = useFleetStore();

  const [status, setStatus] = useState('Draft');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);

  // Section 1: Customer & Tour
  const [qType, setQType] = useState('Tour package');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [destination, setDestination] = useState('Gangtok & Darjeeling');
  const [persons, setPersons] = useState('4');
  const [clientType, setClientType] = useState('B2C');

  // Section 2: Travel Info
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
  const [packageDuration, setPackageDuration] = useState('5D / 4N');
  const [pickup, setPickup] = useState('Bagdogra Airport (IXB)');
  const [drop, setDrop] = useState('NJP Railway Station');

  // Section 3: Itinerary
  const [itinerary, setItinerary] = useState([
    { id: '1', title: 'Arrival at Bagdogra / NJP to Gangtok', desc: 'Pickup from Bagdogra Airport (IXB) or NJP Railway Station. Scenic drive along Teesta river to Gangtok. Hotel check-in and evening stroll at MG Marg.', heading: 'Arrival & Transfer' },
    { id: '2', title: 'Tsomgo Lake & Baba Mandir Excursion', desc: 'Full-day tour to high-altitude Tsomgo (Changu) Lake and sacred Baba Harbhajan Singh Mandir. Optional Nathula Pass permit.', heading: 'East Sikkim Wonder' },
    { id: '3', title: 'Gangtok to Darjeeling via Tea Gardens', desc: 'Drive to the Queen of Hills, Darjeeling. En-route stop at Lamahatta Eco Park and Lovers Meet Viewpoint. Check-in and relax at Chowrasta.', heading: 'Hill Station Drive' },
    { id: '4', title: 'Darjeeling Sunrise & Best 7 Points', desc: 'Early 4:00 AM visit to Tiger Hill for Kanchenjunga sunrise view, Batasia Loop, Ghoom Monastery, followed by Himalayan Mountaineering Institute and Tea Gardens.', heading: 'Darjeeling Highlights' },
    { id: '5', title: 'Darjeeling to IXB / NJP Departure', desc: 'Breakfast and departure drive to Bagdogra Airport or NJP Station for return journey with fond memories of Viyonka Travels.', heading: 'Departure' },
  ]);

  // Section 4: Vehicles
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([
    { id: 'v1', vehicle: 'Innova Crysta', qty: 1, days: 5, rate: 4500, packagePrice: '', total: 22500 },
  ]);

  // Section 5: Rate Card Addons
  const [rateCard, setRateCard] = useState({
    perDay: 0,
    packagePrice: 0,
    permits: 0,
    toll: 0,
    parking: 0,
    extraKm: 0,
    extraHour: 0,
    driverAllowance: 0,
    nightCharge: 0,
    gst: 5,
    additional: 0,
  });

  const [hasGst, setHasGst] = useState(true);
  const [advancePercent, setAdvancePercent] = useState(30);

  // Section 6: Inclusions, Exclusions, Permits, Sightseeing
  const [inclusions, setInclusions] = useState<string[]>([
    'Exclusive Private Vehicle for all transfers and sightseeing',
    'Driver allowance, night halt, toll taxes and parking charges',
    'Fuel charges and interstate permits',
    'Pickup and drop as per confirmed schedule',
  ]);
  const [exclusions, setExclusions] = useState<string[]>([
    'Airfare / Train tickets',
    'Hotel accommodation & meals (unless package booked with stay)',
    'Entry tickets to monuments, ropeway, and joyrides',
    'Personal expenses like laundry, tips, room heater charges',
  ]);
  const [permits, setPermits] = useState<string[]>([]);
  const [extraSightseeing, setExtraSightseeing] = useState<string[]>([]);

  // Section 7: Accordions
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [pickupTiming, setPickupTiming] = useState('');
  const [dropTiming, setDropTiming] = useState('');
  const [driverInstructions, setDriverInstructions] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [terms, setTerms] = useState(settings?.terms || '');

  // Load from enquiry
  useEffect(() => {
    if (enquiryId) {
      const enq = enquiries.find((e) => e.id === enquiryId);
      if (enq) {
        setCustomerName(enq.customerName || '');
        setMobile(enq.mobile || '');
        setDestination(enq.destination || '');
        setPersons(String(enq.passengers || 2));
        setClientType(enq.type === 'b2b' ? 'B2B' : (enq.clientType || 'B2C'));
        setPickup(enq.pickupLocation || '');
        setDrop(enq.destination || '');
        if (enq.startDate) setStartDate(enq.startDate.split('T')[0]);
        if (enq.endDate) setEndDate(enq.endDate.split('T')[0]);
        if (enq.vehicle) {
          setVehicles((prev) => [{ ...prev[0], vehicle: enq.vehicle as string }]);
        }
      }
    }

    if (editId) {
      const quote = quotations.find((q) => q.id === editId) as any;
      if (quote) {
        setCustomerName(quote.clientName || quote.customerName || '');
        setMobile(quote.clientPhone || quote.mobile || '');
        setDestination(quote.destination || '');
        setPersons(String(quote.passengers || quote.persons || 2));
        setClientType(quote.clientType || quote.type || 'B2C');
        setPickup(quote.pickupLocation || '');
        setDrop(quote.drop || quote.destination || '');
        if (quote.startDate) setStartDate(quote.startDate.split('T')[0]);
        if (quote.endDate) setEndDate(quote.endDate.split('T')[0]);
        if (quote.packageDuration) setPackageDuration(quote.packageDuration);
        setStatus(quote.status || 'Draft');
        setQType(quote.qType || 'Tour package');
        if (quote.date || quote.createdAt) {
          setQuotationDate(new Date(quote.date || quote.createdAt).toISOString().split('T')[0]);
        }
        if (quote.itinerary && quote.itinerary.length > 0) setItinerary(quote.itinerary);
        if (quote.vehicles && quote.vehicles.length > 0) setVehicles(quote.vehicles);
        if (quote.rateCard) setRateCard(quote.rateCard);
        if (quote.hasGst !== undefined) setHasGst(quote.hasGst);
        if (quote.advancePercent !== undefined) setAdvancePercent(quote.advancePercent);
        if (quote.inclusions) setInclusions(quote.inclusions);
        if (quote.exclusions) setExclusions(quote.exclusions);
        if (quote.permits) setPermits(quote.permits);
        if (quote.extraSightseeing) setExtraSightseeing(quote.extraSightseeing);
        setAdditionalDetails(quote.additionalDetails || '');
        setPickupTiming(quote.pickupTiming || '');
        setDropTiming(quote.dropTiming || '');
        setDriverInstructions(quote.driverInstructions || '');
        setVehicleNotes(quote.vehicleNotes || '');
        setAdditionalNotes(quote.additionalNotes || '');
        setRemarks(quote.remarks || '');
        setTerms(quote.terms || settings?.terms || '');
      }
    }
  }, [enquiryId, editId, enquiries, quotations, settings]);

  // Sync dates to duration and itinerary length
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      const diffNights = diffDays > 1 ? diffDays - 1 : 0;
      setPackageDuration(`${diffDays}D / ${diffNights}N`);

      setItinerary((prev) => {
        if (prev.length === diffDays) return prev;
        if (prev.length > diffDays) return prev.slice(0, diffDays);
        const newItems = [...prev];
        for (let i = prev.length; i < diffDays; i++) {
          newItems.push({
            id: Date.now().toString() + i,
            title: `Day ${i + 1} Sightseeing`,
            desc: 'Sightseeing as scheduled.',
            heading: `Day ${i + 1}`,
          });
        }
        return newItems;
      });
    }
  }, [startDate, endDate]);

  // Pricing Math
  const vTotal = vehicles.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const toll = Number(rateCard?.toll) || 0;
  const parking = Number(rateCard?.parking) || 0;
  const additional = Number(rateCard?.additional) || 0;
  const packagePrice = Number(rateCard?.packagePrice) || 0;
  const gstRate = hasGst ? (Number(rateCard?.gst) || 5) : 0;

  const calculateListSum = (list: string[]) =>
    list.reduce((acc, item) => {
      const match = item.match(/₹([\d,]+)/);
      return match ? acc + Number(match[1].replace(/,/g, '')) : acc;
    }, 0);

  const dynamicPermitsAmt = calculateListSum(permits);
  const dynamicSightseeingAmt = calculateListSum(extraSightseeing);
  const permitsTotal = (Number(rateCard?.permits) || 0) + dynamicPermitsAmt;

  const subtotal = (packagePrice || vTotal) + permitsTotal + dynamicSightseeingAmt + toll + parking + additional;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const grandTotal = subtotal + gstAmount;
  const advanceAmount = Math.round((grandTotal * (Number(advancePercent) || 30)) / 100);
  const balance = grandTotal - advanceAmount;

  const handleSave = async () => {
    if (!customerName) {
      window.alert('Please enter a customer name.');
      return;
    }

    const payload = {
      clientName: customerName,
      customerName,
      clientPhone: mobile,
      mobile,
      destination: destination || drop,
      drop,
      passengers: parseInt(persons) || 2,
      persons,
      type: clientType,
      clientType,
      pickupLocation: pickup,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      packageDuration,
      status: status as any,
      qType,
      itinerary,
      vehicles,
      rateCard,
      advancePercent,
      advanceAmount,
      balance,
      inclusions,
      exclusions,
      permits,
      extraSightseeing,
      additionalDetails,
      pickupTiming,
      dropTiming,
      driverInstructions,
      vehicleNotes,
      additionalNotes,
      remarks,
      terms,
      hasGst,
      baseAmount: subtotal,
      subtotal,
      totalAmount: grandTotal,
      grandTotal,
      gstAmount,
      date: new Date(quotationDate).toISOString(),
      ...(enquiryId ? { enquiryId } : {}),
    };

    if (editId) {
      const quoteToUpdate = quotations.find((q) => q.id === editId);
      if (quoteToUpdate) {
        await updateQuotation({ ...quoteToUpdate, ...payload } as any);
      }
    } else {
      const newNo = `VT/${new Date().getFullYear()}/${String(quotations.length + 1001).padStart(4, '0')}`;
      await addQuotation({
        id: `q-${Date.now()}`,
        quotationNo: newNo,
        createdAt: new Date().toISOString(),
        ...payload,
      } as any);
    }
    router.push('/quotations');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-24 text-slate-800">
        {/* Top Floating Action Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/quotations')}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Quotations
            </button>
            <span className="text-sm font-extrabold text-slate-900 hidden sm:inline">
              {editId ? `Editing Quote: ${editId.substring(0, 8).toUpperCase()}` : 'Smart Quotation Builder'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {editId && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this quotation?')) {
                    deleteQuotation(editId);
                    router.push('/quotations');
                  }
                }}
                className="h-9 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 flex items-center text-xs font-bold text-rose-600 transition-colors cursor-pointer"
                title="Delete Quotation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <Button
              onClick={handleSave}
              className="h-9 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs"
            >
              <Check className="h-4 w-4 mr-1.5" /> {editId ? 'Update Quotation' : 'Save Quotation'}
            </Button>
            <Button
              onClick={() => setIsPreviewOpen(true)}
              className="h-9 px-5 rounded-xl bg-[#f05438] hover:bg-[#ea580c] text-white font-bold text-xs shadow-xs"
            >
              <Download className="h-4 w-4 mr-1.5" /> Download / Print PDF
            </Button>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {isPreviewOpen && (
          <PdfPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            title="Quotation Document Preview"
            documentNo={`Ref: ${editId ? editId.substring(0, 8).toUpperCase() : 'NEW'}`}
          >
            <QuotationPdfTemplate
              quotation={{
                clientName: customerName,
                customerName,
                clientPhone: mobile,
                mobile,
                destination: destination || drop,
                pickupLocation: pickup,
                startDate,
                endDate,
                packageDuration,
                passengers: persons,
                status,
                itinerary,
                vehicles,
                grandTotal,
                totalAmount: grandTotal,
                baseAmount: subtotal,
                gstAmount,
                inclusions,
                exclusions,
                terms,
                remarks,
                quotationNo: editId ? quotations.find((q) => q.id === editId)?.quotationNo : undefined,
              }}
              settings={settings}
            />
          </PdfPreviewModal>
        )}

        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Card 1: Customer & Tour */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Customer & Tour Information</h2>
                <p className="text-xs text-slate-500 font-medium">Customer profile, tour vertical, and status.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                  <Checkbox
                    id="hasGstTop"
                    checked={hasGst}
                    onCheckedChange={(c) => setHasGst(!!c)}
                  />
                  <Label htmlFor="hasGstTop" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Apply GST (5%)
                  </Label>
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 w-32 rounded-xl text-xs font-bold border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  <span>Date:</span>
                  <Input
                    type="date"
                    className="h-8 w-36 rounded-lg text-xs"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6">
              <div className="space-y-1.5">
                <Label>Quotation Vertical</Label>
                <Select value={qType} onValueChange={setQType}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tour package">Tour Package</SelectItem>
                    <SelectItem value="Transport">Transport & Cab Disposal</SelectItem>
                    <SelectItem value="B2B">B2B Agent Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Customer Name *</Label>
                <Input
                  required
                  placeholder="e.g. Anirban Roy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number</Label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Destination / Circuit *</Label>
                <Input
                  placeholder="e.g. Gangtok, Lachen, Lachung, Darjeeling"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Passengers (Pax)</Label>
                <Input
                  type="number"
                  min={1}
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Client Segment</Label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2C">B2C (Family / Solo)</SelectItem>
                    <SelectItem value="B2B">B2B Travel Partner</SelectItem>
                    <SelectItem value="Corporate">Corporate / MICE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Travel Dates & Transfer Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <h2 className="text-lg font-extrabold text-slate-900 mb-5">Travel Timing & Transfers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label>Tour Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tour End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Calculated Duration</Label>
                <Input
                  value={packageDuration}
                  onChange={(e) => setPackageDuration(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pickup Location</Label>
                <Input
                  placeholder="e.g. Bagdogra Airport (IXB)"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Drop Location</Label>
                <Input
                  placeholder="e.g. NJP Railway Station"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Day-Wise Itinerary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Day-Wise Tour Itinerary</h2>
                <p className="text-xs text-slate-500 font-medium">Build a custom timeline or load from curated travel templates.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  onValueChange={(val) => {
                    const tpl = itineraryTemplates.find((t) => t.id === val);
                    if (tpl && tpl.itinerary) {
                      setItinerary(
                        tpl.itinerary.map((i: any, idx: number) => ({
                          id: `${Date.now()}-${idx}`,
                          title: i.title,
                          desc: i.desc || i.description || '',
                          heading: `Day ${idx + 1}`,
                        }))
                      );
                      const start = new Date(startDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + (tpl.days - 1));
                      setEndDate(end.toISOString().split('T')[0]);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-64 rounded-xl text-xs font-semibold border-slate-200">
                    <SelectValue placeholder="Load Itinerary Template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itineraryTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() =>
                    setItinerary([
                      ...itinerary,
                      {
                        id: Date.now().toString(),
                        title: `Day ${itinerary.length + 1} Sightseeing`,
                        desc: '',
                        heading: `Day ${itinerary.length + 1}`,
                      },
                    ])
                  }
                  className="bg-sky-50 text-[#0284c7] hover:bg-sky-100 border border-sky-200 rounded-xl font-bold text-xs h-9"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add Day
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              {itinerary.map((day, idx) => (
                <div key={day.id || idx} className="relative pl-10">
                  {/* Timeline connector */}
                  {idx !== itinerary.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200" />
                  )}
                  {/* Day Badge */}
                  <div className="absolute left-0 top-2 flex items-center justify-center w-8 h-8 rounded-full bg-[#0284c7] text-white font-extrabold text-xs shadow-xs z-10">
                    {idx + 1}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/40 hover:bg-white hover:border-[#0284c7]/40 transition-all">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-[#0284c7]">
                        Day {idx + 1}
                      </span>
                      <Input
                        placeholder="Day Subheading (e.g. Gangtok to Lachen)"
                        value={day.heading || ''}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[idx].heading = e.target.value;
                          setItinerary(updated);
                        }}
                        className="h-8 max-w-sm text-xs font-semibold"
                      />
                      <button
                        onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Day"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Textarea
                      className="mt-3 border-slate-200 bg-white min-h-[90px] text-xs leading-relaxed"
                      placeholder="Detail sightseeing points, halts, and overnight stay..."
                      value={day.desc || (day as any).description || ''}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[idx].desc = e.target.value;
                        setItinerary(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Vehicles Matrix */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Vehicles Allocation</h2>
                <p className="text-xs text-slate-500 font-medium">Add one or multiple cabs, buses, or luxury coaches.</p>
              </div>
              <Button
                onClick={() =>
                  setVehicles([
                    ...vehicles,
                    {
                      id: `v-${Date.now()}`,
                      vehicle: 'Swift Dzire',
                      qty: 1,
                      days: itinerary.length || 5,
                      rate: 3500,
                      packagePrice: '',
                      total: 3500 * (itinerary.length || 5),
                    },
                  ])
                }
                className="bg-sky-50 text-[#0284c7] hover:bg-sky-100 border border-sky-200 rounded-xl font-bold text-xs h-9"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Vehicle
              </Button>
            </div>

            <div className="space-y-4 pt-6">
              {vehicles.map((v, idx) => (
                <div key={v.id || idx} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2 space-y-1">
                      <Label>Vehicle Type</Label>
                      <Input
                        value={v.vehicle}
                        onChange={(e) => {
                          const nv = [...vehicles];
                          nv[idx].vehicle = e.target.value;
                          setVehicles(nv);
                        }}
                        placeholder="e.g. Innova Crysta / Dzire"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={v.qty}
                        onChange={(e) => {
                          const nv = [...vehicles];
                          nv[idx].qty = Number(e.target.value);
                          nv[idx].total = nv[idx].qty * nv[idx].days * nv[idx].rate;
                          setVehicles(nv);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Days</Label>
                      <Input
                        type="number"
                        min={1}
                        value={v.days}
                        onChange={(e) => {
                          const nv = [...vehicles];
                          nv[idx].days = Number(e.target.value);
                          nv[idx].total = nv[idx].qty * nv[idx].days * nv[idx].rate;
                          setVehicles(nv);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Rate / Day (₹)</Label>
                      <Input
                        type="number"
                        value={v.rate}
                        onChange={(e) => {
                          const nv = [...vehicles];
                          nv[idx].rate = Number(e.target.value);
                          nv[idx].total = nv[idx].qty * nv[idx].days * nv[idx].rate;
                          setVehicles(nv);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="space-y-1 flex-1">
                        <Label>Line Total (₹)</Label>
                        <Input
                          type="number"
                          value={v.total}
                          onChange={(e) => {
                            const nv = [...vehicles];
                            nv[idx].total = Number(e.target.value);
                            setVehicles(nv);
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setVehicles(vehicles.filter((_, i) => i !== idx))}
                        className="h-10 px-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Inclusions & Exclusions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Inclusions & Exclusions</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">Clarify covered deliverables and customer out-of-pocket costs.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="border border-emerald-200/80 rounded-2xl p-4 bg-emerald-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" /> Package Inclusions
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const item = window.prompt('Add custom inclusion:');
                      if (item && !inclusions.includes(item)) setInclusions([...inclusions, item]);
                    }}
                    className="h-7 text-xs font-bold text-emerald-800 border-emerald-200 bg-white"
                  >
                    + Add
                  </Button>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {inclusions.map((inc, i) => (
                    <li key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100">
                      <span>✓ {inc}</span>
                      <button
                        onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="border border-rose-200/80 rounded-2xl p-4 bg-rose-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                    <X className="h-4 w-4 text-rose-600" /> Package Exclusions
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const item = window.prompt('Add custom exclusion:');
                      if (item && !exclusions.includes(item)) setExclusions([...exclusions, item]);
                    }}
                    className="h-7 text-xs font-bold text-rose-800 border-rose-200 bg-white"
                  >
                    + Add
                  </Button>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {exclusions.map((exc, i) => (
                    <li key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-rose-100">
                      <span>✕ {exc}</span>
                      <button
                        onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 6: Addons (Permits & Extra Sightseeing) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Permits & Extra Sightseeing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Permits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Permits & Special Pass Fees</Label>
                  <Select
                    onValueChange={(val) => {
                      if (!permits.includes(val)) setPermits([...permits, val]);
                    }}
                  >
                    <SelectTrigger className="h-8 w-44 text-xs font-bold"><SelectValue placeholder="Add Permit..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nathula Pass Permit — ₹3,500">Nathula Pass Permit — ₹3,500</SelectItem>
                      <SelectItem value="North Sikkim Permit — ₹2,500">North Sikkim Permit — ₹2,500</SelectItem>
                      <SelectItem value="Bhutan Permit — ₹4,500">Bhutan Permit — ₹4,500</SelectItem>
                      <SelectItem value="Sikkim Entry Permit — ₹500">Sikkim Entry Permit — ₹500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {permits.map((p, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800">{p}</span>
                      <button onClick={() => setPermits(permits.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extra Sightseeing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Extra Sightseeing Points</Label>
                  <Select
                    onValueChange={(val) => {
                      if (!extraSightseeing.includes(val)) setExtraSightseeing([...extraSightseeing, val]);
                    }}
                  >
                    <SelectTrigger className="h-8 w-44 text-xs font-bold"><SelectValue placeholder="Add Sightseeing..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zero Point (Yumesamdong) — ₹2,500">Zero Point — ₹2,500</SelectItem>
                      <SelectItem value="Changu Lake Special Halt — ₹1,800">Changu Lake — ₹1,800</SelectItem>
                      <SelectItem value="Baba Mandir — ₹800">Baba Mandir — ₹800</SelectItem>
                      <SelectItem value="Kalaktang / Pelling Skywalk — ₹2,000">Pelling Skywalk — ₹2,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {extraSightseeing.map((s, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800">{s}</span>
                      <button onClick={() => setExtraSightseeing(extraSightseeing.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 7: Auto-Calculated Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200/80">
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">Financial Summary & Advance Calculation</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Vehicles Base Fare ({vehicles.length} Vehicle(s))</span>
                  <span className="font-extrabold text-slate-900">{formatCurrency(packagePrice || vTotal)}</span>
                </div>
                {permitsTotal > 0 && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Permits & Entry Passes</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(permitsTotal)}</span>
                  </div>
                )}
                {dynamicSightseeingAmt > 0 && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Extra Sightseeing Points</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(dynamicSightseeingAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Driver Allowance & Night Halts</span>
                  <span className="font-bold text-slate-900">Included</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Toll & Parking Charges</span>
                  <span className="font-bold text-slate-900">Included</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-8 text-xs">
                <div className="flex justify-between font-bold text-sm text-slate-800">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {hasGst && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>GST (5%)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-[#0284c7] border-t border-slate-100 pt-2">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium items-center">
                  <span>Advance Required ({advancePercent}%)</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium border-t border-slate-100 pt-2">
                  <span>Balance Payable at Tour Start</span>
                  <span className="font-bold text-[#f05438]">{formatCurrency(balance)}</span>
                </div>

                <div className="pt-3">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-xl h-11"
                  >
                    Save & Generate Quotation
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 8: Expandable Accordions for Terms, Transport Notes & Remarks */}
          <div className="space-y-3">
            {[
              { id: 'transport', title: 'Transport Details & Driver Instructions' },
              { id: 'remarks', title: 'Internal Remarks & Client Notes' },
              { id: 'terms', title: 'Terms & Conditions' },
            ].map((acc) => (
              <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-xs font-extrabold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {acc.title}
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openAccordion === acc.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === acc.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    {acc.id === 'transport' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1">
                          <Label>Pickup Timing</Label>
                          <Input
                            placeholder="e.g. 10:30 AM at IXB Flight 6E-205"
                            value={pickupTiming}
                            onChange={(e) => setPickupTiming(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Drop Timing</Label>
                          <Input
                            placeholder="e.g. 02:00 PM at NJP"
                            value={dropTiming}
                            onChange={(e) => setDropTiming(e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label>Driver Instructions</Label>
                          <Textarea
                            placeholder="e.g. Chauffeur to carry name placard at airport arrival gate..."
                            value={driverInstructions}
                            onChange={(e) => setDriverInstructions(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    {acc.id === 'remarks' && (
                      <Textarea
                        placeholder="Internal pricing notes or special arrangement remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="mt-2 min-h-[90px]"
                      />
                    )}
                    {acc.id === 'terms' && (
                      <Textarea
                        placeholder="Enter terms and conditions (e.g. advance, cancellation policy)..."
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="mt-2 min-h-[140px] text-xs font-mono"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SmartQuotationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Quotation Builder...</div>}>
      <SmartQuotationBuilderForm />
    </Suspense>
  );
}
