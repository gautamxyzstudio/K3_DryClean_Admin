import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  X,
  History,
  Info,
  User,
  ShoppingBag,
} from "lucide-react";
import { useCoupon, useCouponUsages } from "../../../hooks/useCoupons";
import type { CouponUsageFiltersState, CouponUsage } from "../../../types/coupon";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import Pagination from "../../../components/common/Pagination";
import CustomDateTimePicker from "../../../components/common/CustomDateTimePicker";

export const CouponUsagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [filters, setFilters] = useState<CouponUsageFiltersState>({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: coupon, isLoading: isCouponLoading } = useCoupon(id);
  const {
    data: usagesResponse,
    isLoading: isUsagesLoading,
    isError,
    error,
    refetch,
  } = useCouponUsages(id);

  const rawUsages: CouponUsage[] = usagesResponse?.data || [];

  // Filter client-side
  const filteredUsages = useMemo(() => {
    return rawUsages.filter((usage) => {
      // Search filter (customer name or orderNo)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = (usage.customer_name || "").toLowerCase().includes(query);
        const matchesOrder = (usage.orderNo || usage.order_number || usage.order_id || "")
          .toLowerCase()
          .includes(query);
        if (!matchesName && !matchesOrder) return false;
      }

      // Date range filter
      if (filters.startDate) {
        const usageDate = usage.used_at || usage.createdAt || usage.created_at;
        if (usageDate && new Date(usageDate) < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        const usageDate = usage.used_at || usage.createdAt || usage.created_at;
        if (usageDate && new Date(usageDate) > new Date(filters.endDate + "T23:59:59"))
          return false;
      }

      return true;
    });
  }, [rawUsages, filters.search, filters.startDate, filters.endDate]);

  const totalCount = filteredUsages.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Paginated records
  const paginatedUsages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsages.slice(start, start + itemsPerPage);
  }, [filteredUsages, currentPage, itemsPerPage]);

  const totalDiscountGiven = useMemo(() => {
    return rawUsages.reduce((sum, u) => sum + (Number(u.discount_amount) || 0), 0);
  }, [rawUsages]);

  const targetCouponId = coupon?.documentId || coupon?.id || id;

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs font-semibold text-secondary gap-2">
        <Link
          to="/promotions"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Promotions</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        {coupon ? (
          <Link
            to={`/promotions/${targetCouponId}`}
            className="hover:text-primary transition-colors"
          >
            {coupon.code}
          </Link>
        ) : (
          <span>Coupon</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface">Usage History</span>
      </nav>

      {/* Top Banner with Coupon Summary */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Coupon Usage History
              </h1>
              <p className="text-xs text-secondary">
                Detailed audit log of customer redemptions and discount amounts
              </p>
            </div>
          </div>
        </div>

        {coupon && (
          <div className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-outline-variant/60">
            <div>
              <p className="text-[11px] text-secondary uppercase font-semibold">
                Coupon
              </p>
              <p className="font-mono font-bold text-sm text-primary">
                {coupon.code}
              </p>
              <p className="text-xs text-on-surface font-medium">{coupon.title}</p>
            </div>
            <div className="h-8 w-px bg-outline-variant/60" />
            <div>
              <p className="text-[11px] text-secondary uppercase font-semibold">
                Total Redemptions
              </p>
              <p className="text-lg font-bold text-on-surface">
                {(coupon.used_count || rawUsages.length).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="h-8 w-px bg-outline-variant/60" />
            <div>
              <p className="text-[11px] text-secondary uppercase font-semibold">
                Discount Given
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalDiscountGiven)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Customer / Order search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or order number..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface text-sm border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters((prev) => ({ ...prev, search: "" }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 rounded-full hover:bg-secondary-container/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Start Date */}
          <div className="w-38">
            <CustomDateTimePicker
              mode="date"
              value={filters.startDate}
              maxDate={filters.endDate}
              placeholder="From Date"
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, startDate: val }));
                setCurrentPage(1);
              }}
            />
          </div>

          {/* End Date */}
          <div className="w-38">
            <CustomDateTimePicker
              mode="date"
              value={filters.endDate}
              minDate={filters.startDate}
              placeholder="To Date"
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, endDate: val }));
                setCurrentPage(1);
              }}
            />
          </div>

          {(filters.search || filters.startDate || filters.endDate) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({
                  search: "",
                  status: "all",
                  startDate: "",
                  endDate: "",
                  page: 1,
                  limit: 10,
                });
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-primary hover:text-primary-container bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Usage Table */}
      {isUsagesLoading || isCouponLoading ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="h-12 bg-secondary-container/50 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-error-container/60 space-y-3">
          <Info className="w-6 h-6 text-error mx-auto" />
          <p className="text-sm font-bold text-on-surface">Failed to load coupon usage history</p>
          <p className="text-xs text-secondary">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : paginatedUsages.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-on-surface">No redemptions found</h4>
          <p className="text-xs text-secondary max-w-100 mx-auto">
            This coupon has not been applied to any customer orders yet, or no orders matched your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low/60 text-secondary uppercase text-xs tracking-wider border-b border-outline-variant/60">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Order No</th>
                  <th className="px-5 py-3.5 font-semibold">Order Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Discount Given</th>
                  <th className="px-5 py-3.5 font-semibold">Final Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Redeemed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {paginatedUsages.map((usage, idx) => {
                  const finalAmount = Math.max(
                    0,
                    (Number(usage.order_amount) || 0) - (Number(usage.discount_amount) || 0)
                  );
                  const orderNumber = usage.orderNo || usage.order_number || usage.order_id;
                  const dateVal = usage.used_at || usage.createdAt || usage.created_at;

                  return (
                    <tr
                      key={usage.id || idx}
                      className="hover:bg-surface-container-lowest/80 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm">
                              {usage.customer_name || "Customer"}
                            </p>
                            {usage.profile_id && (
                              <p className="text-[11px] text-secondary">
                                ID: {String(usage.profile_id).slice(0, 10)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Order No */}
                      <td className="px-5 py-4">
                        {orderNumber ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/60 font-mono font-bold text-xs text-primary">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{orderNumber}</span>
                          </div>
                        ) : (
                          <span className="text-secondary/60">—</span>
                        )}
                      </td>

                      {/* Order Amount */}
                      <td className="px-5 py-4 text-on-surface font-semibold">
                        {formatCurrency(Number(usage.order_amount) || 0)}
                      </td>

                      {/* Discount Given */}
                      <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        -{formatCurrency(Number(usage.discount_amount) || 0)}
                      </td>

                      {/* Final Amount */}
                      <td className="px-5 py-4 font-bold text-on-surface">
                        {formatCurrency(finalAmount)}
                      </td>

                      {/* Used At */}
                      <td className="px-5 py-4 text-xs text-secondary whitespace-nowrap">
                        {dateVal ? formatDateTime(dateVal) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CouponUsagePage;
