import { InvoiceItem, PaymentStatus } from '@/types';

export interface InvoiceCalculationResult {
  taxableAmount: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  balanceAmount: number;
  status: PaymentStatus;
}

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  supplyType: string = 'Intra-State (CGST + SGST)',
  applyGst: boolean = true,
  paidAmount: number = 0,
  roundOff: number = 0,
  currentStatus: PaymentStatus = 'unpaid'
): InvoiceCalculationResult => {
  let taxableAmount = 0;
  let totalGst = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPercent) || 0;
    const gstPercent = applyGst ? (Number(item.gstPercent) || 0) : 0;

    const lineBase = qty * rate;
    const lineTaxable = lineBase - (lineBase * (discount / 100));
    const lineGst = lineTaxable * (gstPercent / 100);

    taxableAmount += lineTaxable;
    totalGst += lineGst;
  });

  const isIntra = supplyType.includes('CGST') || supplyType.includes('Intra');
  const cgst = isIntra ? totalGst / 2 : 0;
  const sgst = isIntra ? totalGst / 2 : 0;
  const igst = !isIntra ? totalGst : 0;

  const grandTotal = Math.round(taxableAmount + totalGst + roundOff);
  const balanceAmount = Math.max(0, grandTotal - paidAmount);

  let status: PaymentStatus = currentStatus;
  if (currentStatus !== 'cancelled') {
    if (paidAmount >= grandTotal && grandTotal > 0) {
      status = 'paid';
    } else if (paidAmount > 0 && paidAmount < grandTotal) {
      status = 'partially-paid';
    } else if (paidAmount === 0 && currentStatus !== 'overdue') {
      status = 'unpaid';
    }
  }

  return {
    taxableAmount,
    totalGst,
    cgst,
    sgst,
    igst,
    grandTotal,
    balanceAmount,
    status,
  };
};
