import type React from "react";
import { useEffect, useState } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import type { CouponFiltersState } from "../../types/coupon";
import CustomDropdown, { type DropdownOption } from "../common/CustomDropdown";

interface CouponFiltersProps {
  filters: CouponFiltersState;
  onFilterChange: (updated: Partial<CouponFiltersState>) => void;
  onReset: () => void;
}

const statusOptions: DropdownOption<CouponFiltersState["status"]>[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active", badgeDotColor: "bg-emerald-500" },
  { value: "inactive", label: "Inactive", badgeDotColor: "bg-amber-500" },
  { value: "expired", label: "Expired", badgeDotColor: "bg-slate-400" },
];

const discountTypeOptions: DropdownOption<
  CouponFiltersState["discountType"]
>[] = [
  { value: "all", label: "All Types" },
  { value: "FLAT", label: "Flat (₹)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

export const CouponFilters: React.FC<CouponFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [prevSearch, setPrevSearch] = useState(filters.search || "");

  // Sync internal search state if external filters change (during rendering)
  if ((filters.search || "") !== prevSearch) {
    setPrevSearch(filters.search || "");
    setSearchTerm(filters.search || "");
  }

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ search: searchTerm });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== "all" ||
    filters.discountType !== "all";

  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-sm space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search input with debounce */}
        <div className="relative flex-1 min-w-65">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or title..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface text-sm border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                onFilterChange({ search: "" });
              }}
              title="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 rounded-full hover:bg-secondary-container/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Custom Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <CustomDropdown<CouponFiltersState["status"]>
            label="Status:"
            value={filters.status}
            options={statusOptions}
            onChange={(status) => onFilterChange({ status })}
            menuWidth="w-36"
            ariaLabel="Filter coupons by status"
          />

          {/* Discount Type Dropdown */}
          <CustomDropdown<CouponFiltersState["discountType"]>
            prefixIcon={<Filter className="w-3.5 h-3.5 text-secondary" />}
            label="Type:"
            value={filters.discountType}
            options={discountTypeOptions}
            onChange={(discountType) => onFilterChange({ discountType })}
            menuWidth="w-40"
            ariaLabel="Filter coupons by discount type"
          />

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchTerm("");
                onReset();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-container px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponFilters;
