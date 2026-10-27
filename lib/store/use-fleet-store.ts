import { create } from 'zustand';
import {
  Vehicle,
  Driver,
  CorporateClient,
  Enquiry,
  Booking,
  Quotation,
  Invoice,
  Receipt,
  CompanySettings,
  ItineraryTemplate,
} from '@/types';
import { ViyonkaDatabase, initialViyonkaSettings } from '@/services/db';

interface FleetState {
  vehicles: Vehicle[];
  drivers: Driver[];
  corporateClients: CorporateClient[];
  enquiries: Enquiry[];
  bookings: Booking[];
  quotations: Quotation[];
  invoices: Invoice[];
  receipts: Receipt[];
  itineraryTemplates: ItineraryTemplate[];
  settings: CompanySettings;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  fetchAll: () => Promise<void>;

  // Vehicles CRUD
  addVehicle: (v: Vehicle) => Promise<void>;
  updateVehicle: (v: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Drivers CRUD
  addDriver: (d: Driver) => Promise<void>;
  updateDriver: (d: Driver) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;

  // Corporate Clients CRUD
  addClient: (c: CorporateClient) => Promise<void>;
  updateClient: (c: CorporateClient) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Enquiries CRUD
  addEnquiry: (e: Enquiry) => Promise<void>;
  updateEnquiry: (e: Enquiry) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;

  // Bookings CRUD
  addBooking: (b: Booking) => Promise<void>;
  updateBooking: (b: Booking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  // Quotations CRUD
  addQuotation: (q: Quotation) => Promise<void>;
  updateQuotation: (q: Quotation) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;

  // Invoices & Receipts CRUD
  addInvoice: (i: Invoice) => Promise<void>;
  updateInvoice: (i: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addReceipt: (r: Receipt) => Promise<void>;
  updateReceipt: (r: Receipt) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;

  // Settings
  updateSettings: (s: Partial<CompanySettings>) => Promise<void>;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  drivers: [],
  corporateClients: [],
  enquiries: [],
  bookings: [],
  quotations: [],
  invoices: [],
  receipts: [],
  itineraryTemplates: [],
  settings: initialViyonkaSettings,
  isLoading: true,
  isInitialized: false,

  fetchAll: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const [
        vehicles,
        drivers,
        corporateClients,
        enquiries,
        bookings,
        quotations,
        invoices,
        receipts,
        itineraryTemplates,
        settings,
      ] = await Promise.all([
        ViyonkaDatabase.getVehicles(),
        ViyonkaDatabase.getDrivers(),
        ViyonkaDatabase.getCorporateClients(),
        ViyonkaDatabase.getEnquiries(),
        ViyonkaDatabase.getBookings(),
        ViyonkaDatabase.getQuotations(),
        ViyonkaDatabase.getInvoices(),
        ViyonkaDatabase.getReceipts(),
        ViyonkaDatabase.getItineraryTemplates(),
        ViyonkaDatabase.getSettings(),
      ]);

      set({
        vehicles,
        drivers,
        corporateClients,
        enquiries,
        bookings,
        quotations,
        invoices,
        receipts,
        itineraryTemplates,
        settings: settings || initialViyonkaSettings,
        isLoading: false,
        isInitialized: true,
      });
    } catch (e) {
      console.error('Failed to load Viyonka fleet store data:', e);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Vehicles
  addVehicle: async (v) => {
    await ViyonkaDatabase.saveVehicle(v);
    set((s) => ({ vehicles: [...s.vehicles, v] }));
  },
  updateVehicle: async (v) => {
    await ViyonkaDatabase.saveVehicle(v);
    set((s) => ({ vehicles: s.vehicles.map((item) => (item.id === v.id ? v : item)) }));
  },
  deleteVehicle: async (id) => {
    await ViyonkaDatabase.deleteVehicle(id);
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
  },

  // Drivers
  addDriver: async (d) => {
    await ViyonkaDatabase.saveDriver(d);
    set((s) => ({ drivers: [...s.drivers, d] }));
  },
  updateDriver: async (d) => {
    await ViyonkaDatabase.saveDriver(d);
    set((s) => ({ drivers: s.drivers.map((item) => (item.id === d.id ? d : item)) }));
  },
  deleteDriver: async (id) => {
    await ViyonkaDatabase.deleteDriver(id);
    set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) }));
  },

  // Corporate Clients
  addClient: async (c) => {
    await ViyonkaDatabase.saveCorporateClient(c);
    set((s) => ({ corporateClients: [...s.corporateClients, c] }));
  },
  updateClient: async (c) => {
    await ViyonkaDatabase.saveCorporateClient(c);
    set((s) => ({ corporateClients: s.corporateClients.map((item) => (item.id === c.id ? c : item)) }));
  },
  deleteClient: async (id) => {
    await ViyonkaDatabase.deleteCorporateClient(id);
    set((s) => ({ corporateClients: s.corporateClients.filter((c) => c.id !== id) }));
  },

  // Enquiries
  addEnquiry: async (e) => {
    await ViyonkaDatabase.saveEnquiry(e);
    set((s) => ({ enquiries: [e, ...s.enquiries] }));
  },
  updateEnquiry: async (e) => {
    await ViyonkaDatabase.saveEnquiry(e);
    set((s) => ({ enquiries: s.enquiries.map((item) => (item.id === e.id ? e : item)) }));
  },
  deleteEnquiry: async (id) => {
    await ViyonkaDatabase.deleteEnquiry(id);
    set((s) => ({ enquiries: s.enquiries.filter((e) => e.id !== id) }));
  },

  // Bookings
  addBooking: async (b) => {
    await ViyonkaDatabase.saveBooking(b);
    set((s) => ({ bookings: [b, ...s.bookings] }));
  },
  updateBooking: async (b) => {
    await ViyonkaDatabase.saveBooking(b);
    set((s) => ({ bookings: s.bookings.map((item) => (item.id === b.id ? b : item)) }));
  },
  deleteBooking: async (id) => {
    await ViyonkaDatabase.deleteBooking(id);
    set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) }));
  },

  // Quotations
  addQuotation: async (q) => {
    await ViyonkaDatabase.saveQuotation(q);
    set((s) => ({ quotations: [q, ...s.quotations] }));
  },
  updateQuotation: async (q) => {
    await ViyonkaDatabase.saveQuotation(q);
    set((s) => ({ quotations: s.quotations.map((item) => (item.id === q.id ? q : item)) }));
  },
  deleteQuotation: async (id) => {
    await ViyonkaDatabase.deleteQuotation(id);
    set((s) => ({ quotations: s.quotations.filter((q) => q.id !== id) }));
  },

  // Invoices & Receipts
  addInvoice: async (i) => {
    await ViyonkaDatabase.saveInvoice(i);
    set((s) => ({ invoices: [i, ...s.invoices] }));
  },
  updateInvoice: async (i) => {
    await ViyonkaDatabase.saveInvoice(i);
    set((s) => ({ invoices: s.invoices.map((item) => (item.id === i.id ? i : item)) }));
  },
  deleteInvoice: async (id) => {
    await ViyonkaDatabase.deleteInvoice(id);
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
  },
  addReceipt: async (r) => {
    await ViyonkaDatabase.saveReceipt(r);
    set((s) => ({ receipts: [r, ...s.receipts] }));
  },
  updateReceipt: async (r) => {
    await ViyonkaDatabase.saveReceipt(r);
    set((s) => ({ receipts: s.receipts.map((item) => (item.id === r.id ? r : item)) }));
  },
  deleteReceipt: async (id) => {
    await ViyonkaDatabase.deleteReceipt(id);
    set((s) => ({ receipts: s.receipts.filter((r) => r.id !== id) }));
  },

  // Settings
  updateSettings: async (settings) => {
    await ViyonkaDatabase.updateSettings(settings);
    set((s) => ({ settings: { ...s.settings, ...settings } }));
  },
}));
