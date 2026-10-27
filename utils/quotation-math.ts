import { QuotationRateCard } from '@/types';

export interface QuotationCalculationResult {
  baseAmount: number;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export const calculateCorporateQuotation = (
  corp: QuotationRateCard,
  km: number,
  hours: number,
  gstPercent: number = 5,
  additionalCharges: number = 0
): QuotationCalculationResult => {
  const kmCost = km * (corp.perKm || 0);
  const hourCost = hours * (corp.perHour || 0);
  const baseAmount = kmCost + hourCost;
  const subtotal = baseAmount + (corp.driverAllowance || 0) + (corp.nightCharge || 0) + (corp.toll || 0) + (corp.parking || 0) + additionalCharges;
  const gstAmount = Math.round((subtotal * gstPercent) / 100);
  const totalAmount = subtotal + gstAmount;

  return {
    baseAmount,
    subtotal,
    gstAmount,
    totalAmount,
  };
};

export const calculateTouristQuotation = (
  rateCard: QuotationRateCard,
  days: number,
  gstPercent: number = 5,
  additionalCharges: number = 0
): QuotationCalculationResult => {
  const baseAmount = (rateCard.packagePrice || (rateCard.perDay || 0) * days);
  const subtotal = baseAmount + (rateCard.permits || 0) + (rateCard.toll || 0) + (rateCard.parking || 0) + (rateCard.extraVehicle || 0) + additionalCharges;
  const gstAmount = Math.round((subtotal * gstPercent) / 100);
  const totalAmount = subtotal + gstAmount;

  return {
    baseAmount,
    subtotal,
    gstAmount,
    totalAmount,
  };
};
