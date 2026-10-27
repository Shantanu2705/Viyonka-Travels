import {
  Vehicle,
  Driver,
  CorporateClient,
  Enquiry,
  Booking,
  Quotation,
  CompanySettings,
  Invoice,
  Receipt,
  ItineraryTemplate,
} from '@/types';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';

// Default Viyonka Travels Company Settings
export const initialViyonkaSettings: CompanySettings = {
  companyName: 'Viyonka Travels',
  tagline: 'Go Find Explore',
  logoUrl: '/logo.jpeg',
  gstPercent: 5,
  invoicePrefix: 'VT',
  terms: '1. 30% advance payment required upon booking confirmation.\n2. Remaining balance to be cleared prior to or at the start of travel.\n3. AC will remain switched off during uphill / ghat section drives as per hill regulations.\n4. Any changes to the itinerary during transit are subject to vehicle availability and tariff differences.',
  termsAndConditions: '1. 30% advance payment required upon booking confirmation.\n2. Remaining balance to be cleared prior to or at the start of travel.\n3. AC will remain switched off during uphill / ghat section drives as per hill regulations.\n4. Any changes to the itinerary during transit are subject to vehicle availability and tariff differences.',
  supportEmail: 'bookings@viyankatravels.com',
  email: 'info@viyankatravels.com',
  phone: '+91 78119 94008 / 97343 24008 / 92423 04008',
  whatsappNumber: '+91 78119 94008',
  website: 'www.viyankatravels.com',
  bankName: 'HDFC Bank',
  accountName: 'Viyonka Travels',
  accountNumber: '502000XXXXXXXX',
  ifsc: 'HDFC0001234',
  branch: 'Siliguri Branch',
  upiId: 'viyonkatravels@upi',
  companyGstin: '19AAACV1234F1Z5',
  gstin: '19AAACV1234F1Z5',
  companyState: 'West Bengal',
  companyAddress: 'Siliguri, West Bengal',
  address: 'Siliguri, West Bengal',
  cancellationPolicy: '1. Cancellations made 7+ days prior to travel: 80% refund of advance.\n2. Cancellations made within 48-72 hours: 50% refund.\n3. Cancellations made under 48 hours: Non-refundable.',
  signatoryName: 'Authorized Signatory',
};

// Generic Local Storage Synchronizer
const getLocalData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(`viyonka-db-${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`viyonka-db-${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local cache:', e);
  }
};

// Remove undefined values for Firestore serialization
const cleanForFirestore = <T extends Record<string, any>>(data: T): Record<string, any> => {
  return JSON.parse(JSON.stringify(data));
};

export class ViyonkaDatabase {
  // --- VEHICLES ---
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const snap = await getDocs(collection(db, 'vehicles'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
        setLocalData('vehicles', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline or rules locked; using local vehicle cache.', e);
    }
    return getLocalData<Vehicle[]>('vehicles', []);
  }

  static async saveVehicle(vehicle: Vehicle): Promise<void> {
    const list = (await this.getVehicles()).filter((v) => v.id !== vehicle.id);
    list.push(vehicle);
    setLocalData('vehicles', list);

    try {
      await setDoc(doc(db, 'vehicles', vehicle.id), cleanForFirestore(vehicle));
    } catch (e) {
      console.warn('Could not sync vehicle to Firestore (check security rules):', e);
    }
  }

  static async deleteVehicle(id: string): Promise<void> {
    const list = (await this.getVehicles()).filter((v) => v.id !== id);
    setLocalData('vehicles', list);

    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (e) {
      console.warn('Could not delete vehicle in Firestore:', e);
    }
  }

  // --- DRIVERS ---
  static async getDrivers(): Promise<Driver[]> {
    try {
      const snap = await getDocs(collection(db, 'drivers'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver));
        setLocalData('drivers', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local driver cache.', e);
    }
    return getLocalData<Driver[]>('drivers', []);
  }

  static async saveDriver(driver: Driver): Promise<void> {
    const list = (await this.getDrivers()).filter((d) => d.id !== driver.id);
    list.push(driver);
    setLocalData('drivers', list);

    try {
      await setDoc(doc(db, 'drivers', driver.id), cleanForFirestore(driver));
    } catch (e) {
      console.warn('Could not sync driver to Firestore:', e);
    }
  }

  static async deleteDriver(id: string): Promise<void> {
    const list = (await this.getDrivers()).filter((d) => d.id !== id);
    setLocalData('drivers', list);

    try {
      await deleteDoc(doc(db, 'drivers', id));
    } catch (e) {
      console.warn('Could not delete driver in Firestore:', e);
    }
  }

  // --- CORPORATE CLIENTS ---
  static async getCorporateClients(): Promise<CorporateClient[]> {
    try {
      const snap = await getDocs(collection(db, 'corporate_clients'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CorporateClient));
        setLocalData('corporate-clients', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local corporate clients cache.', e);
    }
    return getLocalData<CorporateClient[]>('corporate-clients', []);
  }

  static async saveCorporateClient(client: CorporateClient): Promise<void> {
    const list = (await this.getCorporateClients()).filter((c) => c.id !== client.id);
    list.push(client);
    setLocalData('corporate-clients', list);

    try {
      await setDoc(doc(db, 'corporate_clients', client.id), cleanForFirestore(client));
    } catch (e) {
      console.warn('Could not sync corporate client to Firestore:', e);
    }
  }

  static async deleteCorporateClient(id: string): Promise<void> {
    const list = (await this.getCorporateClients()).filter((c) => c.id !== id);
    setLocalData('corporate-clients', list);

    try {
      await deleteDoc(doc(db, 'corporate_clients', id));
    } catch (e) {
      console.warn('Could not delete corporate client in Firestore:', e);
    }
  }

  // --- ENQUIRIES ---
  static async getEnquiries(): Promise<Enquiry[]> {
    try {
      const snap = await getDocs(collection(db, 'enquiries'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry));
        setLocalData('enquiries', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local enquiries cache.', e);
    }
    return getLocalData<Enquiry[]>('enquiries', []);
  }

  static async saveEnquiry(enquiry: Enquiry): Promise<void> {
    const list = (await this.getEnquiries()).filter((e) => e.id !== enquiry.id);
    list.unshift(enquiry);
    setLocalData('enquiries', list);

    try {
      await setDoc(doc(db, 'enquiries', enquiry.id), cleanForFirestore(enquiry));
    } catch (e) {
      console.warn('Could not sync enquiry to Firestore:', e);
    }
  }

  static async deleteEnquiry(id: string): Promise<void> {
    const list = (await this.getEnquiries()).filter((e) => e.id !== id);
    setLocalData('enquiries', list);

    try {
      await deleteDoc(doc(db, 'enquiries', id));
    } catch (e) {
      console.warn('Could not delete enquiry in Firestore:', e);
    }
  }

  // --- BOOKINGS ---
  static async getBookings(): Promise<Booking[]> {
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        setLocalData('bookings', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local bookings cache.', e);
    }
    return getLocalData<Booking[]>('bookings', []);
  }

  static async saveBooking(booking: Booking): Promise<void> {
    const list = (await this.getBookings()).filter((b) => b.id !== booking.id);
    list.unshift(booking);
    setLocalData('bookings', list);

    try {
      await setDoc(doc(db, 'bookings', booking.id), cleanForFirestore(booking));
    } catch (e) {
      console.warn('Could not sync booking to Firestore:', e);
    }
  }

  static async deleteBooking(id: string): Promise<void> {
    const list = (await this.getBookings()).filter((b) => b.id !== id);
    setLocalData('bookings', list);

    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (e) {
      console.warn('Could not delete booking in Firestore:', e);
    }
  }

  // --- QUOTATIONS ---
  static async getQuotations(): Promise<Quotation[]> {
    try {
      const snap = await getDocs(collection(db, 'quotations'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quotation));
        setLocalData('quotations', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local quotations cache.', e);
    }
    return getLocalData<Quotation[]>('quotations', []);
  }

  static async saveQuotation(quotation: Quotation): Promise<void> {
    const list = (await this.getQuotations()).filter((q) => q.id !== quotation.id);
    list.unshift(quotation);
    setLocalData('quotations', list);

    try {
      await setDoc(doc(db, 'quotations', quotation.id), cleanForFirestore(quotation));
    } catch (e) {
      console.warn('Could not sync quotation to Firestore:', e);
    }
  }

  static async deleteQuotation(id: string): Promise<void> {
    const list = (await this.getQuotations()).filter((q) => q.id !== id);
    setLocalData('quotations', list);

    try {
      await deleteDoc(doc(db, 'quotations', id));
    } catch (e) {
      console.warn('Could not delete quotation in Firestore:', e);
    }
  }

  // --- INVOICES ---
  static async getInvoices(): Promise<Invoice[]> {
    try {
      const snap = await getDocs(collection(db, 'invoices'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
        setLocalData('invoices', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local invoices cache.', e);
    }
    return getLocalData<Invoice[]>('invoices', []);
  }

  static async saveInvoice(invoice: Invoice): Promise<void> {
    const list = (await this.getInvoices()).filter((i) => i.id !== invoice.id);
    list.unshift(invoice);
    setLocalData('invoices', list);

    try {
      await setDoc(doc(db, 'invoices', invoice.id), cleanForFirestore(invoice));
    } catch (e) {
      console.warn('Could not sync invoice to Firestore:', e);
    }
  }

  static async deleteInvoice(id: string): Promise<void> {
    const list = (await this.getInvoices()).filter((i) => i.id !== id);
    setLocalData('invoices', list);

    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      console.warn('Could not delete invoice in Firestore:', e);
    }
  }

  // --- RECEIPTS ---
  static async getReceipts(): Promise<Receipt[]> {
    try {
      const snap = await getDocs(collection(db, 'receipts'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Receipt));
        setLocalData('receipts', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local receipts cache.', e);
    }
    return getLocalData<Receipt[]>('receipts', []);
  }

  static async saveReceipt(receipt: Receipt): Promise<void> {
    const list = (await this.getReceipts()).filter((r) => r.id !== receipt.id);
    list.unshift(receipt);
    setLocalData('receipts', list);

    try {
      await setDoc(doc(db, 'receipts', receipt.id), cleanForFirestore(receipt));
    } catch (e) {
      console.warn('Could not sync receipt to Firestore:', e);
    }
  }

  static async deleteReceipt(id: string): Promise<void> {
    const list = (await this.getReceipts()).filter((r) => r.id !== id);
    setLocalData('receipts', list);

    try {
      await deleteDoc(doc(db, 'receipts', id));
    } catch (e) {
      console.warn('Could not delete receipt in Firestore:', e);
    }
  }

  // --- ITINERARY TEMPLATES ---
  static async getItineraryTemplates(): Promise<ItineraryTemplate[]> {
    const defaults: ItineraryTemplate[] = [
      {
        id: 'darjeeling-gangtok-4n5d',
        name: 'Darjeeling & Gangtok Highlight (4N / 5D)',
        days: 5,
        itinerary: [
          { day: 1, title: 'Arrival at NJP / IXB to Gangtok', desc: 'Pickup from NJP Railway Station or Bagdogra Airport (IXB). Scenic drive along Teesta river to Gangtok. Hotel check-in and evening leisure at MG Marg.' },
          { day: 2, title: 'Gangtok to Tsomgo Lake & Baba Mandir', desc: 'Excursion to the pristine Tsomgo (Changu) Lake and historic Baba Harbhajan Singh Mandir. Optional permit for Nathula Pass. Evening return to Gangtok.' },
          { day: 3, title: 'Gangtok to Darjeeling via Lamahatta', desc: 'Drive from Gangtok to Darjeeling Queen of Hills. En-route stop at Lamahatta Eco Park and Lovers Meet Viewpoint. Evening sunset view at Mall Road.' },
          { day: 4, title: 'Darjeeling Early Morning & 7 Points Sightseeing', desc: 'Early morning 4:00 AM visit to Tiger Hill for Kanchenjunga sunrise. Batasia Loop, Ghoom Monastery, Himalayan Mountaineering Institute, and Happy Valley Tea Estate.' },
          { day: 5, title: 'Darjeeling to IXB / NJP Departure', desc: 'Breakfast and checkout. Transfer to Bagdogra Airport (IXB) or NJP Railway Station for onward journey with fond memories.' },
        ],
      },
      {
        id: 'north-sikkim-3n4d',
        name: 'Exotic North Sikkim - Lachen & Lachung (3N / 4D)',
        days: 4,
        itinerary: [
          { day: 1, title: 'Gangtok to Lachen', desc: 'Drive from Gangtok to Lachen. En-route sightseeing at Seven Sister Waterfalls, Singhik Viewpoint, and Chungthang confluence. Night stay at Lachen.' },
          { day: 2, title: 'Lachen to Gurudongmar Lake to Lachung', desc: 'Early morning drive to the sacred Gurudongmar Lake (17,800 ft). Return to Lachen for lunch and transfer to Lachung.' },
          { day: 3, title: 'Lachung to Yumthang Valley & Zero Point', desc: 'Visit the Valley of Flowers at Yumthang and optional drive to Zero Point (Yumesamdong). Hot spring visit. Drive back to Gangtok in the evening.' },
          { day: 4, title: 'Gangtok Departure', desc: 'Checkout and departure to NJP / IXB with unforgettable Himalayan memories.' },
        ],
      },
    ];

    try {
      const snap = await getDocs(collection(db, 'itinerary_templates'));
      if (!snap.empty) {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryTemplate));
        setLocalData('itinerary-templates', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local itinerary templates.', e);
    }
    return getLocalData<ItineraryTemplate[]>('itinerary-templates', defaults);
  }

  // --- SETTINGS ---
  static async getSettings(): Promise<CompanySettings> {
    try {
      const snap = await getDoc(doc(db, 'company_settings', 'main'));
      if (snap.exists()) {
        const remote = snap.data() as CompanySettings;
        setLocalData('company-settings', remote);
        return remote;
      }
    } catch (e) {
      console.warn('Firestore offline; using local settings cache.', e);
    }
    return getLocalData<CompanySettings>('company-settings', initialViyonkaSettings);
  }

  static async updateSettings(settings: Partial<CompanySettings>): Promise<void> {
    const curr = await this.getSettings();
    const updated = { ...curr, ...settings };
    setLocalData('company-settings', updated);

    try {
      await setDoc(doc(db, 'company_settings', 'main'), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Could not sync settings to Firestore:', e);
    }
  }
}
