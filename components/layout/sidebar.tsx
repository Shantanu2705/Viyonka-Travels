'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/button';
import { useFleetStore } from '@/lib/store/use-fleet-store';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquareQuote,
  FileText,
  Receipt,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC<{ className?: string; onCloseMobile?: () => void }> = ({
  className,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { enquiries, quotations, bookings } = useFleetStore();

  const newEnquiriesCount = enquiries.filter(e => e.status === 'new' || e.status === 'follow-up').length;
  const activeQuotesCount = quotations.filter(q => q.status === 'confirmed').length;

  const navItems = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Calendar', href: '/calendar', icon: CalendarCheck },
    { 
      title: 'Enquiry', 
      href: '/enquiries', 
      icon: MessageSquareQuote, 
      badge: newEnquiriesCount > 0 ? String(newEnquiriesCount) : undefined,
      badgeColor: 'bg-[#f05438] text-white'
    },
    { 
      title: 'Quotation', 
      href: '/quotations', 
      icon: FileText,
      badge: activeQuotesCount > 0 ? `${activeQuotesCount} Active` : undefined,
      badgeColor: 'bg-[#0284c7] text-white'
    },
    { title: 'Billing', href: '/billing', icon: Receipt },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-white shadow-xl no-print select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center border-b border-slate-800/80 bg-white px-5 py-5 z-10 shadow-xs">
        <Link href="/" className="flex flex-col items-center text-center group w-full" onClick={onCloseMobile}>
          <img
            src="/logo.jpeg"
            alt="Viyonka Travels Logo"
            className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <MapPin className="h-3 w-3 text-[#f05438]" /> Siliguri, West Bengal
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
          Operations & Quoting
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-[#0284c7] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#38bdf8]'
                  )}
                />
                <span>{item.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Quick Action */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/60">
        <Link href="/quotations/new">
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] py-2 px-3 text-xs font-bold text-white shadow-sm transition-all cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" /> Create New Quote
          </button>
        </Link>
        <div className="mt-3 flex items-center gap-2.5 pt-2 border-t border-slate-800/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f05438] text-white font-bold text-xs uppercase shadow-xs">
            V
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-xs font-bold text-slate-200">Viyonka Operator</span>
            <span className="truncate text-[10px] text-slate-400">Siliguri Desk</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
