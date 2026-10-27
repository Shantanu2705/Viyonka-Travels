'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentNo?: string;
  children: React.ReactNode;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  documentNo,
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Interactive Modal Preview */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 no-print">
        <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {documentNo && (
                <p className="text-xs font-mono font-semibold text-[#0284c7]">{documentNo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold h-9 px-4 rounded-xl shadow-xs"
              >
                <Printer className="mr-1.5 h-4 w-4" /> Print / Save as PDF
              </Button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Document Sheet View */}
          <div className="flex-1 overflow-y-auto bg-slate-100/70 p-6 sm:p-10">
            <div className="mx-auto max-w-[210mm] bg-white p-8 sm:p-12 shadow-md rounded-xl border border-slate-200/80 min-h-[297mm]">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Global Print Portal for Clean Print to Paper / PDF */}
      {mounted &&
        createPortal(
          <div id="global-print-area" className="hidden print:block print:w-full print:p-8 bg-white text-black">
            {children}
          </div>,
          document.body
        )}
    </>
  );
};
