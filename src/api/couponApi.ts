import { api } from "./apiClient";
import { ENDPOINTS } from "./endpoints";
import type {
  Coupon,
  CouponUsage,
  CouponStats,
  CouponFiltersState,
  CouponUsageFiltersState,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "../types/coupon";

export interface GetCouponsResponse {
  data: Coupon[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface GetCouponUsagesResponse {
  data: CouponUsage[];
  coupon?: Coupon;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    totalDiscountGiven?: number;
  };
}

/**
 * Resolve numeric ID to Strapi 5 documentId string
 */
async function resolveCouponDocId(id: string | number): Promise<string> {
  const strId = String(id);
  // If id is numeric (e.g. "2" or 2), resolve its documentId from full coupons list
  if (!isNaN(Number(strId))) {
    try {
      const couponsRes = await couponApi.getCoupons();
      const matched = (couponsRes.data || []).find((c) => String(c.id) === strId);
      if (matched?.documentId) {
        return matched.documentId;
      }
    } catch {
      // ignore
    }
  }
  return strId;
}

export const couponApi = {
  /**
   * Fetch all coupons with filters
   */
  getCoupons: async (filters?: Partial<CouponFiltersState>): Promise<GetCouponsResponse> => {
    const params: Record<string, string | number> = {};

    if (filters?.search && filters.search.trim()) params.search = filters.search.trim();
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.discountType && filters.discountType !== "all") params.discount_type = filters.discountType;
    if (filters?.sortBy) params.sort_by = filters.sortBy;
    if (filters?.sortOrder) params.sort_order = filters.sortOrder;

    const response = await api.get<GetCouponsResponse | { data: Coupon[] } | Coupon[]>(
      ENDPOINTS.getAllCoupons,
      { params }
    );

    // Handle array response
    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          total: response.length,
          totalPages: 1,
        },
      };
    }

    // Handle { data: [...] } Strapi response
    if (response && "data" in response && Array.isArray(response.data)) {
      const resp = response as GetCouponsResponse;
      return {
        data: resp.data,
        meta: resp.meta || {
          total: resp.data.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      meta: {
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Fetch coupon details by documentId (resolving numeric ID if needed)
   */
  getCouponById: async (id: string | number): Promise<Coupon> => {
    const docId = await resolveCouponDocId(id);
    const response = await api.get<{ data: Coupon } | Coupon>(
      ENDPOINTS.getCouponById(docId)
    );

    if (response && "data" in response && typeof response.data === "object") {
      return response.data;
    }
    return response as Coupon;
  },

  /**
   * Derive coupon summary statistics in-memory
   */
  getCouponStats: async (): Promise<CouponStats> => {
    const couponsRes = await couponApi.getCoupons();
    const allCoupons = couponsRes.data || [];

    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter((c) => c.is_active).length;
    const inactiveCoupons = allCoupons.filter((c) => !c.is_active).length;
    const totalUses = allCoupons.reduce((acc, c) => acc + (c.used_count || 0), 0);

    return {
      totalCoupons,
      activeCoupons,
      inactiveCoupons,
      totalUses,
    };
  },

  /**
   * Create a new coupon (wrapped in Strapi { data: payload } format)
   */
  createCoupon: async (payload: CreateCouponPayload): Promise<Coupon> => {
    const response = await api.post<{ data: Coupon } | Coupon>(
      ENDPOINTS.createCoupon,
      { data: payload }
    );

    if (response && "data" in response && typeof response.data === "object") {
      return response.data;
    }
    return response as Coupon;
  },

  /**
   * Update an existing coupon by documentId
   */
  updateCoupon: async (id: string | number, payload: UpdateCouponPayload): Promise<Coupon> => {
    const docId = await resolveCouponDocId(id);
    const response = await api.put<{ data: Coupon } | Coupon>(
      ENDPOINTS.updateCoupon(docId),
      { data: payload }
    );

    if (response && "data" in response && typeof response.data === "object") {
      return response.data;
    }
    return response as Coupon;
  },

  /**
   * Activate or Deactivate a coupon by documentId
   */
  updateCouponStatus: async (id: string | number, isActive: boolean): Promise<Coupon> => {
    const docId = await resolveCouponDocId(id);
    const response = await api.put<{ data: Coupon } | Coupon>(
      ENDPOINTS.updateCoupon(docId),
      { data: { is_active: isActive } }
    );

    if (response && "data" in response && typeof response.data === "object") {
      return response.data;
    }
    return response as Coupon;
  },

  /**
   * Delete a coupon by documentId
   */
  deleteCoupon: async (id: string | number): Promise<{ success: boolean; message?: string }> => {
    const docId = await resolveCouponDocId(id);
    return await api.delete(ENDPOINTS.deleteCoupon(docId));
  },

  /**
   * Fetch coupon usage history with pagination and search
   */
  getCouponUsages: async (
    id: string | number,
    filters?: Partial<CouponUsageFiltersState>
  ): Promise<GetCouponUsagesResponse> => {
    const docId = await resolveCouponDocId(id);

    const params: Record<string, string | number> = {
      couponId: docId,
    };

    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.search && filters.search.trim()) params.search = filters.search.trim();
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await api.get<GetCouponUsagesResponse | { data: CouponUsage[] } | CouponUsage[]>(
      ENDPOINTS.getCouponUsages,
      { params }
    );

    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          total: response.length,
          page: filters?.page || 1,
          limit: filters?.limit || response.length,
          totalPages: 1,
          totalDiscountGiven: response.reduce((sum, u) => sum + (u.discount_amount || 0), 0),
        },
      };
    }

    if (response && "data" in response && Array.isArray(response.data)) {
      const resp = response as GetCouponUsagesResponse;
      return {
        data: resp.data,
        coupon: resp.coupon,
        meta: resp.meta || {
          total: resp.data.length,
          page: filters?.page || 1,
          limit: filters?.limit || resp.data.length,
          totalPages: 1,
          totalDiscountGiven: resp.data.reduce((sum, u) => sum + (u.discount_amount || 0), 0),
        },
      };
    }

    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDiscountGiven: 0,
      },
    };
  },
};

export default couponApi;
