import { type Coupon, type CouponStatus } from "../types/coupon";
import { formatCurrency } from "./formatCurrency";
import dayjs from "dayjs";

/**
 * Calculate the discount amount for a given order amount
 */
export function calculateDiscount(
  coupon: Pick<Coupon, "discount_type" | "discount_value" | "max_discount_amount" | "min_order_amount">,
  orderAmount: number
): {
  discount: number;
  finalAmount: number;
  isEligible: boolean;
  reason?: string;
} {
  if (orderAmount < (coupon.min_order_amount || 0)) {
    return {
      discount: 0,
      finalAmount: orderAmount,
      isEligible: false,
      reason: `Minimum order amount of ${formatCurrency(coupon.min_order_amount)} required.`,
    };
  }

  let discount = 0;

  if (coupon.discount_type === "PERCENTAGE") {
    const rawDiscount = (orderAmount * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
      discount = Math.min(rawDiscount, coupon.max_discount_amount);
    } else {
      discount = rawDiscount;
    }
  } else {
    // FLAT discount
    discount = Math.min(Number(coupon.discount_value), orderAmount);
  }

  // Ensure discount is not negative and doesn't exceed orderAmount
  discount = Math.max(0, Math.min(discount, orderAmount));
  const finalAmount = Math.max(0, orderAmount - discount);

  return {
    discount,
    finalAmount,
    isEligible: true,
  };
}

/**
 * Determine effective status of a coupon based on active flag and validity dates
 */
export function getEffectiveCouponStatus(coupon: Pick<Coupon, "is_active" | "start_date" | "end_date" | "usage_limit" | "used_count">): CouponStatus {
  if (!coupon.is_active) {
    return "INACTIVE";
  }

  const now = dayjs();
  if (coupon.end_date) {
    const endDate = dayjs(coupon.end_date);
    if (endDate.isValid() && now.isAfter(endDate)) {
      return "EXPIRED";
    }
  }

  // If usage limit exists and is reached
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.usage_limit > 0) {
    if (coupon.used_count >= coupon.usage_limit) {
      return "EXPIRED";
    }
  }

  return "ACTIVE";
}

/**
 * Format discount badge label string
 * Flat: "₹20 OFF"
 * Percentage with max: "10% OFF up to ₹50"
 * Percentage without max: "10% OFF"
 */
export function formatDiscountLabel(coupon: Pick<Coupon, "discount_type" | "discount_value" | "max_discount_amount">): string {
  if (coupon.discount_type === "PERCENTAGE") {
    if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
      return `${coupon.discount_value}% OFF up to ${formatCurrency(coupon.max_discount_amount)}`;
    }
    return `${coupon.discount_value}% OFF`;
  }
  return `${formatCurrency(coupon.discount_value)} OFF`;
}

/**
 * Calculate usage progress percentage (0 - 100)
 */
export function getUsagePercentage(usedCount: number, usageLimit: number | null | undefined): number | null {
  if (usageLimit === null || usageLimit === undefined || usageLimit <= 0) {
    return null; // Unlimited
  }
  const percentage = (usedCount / usageLimit) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}
