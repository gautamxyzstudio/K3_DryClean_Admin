/* eslint-disable react-hooks/exhaustive-deps */
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Ticket } from "lucide-react";
import {
  useCoupons,
  useDeleteCoupon,
  useUpdateCouponStatus,
} from "../../../hooks/useCoupons";
import type {
  Coupon,
  CouponFiltersState,
  CouponStats,
} from "../../../types/coupon";
import { getEffectiveCouponStatus } from "../../../utils/couponCalculations";
import useHeaderStore from "../../../store/useHeaderStore";
import CouponUsageStats from "../../../components/coupons/CouponUsageStats";
import CouponFilters from "../../../components/coupons/CouponFilters";
import CouponTable from "../../../components/coupons/CouponTable";
import CouponCard from "../../../components/coupons/CouponCard";
import CouponDeleteModal from "../../../components/coupons/CouponDeleteModal";
import CouponDeactivateModal from "../../../components/coupons/CouponDeactivateModal";
import Pagination from "../../../components/common/Pagination";

export const CouponsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCustomActionHandler } = useHeaderStore();

  // Filters State
  const [filters, setFilters] = useState<CouponFiltersState>({
    search: "",
    status: "all",
    discountType: "all",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modal State
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [couponToDeactivate, setCouponToDeactivate] = useState<Coupon | null>(
    null,
  );

  // Sync custom header button with Create Coupon page
  useEffect(() => {
    setCustomActionHandler(() => {
      navigate("/promotions/create");
    });

    return () => {
      setCustomActionHandler(null);
    };
  }, [setCustomActionHandler, navigate]);

  // Query all coupons from backend
  const {
    data: couponsResponse,
    isLoading: isCouponsLoading,
    isError,
    error,
    refetch,
  } = useCoupons();

  const deleteCouponMutation = useDeleteCoupon();
  const updateStatusMutation = useUpdateCouponStatus();

  const allCoupons = couponsResponse?.data || [];

  // Derive stats in-memory from loaded coupons (no separate /stats endpoint call)
  const statsData: CouponStats = useMemo(() => {
    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter((c) => c.is_active).length;
    const inactiveCoupons = allCoupons.filter((c) => !c.is_active).length;
    const totalUses = allCoupons.reduce(
      (acc, c) => acc + (c.used_count || 0),
      0,
    );

    return {
      totalCoupons,
      activeCoupons,
      inactiveCoupons,
      totalUses,
    };
  }, [allCoupons]);

  // Filter coupons client-side
  const filteredCoupons = useMemo(() => {
    return allCoupons.filter((coupon) => {
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesCode = (coupon.code || "").toLowerCase().includes(query);
        const matchesTitle = (coupon.title || "").toLowerCase().includes(query);
        const matchesDesc = (coupon.description || "")
          .toLowerCase()
          .includes(query);
        if (!matchesCode && !matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        const effectiveStatus = getEffectiveCouponStatus(coupon).toLowerCase();
        if (filters.status === "active" && effectiveStatus !== "active")
          return false;
        if (filters.status === "inactive" && effectiveStatus !== "inactive")
          return false;
        if (filters.status === "expired" && effectiveStatus !== "expired")
          return false;
      }

      // Discount type filter
      if (filters.discountType !== "all") {
        if (coupon.discount_type !== filters.discountType) return false;
      }

      return true;
    });
  }, [allCoupons, filters.search, filters.status, filters.discountType]);

  const totalCount = filteredCoupons.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Paginate filtered coupons
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(start, start + itemsPerPage);
  }, [filteredCoupons, currentPage, itemsPerPage]);

  // Filter change handler
  const handleFilterChange = (updated: Partial<CouponFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      discountType: "all",
    });
    setCurrentPage(1);
  };

  // Toggle status handler
  const handleToggleStatus = (coupon: Coupon) => {
    const targetId = coupon.documentId || String(coupon.id);
    if (coupon.is_active) {
      // Show confirmation when deactivating
      setCouponToDeactivate(coupon);
    } else {
      // Activate immediately
      updateStatusMutation.mutate({
        id: targetId,
        isActive: true,
      });
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!couponToDeactivate) return;
    const targetId =
      couponToDeactivate.documentId || String(couponToDeactivate.id);
    await updateStatusMutation.mutateAsync({
      id: targetId,
      isActive: false,
    });
    setCouponToDeactivate(null);
  };

  // Delete handlers
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    const targetId = couponToDelete.documentId || String(couponToDelete.id);
    await deleteCouponMutation.mutateAsync(targetId);
    setCouponToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Coupons
              </h1>
              <p className="text-sm text-secondary">
                Manage promotional offers and discount coupons
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <CouponUsageStats stats={statsData} isLoading={isCouponsLoading} />

      {/* Search & Filter Toolbar */}
      <CouponFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <CouponTable
          coupons={paginatedCoupons}
          isLoading={isCouponsLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={refetch}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteClick}
          onCreateNew={() => navigate("/promotions/create")}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-4">
        {isCouponsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-44 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 animate-pulse"
              />
            ))}
          </div>
        ) : paginatedCoupons.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/60">
            <p className="text-sm font-semibold text-secondary">
              No coupons found
            </p>
          </div>
        ) : (
          paginatedCoupons.map((coupon) => (
            <CouponCard
              key={coupon.documentId || coupon.id}
              coupon={coupon}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CouponDeleteModal
        isOpen={Boolean(couponToDelete)}
        coupon={couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteCouponMutation.isPending}
      />

      {/* Deactivate Confirmation Modal */}
      <CouponDeactivateModal
        isOpen={Boolean(couponToDeactivate)}
        coupon={couponToDeactivate}
        onClose={() => setCouponToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default CouponsListPage;
