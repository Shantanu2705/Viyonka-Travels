'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, FileText, Phone, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/lib/store/use-fleet-store';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const [timeStr, setTimeStr] = useState('');
  const [seeding, setSeeding] = useState(false);
  const seedSampleData = useFleetStore((s) => s.seedSampleData);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }) + ' · ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleData();
      alert('✅ Sample data successfully loaded and synced with Cloud Firestore!');
    } catch {
      alert('Sample data loaded into local cache.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock className="h-3.5 w-3.5 text-[#0284c7]" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Middle Support Banner */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-sky-50/70 border border-sky-100/80 px-3 py-1.5 rounded-full">
        <Phone className="h-3.5 w-3.5 text-[#0284c7]" />
        <span>Hotline: 78119 94008 | 97343 24008 | 92423 04008</span>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        <Button
          size="sm"
          variant="outline"
          onClick={handleSeed}
          disabled={seeding}
          className="hidden xl:inline-flex text-xs font-bold border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 rounded-xl h-9 px-3"
          title="Click to populate sample travel records"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
          {seeding ? 'Syncing...' : 'Load Sample Data'}
        </Button>
        <Link href="/enquiries">
          <Button size="sm" className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold h-9 px-3.5 rounded-xl shadow-xs">
            <PlusCircle className="mr-1.5 h-4 w-4" /> New Enquiry
          </Button>
        </Link>
        <Link href="/quotations/new">
          <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 font-bold h-9 px-3.5 rounded-xl text-slate-800">
            <FileText className="mr-1.5 h-4 w-4 text-[#f05438]" /> Smart Quote
          </Button>
        </Link>
      </div>
    </header>
  );
};
