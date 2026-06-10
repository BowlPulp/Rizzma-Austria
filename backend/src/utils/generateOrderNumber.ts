import { Order } from '../models';

/**
 * Generates a unique order number in the format RZM-YYYYMMDD-NNN.
 * NNN is a zero-padded sequential number that resets each day.
 *
 * @returns A promise that resolves to the generated order number string.
 *
 * @example
 * // Returns "RZM-20260609-001" for the first order on June 9, 2026
 * const orderNumber = await generateOrderNumber();
 */
export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Find the highest order number for today
  const prefix = `RZM-${dateStr}-`;
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumberStr = lastOrder.orderNumber.split('-').pop();
    if (lastNumberStr) {
      nextNumber = parseInt(lastNumberStr, 10) + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(3, '0');
  return `${prefix}${paddedNumber}`;
}
