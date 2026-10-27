import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Viyonka Travels | Quotation & Travel Operations System',
  description: 'Smart quotation software, tour packages, calendar dispatch, enquiry lead management, and GST billing for Viyonka Travels, Siliguri, West Bengal.',
  icons: {
    icon: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-[#0284c7] selection:text-white">
        {children}
      </body>
    </html>
  );
}
