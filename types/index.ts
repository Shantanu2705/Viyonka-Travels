export type Role = 'admin' | 'manager' | 'operator' | string;
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
}

export type VehicleCategory =
  | 'Sedan - Swift Dzire'
  | 'WagonR'
  | 'Innova / Xylo'
  | 'Innova Crysta'
  | '11 Seater Tempo Traveller'
  | '14 Seater Tempo Traveller'
  | '17 Seater Tempo Traveller'
  | '22 Seater AC Premium Bus'
  | '26 Seater AC Premium Bus'
  | 'Urbania - 16 Seater'
  | 'Scorpio / Bolero'
  | 'SUV'
  | 'Creta'
  | string;

export type VehicleType = VehicleCategory;
export type VehicleStatus = 'active' | 'maintenance' | 'inactive' | string;

export interface Vehicle {
  id: string;
  category?: VehicleCategory;
  type?: VehicleCategory;
  name: string;
  registration?: string;
  regNo?: string;
  seatingCapacity: number;
  driverName?: string;
  driverMobile?: string;
  fuelType?: 'Diesel' | 'Petrol' | 'EV' | 'Hybrid' | string;
  status?: VehicleStatus;
  imageUrl?: string;
  permitExpiry?: string;
  insuranceExpiry?: string;
  createdAt?: string;
}

export type DriverStatus = 'active' | 'on-leave' | 'inactive' | string;

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  license?: string;
  licenseNo?: string;
  badgeNo?: string;
  licenseExpiry?: string;
  assignedVehicleId?: string;
  salary?: number;
  status?: DriverStatus;
  avatarUrl?: string;
  createdAt?: string;
}

export interface CorporateClient {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email?: string;
  gst?: string;
  gstin?: string;
  billingAddress?: string;
  contractPricing?: string;
  contractRate?: number;
  discountPercent?: number;
  billingCycle?: string;
  status?: string;
  logoUrl?: string;
  createdAt?: string;
}

export type ClientType = 'tourist' | 'corporate' | 'b2b' | 'B2C' | 'B2B' | 'Corporate' | string;
export type EnquiryType = ClientType;
export type QuotationType = ClientType;
export type EnquiryStatus = 'new' | 'follow-up' | 'quotation-sent' | 'confirmed' | 'cancelled' | string;

export interface Enquiry {
  id: string;
  enquiryNo?: string;
  customerName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  clientType?: ClientType;
  type?: ClientType;
  pickupLocation: string;
  destination: string;
  startDate: string;
  endDate?: string;
  days: number;
  passengers: number;
  ticketRequired?: boolean;
  hotelRequired?: boolean;
  hotelType?: 'With Hotel' | 'Without Hotel' | string;
  vehicle: VehicleCategory | string;
  places?: string;
  specialRequirements?: string;
  internalNotes?: string;
  customerRemarks?: string;
  notes?: string;
  status?: EnquiryStatus;
  createdAt?: string;
}

export type QuotationStatus = 'draft' | 'Draft' | 'sent' | 'Sent' | 'confirmed' | 'Confirmed' | 'cancelled' | 'Cancelled' | string;

export interface ItineraryItem {
  id?: string;
  day?: number;
  title: string;
  desc?: string;
  description?: string;
  heading?: string;
}

export interface QuotationVehicle {
  id: string;
  vehicle: string;
  qty: number;
  days: number;
  rate: number;
  packagePrice?: string;
  total: number;
  tbd1?: string;
  tbd2?: string;
  driverDetails?: string;
}

export interface QuotationRateCard {
  perKm?: number;
  perHour?: number;
  extraKm?: number;
  extraHour?: number;
  driverAllowance?: number;
  nightCharge?: number;
  toll?: number;
  parking?: number;
  gst?: number;
  additional?: number;
  perDay?: number;
  packagePrice?: number;
  permits?: number;
  extraVehicle?: number;
}

export interface Quotation {
  id: string;
  quotationNo?: string;
  enquiryId?: string;
  customerName?: string;
  clientName: string;
  mobile?: string;
  clientPhone?: string;
  clientEmail?: string;
  companyName?: string;
  gstin?: string;
  pickupLocation: string;
  drop?: string;
  destination: string;
  vehicle?: string;
  startDate: string;
  endDate?: string;
  packageDuration?: string;
  travelDate?: string;
  date?: string;
  persons?: number | string;
  passengers: number;
  days?: number;
  clientType?: ClientType;
  type?: ClientType;
  qType?: string;
  itinerary?: ItineraryItem[];
  vehicles?: QuotationVehicle[];
  rateCard?: QuotationRateCard;
  baseAmount: number;
  subtotal?: number;
  gstPercent?: number;
  gstAmount: number;
  additionalCharges?: number;
  grandTotal?: number;
  totalAmount: number;
  advancePercent?: number;
  advanceAmount?: number;
  balance?: number;
  hasGst?: boolean;
  createdAt?: string;
  status: QuotationStatus;
  inclusions?: string[];
  exclusions?: string[];
  permits?: string[];
  extraSightseeing?: string[];
  additionalDetails?: string;
  pickupTiming?: string;
  dropTiming?: string;
  driverInstructions?: string;
  vehicleNotes?: string;
  additionalNotes?: string;
  remarks?: string;
  terms?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;

export interface Booking {
  id: string;
  bookingNo?: string;
  quotationId?: string;
  enquiryId?: string;
  clientName: string;
  clientType?: ClientType;
  vehicle?: VehicleCategory | string;
  pickup?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  status: BookingStatus;
  amount: number;
  advance?: number;
  driverId?: string;
  vehicleId?: string;
  mobile?: string;
  createdAt?: string;
  notes?: string;
  isQuotation?: boolean;
  originalQuotationId?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Debit Card' | 'Cheque' | string;
export type PaymentStatus = 'unpaid' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled' | string;
export type ReceiptType = 'Confirmation cum Advance Receipt' | 'Advance Receipt' | 'Full Payment Receipt' | 'Booking Confirmation' | string;

export interface InvoiceItem {
  id?: string;
  description?: string;
  serviceDetails?: string;
  dateFrom?: string;
  dateTo?: string;
  vehicles?: string;
  hsnSac?: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstPercent?: number;
  taxableAmount?: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  bookingId?: string;
  quotationId?: string;
  clientName: string;
  clientEmail?: string;
  clientMobile?: string;
  clientPhone?: string;
  billingAddress?: string;
  clientState?: string;
  supplyType?: string;
  clientGstin?: string;
  paymentTerms?: string;
  travellers?: string;
  date?: string;
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstPercent?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gstAmount: number;
  roundOff?: number;
  totalAmount: number;
  hasGst?: boolean;
  paidAmount: number;
  advanceReceived?: number;
  balanceAmount: number;
  status: PaymentStatus;
  notes?: string;
  terms?: string;
  disclaimerNote?: string;
  placeOfIssue?: string;
  signatoryName?: string;
  extraNote?: string;
  bankDetails?: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  invoiceId?: string;
  bookingId?: string;
  clientName: string;
  clientMobile?: string;
  date?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  referenceNo?: string;
  receiptType?: ReceiptType;
  notes?: string;
  quotationNo?: string;
  bookingReference?: string;
  destination?: string;
  travelStart?: string;
  travelEnd?: string;
  grandTotal?: number;
  advancePercent?: number;
  advanceAmount?: number;
  receivedAmount?: number;
  paymentDate?: string;
  receivedBy?: string;
  remarks?: string;
  receiptHeading?: string;
  businessHouse?: string;
  pax?: string;
  packageType?: string;
  vehicleDetails?: string;
  duty?: string;
  includes?: string;
  costingOverride?: string;
  advanceLineOverride?: string;
  stayDetails?: string;
  checkedByName?: string;
  designation?: string;
}

export interface RouteMaster {
  id: string;
  name?: string;
  pickup: string;
  destination: string;
  km?: number;
  distanceKm?: number;
  estHours?: number;
  durationHours?: number;
  toll?: number;
  parking?: number;
  notes?: string;
}

export interface DestinationMaster {
  id: string;
  name: string;
  state?: string;
  description?: string;
}

export interface PermitMaster {
  id: string;
  name: string;
  price: number;
  region: string;
}

export interface SightseeingMaster {
  id: string;
  name: string;
  price: number;
  destination: string;
  notes?: string;
}

export interface InclusionMaster {
  id: string;
  title: string;
}

export interface ExclusionMaster {
  id: string;
  title: string;
}

export interface ItineraryTemplate {
  id: string;
  name: string;
  days: number;
  itinerary: ItineraryItem[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'driver' | 'payment' | 'trip' | 'info' | string;
  read: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tagline?: string;
  logoUrl: string;
  gstPercent: number;
  invoicePrefix: string;
  terms: string;
  termsAndConditions: string;
  supportEmail: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  website: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  qrCodeUrl?: string;
  companyGstin: string;
  gstin: string;
  companyState: string;
  companyAddress: string;
  address: string;
  cancellationPolicy: string;
  signatoryName: string;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
}
