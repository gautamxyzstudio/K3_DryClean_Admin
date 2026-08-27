import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import couponApi, {
  type GetCouponsResponse,
  type GetCouponUsagesResponse,
} from "../api/couponApi";
import type {
  Coupon,
  CouponStats,
  CouponFiltersState,
  CouponUsageFiltersState,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "../types/coupon";
import useSnackbarStore from "../store/useSnackbarStore";

export const COUPONS_QUERY_KEY = ["coupons"];
export const COUPON_STATS_QUERY_KEY = ["coupon-stats"];
export const COUPON_DETAIL_QUERY_KEY = (id: string) => ["coupon", id];
export const COUPON_USAGES_QUERY_KEY = (
  id: string,
  params?: Partial<CouponUsageFiltersState>,
) => ["coupon-usages", id, params];

/**
 * Hook to fetch paginated and filtered coupons list
 */
export function useCoupons(filters?: Partial<CouponFiltersState>) {
  return useQuery<GetCouponsResponse>({
    queryKey: [...COUPONS_QUERY_KEY, filters],
    queryFn: () => couponApi.getCoupons(filters),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholderData: (placeholderData: any) => placeholderData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single coupon by ID
 */
export function useCoupon(id: string | undefined) {
  return useQuery<Coupon>({
    queryKey: COUPON_DETAIL_QUERY_KEY(id || ""),
    queryFn: () => couponApi.getCouponById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch coupon summary statistics
 */
export function useCouponStats() {
  return useQuery<CouponStats>({
    queryKey: COUPON_STATS_QUERY_KEY,
    queryFn: () => couponApi.getCouponStats(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a new coupon
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      couponApi.createCoupon(payload),
    onSuccess: (newCoupon) => {
      // Invalidate queries so lists and stats update immediately
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: COUPON_STATS_QUERY_KEY });
      showSnackbar({
        message: `Coupon "${newCoupon.code}" created successfully!`,
        type: "success",
      });
    },
    onError: (error: Error) => {
      showSnackbar({
        message: error.message || "Failed to create coupon. Please try again.",
        type: "error",
      });
    },
  });
}

/**
 * Hook to update an existing coupon
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCouponPayload;
    }) => couponApi.updateCoupon(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: COUPON_DETAIL_QUERY_KEY(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: COUPON_STATS_QUERY_KEY });
      showSnackbar({
        message: "Coupon updated successfully!",
        type: "success",
      });
    },
    onError: (error: Error) => {
      showSnackbar({
        message: error.message || "Failed to update coupon. Please try again.",
        type: "error",
      });
    },
  });
}

/**
 * Hook to toggle coupon active / inactive status
 */
export function useUpdateCouponStatus() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponApi.updateCouponStatus(id, isActive),
    onSuccess: (updatedCoupon, variables) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: COUPON_DETAIL_QUERY_KEY(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: COUPON_STATS_QUERY_KEY });
      showSnackbar({
        message: `Coupon "${updatedCoupon.code}" is now ${variables.isActive ? "Active" : "Inactive"}.`,
        type: "success",
      });
    },
    onError: (error: Error) => {
      showSnackbar({
        message: error.message || "Failed to update coupon status.",
        type: "error",
      });
    },
  });
}

/**
 * Hook to delete a coupon
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarStore();

  return useMutation({
    mutationFn: (id: string) => couponApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: COUPON_STATS_QUERY_KEY });
      showSnackbar({
        message: "Coupon deleted successfully!",
        type: "success",
      });
    },
    onError: (error: Error) => {
      showSnackbar({
        message: error.message || "Failed to delete coupon.",
        type: "error",
      });
    },
  });
}

/**
 * Hook to fetch coupon usage logs
 */
export function useCouponUsages(
  id: string | undefined,
  filters?: Partial<CouponUsageFiltersState>,
) {
  return useQuery<GetCouponUsagesResponse>({
    queryKey: COUPON_USAGES_QUERY_KEY(id || "", filters),
    queryFn: () => couponApi.getCouponUsages(id!, filters),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}
