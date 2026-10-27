import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCxPeU-EI_XARWooQGXJ7q-VvxGsUg-23Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "viyonka-travels.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "viyonka-travels",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "viyonka-travels.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1009677185783",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1009677185783:web:5f69020df3c436e6ccd9f2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5JP1ME9TRJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleVehicles = [
  { id: 'veh-01', name: 'Innova Crysta 2.4 VX', category: 'Innova Crysta', type: 'Innova Crysta', registration: 'WB-74-AX-1008', regNo: 'WB-74-AX-1008', seatingCapacity: 7, driverName: 'Pemba Sherpa', driverMobile: '+91 98320 11223', fuelType: 'Diesel', status: 'active' },
  { id: 'veh-02', name: 'Mahindra Scorpio Classic S11 (4WD)', category: 'Scorpio / Bolero', type: 'Scorpio / Bolero', registration: 'WB-74-BB-2408', regNo: 'WB-74-BB-2408', seatingCapacity: 7, driverName: 'Rajesh Thapa', driverMobile: '+91 97330 44556', fuelType: 'Diesel', status: 'active' },
  { id: 'veh-03', name: 'Maruti Suzuki Swift Dzire ZXi', category: 'Sedan - Swift Dzire', type: 'Sedan - Swift Dzire', registration: 'WB-74-C-3008', regNo: 'WB-74-C-3008', seatingCapacity: 4, driverName: 'Bikash Subba', driverMobile: '+91 94340 77889', fuelType: 'Petrol', status: 'active' },
  { id: 'veh-04', name: 'Force Urbania Luxury 16S', category: 'Urbania - 16 Seater', type: 'Urbania - 16 Seater', registration: 'WB-74-D-4008', regNo: 'WB-74-D-4008', seatingCapacity: 16, driverName: 'Pemba Sherpa', driverMobile: '+91 98320 11223', fuelType: 'Diesel', status: 'active' }
];

const sampleDrivers = [
  { id: 'drv-01', name: 'Pemba Sherpa', mobile: '+91 98320 11223', license: 'WB7420120003456', licenseNo: 'WB7420120003456', assignedVehicleId: 'veh-01', status: 'active' },
  { id: 'drv-02', name: 'Rajesh Thapa', mobile: '+91 97330 44556', license: 'WB7420150007890', licenseNo: 'WB7420150007890', assignedVehicleId: 'veh-02', status: 'active' },
  { id: 'drv-03', name: 'Bikash Subba', mobile: '+91 94340 77889', license: 'WB7420180004561', licenseNo: 'WB7420180004561', assignedVehicleId: 'veh-03', status: 'active' }
];

const sampleCorporateClients = [
  { id: 'corp-01', companyName: 'Eastern Himalayan Holidays', contactPerson: 'Anirban Roy', mobile: '+91 98300 22334', email: 'ops@easternhimalayan.in', gstin: '19AAACE1122D1Z1', billingAddress: 'Salt Lake Sector V, Kolkata, West Bengal', status: 'active' },
  { id: 'corp-02', companyName: 'Peak Wanderlust Tours', contactPerson: 'Sunita Mehra', mobile: '+91 98200 55667', email: 'b2b@peakwanderlust.com', gstin: '27AABCP3344E1Z8', billingAddress: 'Andheri West, Mumbai, Maharashtra', status: 'active' }
];

const sampleEnquiries = [
  { id: 'enq-01', enquiryNo: 'VT-PKG-2026-0001', customerName: 'Mr. Rohan Sharma', mobile: '+91 98765 43210', email: 'rohan.sharma@example.com', clientType: 'tourist', type: 'tourist', pickupLocation: 'Bagdogra Airport (IXB)', destination: 'Gangtok & North Sikkim (Lachen, Lachung, Yumthang)', startDate: '2026-11-15', endDate: '2026-11-20', days: 6, passengers: 4, vehicle: 'Innova Crysta', hotelRequired: true, hotelType: 'With Hotel', specialRequirements: 'Permits needed for Gurudongmar Lake and Zero Point.', status: 'quotation-sent', createdAt: '2026-10-25T10:30:00.000Z' },
  { id: 'enq-02', enquiryNo: 'VT-TR-2026-0002', customerName: 'Dr. Ananya Sen', mobile: '+91 98310 98765', email: 'ananya.sen@example.com', clientType: 'tourist', type: 'tourist', pickupLocation: 'NJP Railway Station', destination: 'Darjeeling & Mirik Romantic Getaway', startDate: '2026-11-04', endDate: '2026-11-07', days: 4, passengers: 2, vehicle: 'Innova Crysta', hotelRequired: false, hotelType: 'Without Hotel', specialRequirements: 'Sunrise trip to Tiger Hill and Batasia Loop.', status: 'confirmed', createdAt: '2026-10-26T14:15:00.000Z' },
  { id: 'enq-03', enquiryNo: 'VT-B2B-2026-0003', customerName: 'Peak Wanderlust Tours (Group)', mobile: '+91 98200 55667', email: 'b2b@peakwanderlust.com', clientType: 'b2b', type: 'b2b', pickupLocation: 'Bagdogra Airport (IXB)', destination: 'Kalimpong & Dooars Wildlife Safari', startDate: '2026-11-20', endDate: '2026-11-24', days: 5, passengers: 14, vehicle: 'Urbania - 16 Seater', hotelRequired: true, hotelType: 'With Hotel', specialRequirements: 'Jungle Safari permit at Jaldapara National Park.', status: 'follow-up', createdAt: '2026-10-27T09:00:00.000Z' },
  { id: 'enq-04', enquiryNo: 'VT-TR-2026-0004', customerName: 'Amit Verma', mobile: '+91 99001 12233', email: 'amit.v@example.com', clientType: 'tourist', type: 'tourist', pickupLocation: 'Siliguri Junction', destination: 'Gangtok Round Trip', startDate: '2026-10-30', endDate: '2026-11-02', days: 4, passengers: 6, vehicle: 'Scorpio / Bolero', hotelRequired: false, status: 'new', createdAt: '2026-10-27T16:20:00.000Z' }
];

const sampleQuotations = [
  {
    id: 'quot-01',
    quotationNo: 'VT/26-27/001',
    enquiryId: 'enq-02',
    clientName: 'Dr. Ananya Sen',
    customerName: 'Dr. Ananya Sen',
    mobile: '+91 98310 98765',
    clientPhone: '+91 98310 98765',
    clientEmail: 'ananya.sen@example.com',
    pickupLocation: 'NJP Railway Station',
    destination: 'Darjeeling & Mirik Queen of Hills (3N / 4D)',
    startDate: '2026-11-04',
    endDate: '2026-11-07',
    packageDuration: '3 Nights / 4 Days',
    passengers: 2,
    days: 4,
    vehicle: 'Innova Crysta',
    clientType: 'tourist',
    vehicles: [{ id: 'qv-01', vehicle: 'Innova Crysta 7 Seater Luxury', qty: 1, days: 4, rate: 4200, total: 16800 }],
    rateCard: { perDay: 4200, driverAllowance: 400, toll: 500, parking: 300, permits: 0 },
    itinerary: [
      { day: 1, title: 'NJP / IXB to Darjeeling Transfer', desc: 'Scenic drive through Kurseong and pine forests. Check in at Darjeeling hotel and evening walk at Mall Road.' },
      { day: 2, title: 'Darjeeling Early Morning & Best 7 Points', desc: 'Early 4:00 AM visit to Tiger Hill for Kanchenjunga sunrise, Batasia Loop, Ghoom Monastery, Mountaineering Institute, and Happy Valley Tea Estate.' },
      { day: 3, title: 'Mirik Lake & Pashupati Nepal Border Excursion', desc: 'Day trip to serene Sumendu Lake (Mirik), boating, pine forest walks, and shopping stop at Pashupati Market (Nepal border).' },
      { day: 4, title: 'Darjeeling to NJP / IXB Departure', desc: 'Breakfast, hotel checkout, and comfortable drop to NJP Railway Station or Bagdogra Airport.' }
    ],
    inclusions: ['Dedicated Innova Crysta for all 4 days', 'All fuel, toll tax, parking charges, and hill permits', 'Driver allowances, accommodation, and food', '24/7 dedicated trip coordinator assistance from Siliguri HQ'],
    exclusions: ['Airfare or train tickets', 'Entry tickets, ropeway fees, and monastery camera permits', 'Personal expenses, laundry, and meals unless specified'],
    baseAmount: 17619,
    subtotal: 17619,
    gstPercent: 5,
    hasGst: true,
    gstAmount: 881,
    grandTotal: 18500,
    totalAmount: 18500,
    advancePercent: 30,
    advanceAmount: 5550,
    balance: 12950,
    status: 'confirmed',
    createdAt: '2026-10-26T15:00:00.000Z'
  },
  {
    id: 'quot-02',
    quotationNo: 'VT/26-27/002',
    enquiryId: 'enq-01',
    clientName: 'Mr. Rohan Sharma',
    customerName: 'Mr. Rohan Sharma',
    mobile: '+91 98765 43210',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rohan.sharma@example.com',
    pickupLocation: 'Bagdogra Airport (IXB)',
    destination: 'Gangtok & North Sikkim Odyssey (5N / 6D)',
    startDate: '2026-11-15',
    endDate: '2026-11-20',
    packageDuration: '5 Nights / 6 Days',
    passengers: 4,
    days: 6,
    vehicle: 'Innova Crysta',
    clientType: 'tourist',
    vehicles: [{ id: 'qv-02', vehicle: 'Innova Crysta AC / Hill SUV', qty: 1, days: 6, rate: 4500, total: 27000 }],
    rateCard: { perDay: 4500, driverAllowance: 500, permits: 3500, toll: 800, parking: 500 },
    itinerary: [
      { day: 1, title: 'Bagdogra (IXB) to Gangtok', desc: 'Pickup and drive along Teesta River to Gangtok capital. Evening stroll on MG Marg.' },
      { day: 2, title: 'Gangtok Excursion: Tsomgo Lake & Baba Mandir', desc: 'Visit sacred Changu Lake (12,310 ft) and historic Baba Harbhajan Singh Mandir.' },
      { day: 3, title: 'Gangtok to Lachen (North Sikkim)', desc: 'Drive to Lachen. Sightseeing at Seven Sisters Waterfalls and Singhik Viewpoint.' },
      { day: 4, title: 'Gurudongmar Lake (17,800 ft) & Transfer to Lachung', desc: 'Early morning expedition to holy Gurudongmar Lake. Post-lunch transfer to picturesque Lachung village.' },
      { day: 5, title: 'Yumthang Valley of Flowers & Gangtok Return', desc: 'Valley of Flowers, hot springs, optional Zero Point drive, then scenic return to Gangtok.' },
      { day: 6, title: 'Gangtok to Bagdogra (IXB) Departure', desc: 'Breakfast, check out, and comfortable drop to Bagdogra Airport.' }
    ],
    inclusions: ['Exclusive Innova Crysta for complete Sikkim tour', 'Special North Sikkim inner line permits (Gurudongmar, Lachen, Lachung)', 'All toll, driver allowance, and parking charges'],
    exclusions: ['Nathula Pass permit fee and Zero Point vehicle surcharge (payable on spot)', 'Hotel stays (unless booked through package add-on)', 'Meals, beverages, and personal expenditures'],
    baseAmount: 46190,
    subtotal: 46190,
    gstPercent: 5,
    hasGst: true,
    gstAmount: 2310,
    grandTotal: 48500,
    totalAmount: 48500,
    advancePercent: 30,
    advanceAmount: 14550,
    balance: 33950,
    status: 'sent',
    createdAt: '2026-10-27T11:00:00.000Z'
  }
];

const sampleBookings = [
  { id: 'book-01', bookingNo: 'VT-BK-001', quotationId: 'quot-01', enquiryId: 'enq-02', clientName: 'Dr. Ananya Sen', clientType: 'tourist', vehicle: 'Innova Crysta', pickup: 'NJP Railway Station', destination: 'Darjeeling (3N / 4D)', startDate: '2026-11-04', endDate: '2026-11-07', status: 'confirmed', amount: 18500, advance: 5550, driverId: 'drv-01', vehicleId: 'veh-01', mobile: '+91 98310 98765', createdAt: '2026-10-26T16:00:00.000Z', notes: 'Advance received via UPI. Innova Crysta & Pemba Sherpa assigned.' },
  { id: 'book-02', bookingNo: 'VT-BK-002', quotationId: '', enquiryId: 'enq-04', clientName: 'Amit Verma', clientType: 'tourist', vehicle: 'Scorpio / Bolero', pickup: 'Siliguri Junction', destination: 'Gangtok Round Trip', startDate: '2026-10-30', endDate: '2026-11-02', status: 'confirmed', amount: 14000, advance: 4200, driverId: 'drv-02', vehicleId: 'veh-02', mobile: '+91 99001 12233', createdAt: '2026-10-27T17:00:00.000Z', notes: 'Confirmed directly. Assigned Rajesh Thapa.' }
];

const sampleInvoices = [
  {
    id: 'inv-01',
    invoiceNo: 'VT/INV/2026/001',
    bookingId: 'book-01',
    quotationId: 'quot-01',
    clientName: 'Dr. Ananya Sen',
    clientEmail: 'ananya.sen@example.com',
    clientMobile: '+91 98310 98765',
    billingAddress: 'Ballygunge Circular Road, Kolkata, West Bengal 700019',
    clientState: 'West Bengal',
    supplyType: 'Intra-State',
    paymentTerms: '30% Advance, 70% before trip start',
    travellers: '2 Adults',
    date: '2026-10-26',
    issueDate: '2026-10-26',
    dueDate: '2026-11-04',
    items: [
      { id: 'item-01', description: 'Tour Transportation: Darjeeling & Mirik Explorer (Innova Crysta - 4 Days)', serviceDetails: 'Pickup NJP, Tiger Hill sunrise, Mirik Lake excursion & IXB departure', dateFrom: '2026-11-04', dateTo: '2026-11-07', vehicles: 'Innova Crysta (WB-74-AX-1008)', hsnSac: '998552', quantity: 4, rate: 4404.76, taxableAmount: 17619.05, amount: 17619.05 }
    ],
    subtotal: 17619.05,
    gstPercent: 5,
    cgst: 440.48,
    sgst: 440.48,
    igst: 0,
    gstAmount: 880.95,
    roundOff: 0.0,
    totalAmount: 18500,
    hasGst: true,
    paidAmount: 5550,
    advanceReceived: 5550,
    balanceAmount: 12950,
    status: 'partially-paid',
    notes: '30% Advance received with thanks. Balance payable at vehicle start.',
    terms: '1. AC will be switched off on hill ascents as per regional hill transport regulations.\n2. Toll, parking, and state permits are inclusive in this invoice.\n3. Bank Transfer / UPI to Viyonka Travels official accounts only.',
    placeOfIssue: 'Siliguri, West Bengal',
    signatoryName: 'Authorized Signatory - Viyonka Travels'
  }
];

const sampleReceipts = [
  {
    id: 'rec-01',
    receiptNo: 'VT/REC/2026/001',
    invoiceId: 'inv-01',
    bookingId: 'book-01',
    quotationNo: 'VT/26-27/001',
    clientName: 'Dr. Ananya Sen',
    clientMobile: '+91 98310 98765',
    date: '2026-10-26',
    paymentDate: '2026-10-26',
    amount: 5550,
    paymentMethod: 'UPI',
    method: 'UPI',
    referenceNo: 'UPI/629910488219/HDFC',
    receiptType: 'Confirmation cum Advance Receipt',
    destination: 'Darjeeling (3N / 4D)',
    travelStart: '2026-11-04',
    travelEnd: '2026-11-07',
    grandTotal: 18500,
    advancePercent: 30,
    advanceAmount: 5550,
    receivedAmount: 5550,
    receivedBy: 'Viyonka Travels Desk',
    notes: 'Received advance token of ₹5,550 via UPI for booking VT-BK-001 (Innova Crysta). Balance of ₹12,950 due on travel start date.',
    remarks: 'Booking confirmed. Driver contact will be shared 12 hours before arrival.'
  }
];

async function seed() {
  console.log('Seeding Viyonka Travels data into Cloud Firestore...');
  for (const v of sampleVehicles) await setDoc(doc(db, 'vehicles', v.id), v);
  for (const d of sampleDrivers) await setDoc(doc(db, 'drivers', d.id), d);
  for (const c of sampleCorporateClients) await setDoc(doc(db, 'corporate_clients', c.id), c);
  for (const e of sampleEnquiries) await setDoc(doc(db, 'enquiries', e.id), e);
  for (const q of sampleQuotations) await setDoc(doc(db, 'quotations', q.id), q);
  for (const b of sampleBookings) await setDoc(doc(db, 'bookings', b.id), b);
  for (const i of sampleInvoices) await setDoc(doc(db, 'invoices', i.id), i);
  for (const r of sampleReceipts) await setDoc(doc(db, 'receipts', r.id), r);
  console.log('✅ Successfully seeded all sample collections to Firestore!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error seeding to Firestore:', err);
  process.exit(1);
});
