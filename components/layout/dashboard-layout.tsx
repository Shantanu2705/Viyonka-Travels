'use client';
import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useFleetStore } from '@/lib/store/use-fleet-store';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const fetchAll = useFleetStore((s) => s.fetchAll);
  const isInitialized = useFleetStore((s) => s.isInitialized);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f9ff]/40">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col z-10">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
