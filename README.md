# Viyonka Travels — Travel Quotation & Operations Software

A modern Next.js 15 travel operations & quotation management web application built for **Viyonka Travels** (Siliguri, West Bengal).

![Viyonka Travels Logo](public/logo.jpeg)

---

## Features

- **Dashboard**: Live operational KPIs, active enquiries, confirmed bookings, billed revenue, and upcoming departures.
- **Interactive Calendar**: Day, Week, and Month scheduling grid visualizing travel schedules and driver/vehicle assignments.
- **Enquiries Pipeline**: Lead management system with automated serials (`VT-PKG-...`, `VT-TR-...`, `VT-B2B-...`) and 1-click **Convert to Quotation**.
- **Smart Quotation Builder**:
  - Day-wise itinerary planner.
  - Multi-vehicle fleet pricing & driver allowance calculations.
  - 5% GST toggle (Intra-state CGST/SGST vs Inter-state IGST).
  - Advance deposit % configuration.
  - Print-ready branded PDF generator.
- **Billing Suite**:
  - GST Tax Invoices (SAC 998552) with company bank & UPI details.
  - Advance & Final Money Receipts with Indian currency converter in words (Lakhs & Crores).
- **Cloud Firebase Firestore Integration**: Real-time cloud persistence with offline resilience fallback.

---

## Contact Details (Viyonka Travels)

- **Hotlines:** `+91 78119 94008 | 97343 24008 | 92423 04008`
- **Email:** `info@viyankatravels.com` / `bookings@viyankatravels.com`
- **Website:** [www.viyankatravels.com](https://www.viyankatravels.com)
- **Base:** Siliguri, West Bengal, India

---

## Deployment on Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
3. Click **Deploy**.

---

## Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.
