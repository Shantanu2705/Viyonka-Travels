import React from 'react';
import { cn } from '@/components/ui/button';

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'draft', className }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (norm === 'new' || norm === 'draft') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200';
    dot = 'bg-sky-500';
  } else if (norm === 'confirmed' || norm === 'paid' || norm === 'active') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (norm === 'follow-up' || norm === 'pending' || norm === 'partially-paid') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (norm === 'quotation-sent' || norm === 'sent') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  } else if (norm === 'cancelled' || norm === 'overdue' || norm === 'rejected') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize tracking-wide',
        styles,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {norm.replace(/-/g, ' ')}
    </span>
  );
};
