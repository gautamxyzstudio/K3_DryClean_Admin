export type DiscountType = "FLAT" | "PERCENTAGE";

export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export type CouponUsageStatus = "APPLIED" | "REMOVED" | "CANCELLED";

export interface Coupon {
  id: number | string;
  documentId?: string;
  code: string;
  title: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  used_count: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  locale?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CouponUsage {
  id?: number | string;
  customer_name?: string | null;
  profile_id?: string | number | null;
  used_at?: string;
  order_amount?: number;
  discount_amount?: number;
  orderNo?: string | null;

  // Optional/fallback fields
  coupon_id?: string;
  coupon_code?: string;
  customer_id?: string;
  customer_phone?: string;
  customer_email?: string;
  order_id?: string;
  order_number?: string;
  final_amount?: number;
  status?: CouponUsageStatus;
  createdAt?: string;
  created_at?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  totalUses: number;
  totalDiscountGiven?: number;
}

export interface CouponFiltersState {
  search: string;
  status: "all" | "active" | "inactive" | "expired";
  discountType: "all" | "FLAT" | "PERCENTAGE";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CouponUsageFiltersState {
  search: string;
  status: "all" | CouponUsageStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export interface CreateCouponPayload {
  code: string;
  title: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  is_active: boolean;
}

export interface UpdateCouponPayload {
  title?: string;
  description?: string | null;
  discount_type?: DiscountType;
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  is_active?: boolean;
}

export interface CouponApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
