import type React from "react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Eye,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Check,
  AlertCircle,
  Plus,
  Ticket,
} from "lucide-react";
import type { Coupon } from "../../types/coupon";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  formatDiscountLabel,
  getEffectiveCouponStatus,
  getUsagePercentage,
} from "../../utils/couponCalculations";
import CouponStatusBadge from "./CouponStatusBadge";
import useSnackbarStore from "../../store/useSnackbarStore";

interface CouponTableProps {
  coupons: Coupon[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onCreateNew?: () => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onToggleStatus,
  onDelete,
  onCreateNew,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showSnackbar } = useSnackbarStore();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showSnackbar({
      message: `Coupon code "${code}" copied to clipboard!`,
      type: "info",
      duration: 2000,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Error State
  if (isError) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-error-container/60 shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-on-surface">Failed to load coupons</h4>
        <p className="text-sm text-secondary max-w-md mx-auto">
          {errorMessage ||
            "Unable to fetch promotional coupon records from the server."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low/60 text-secondary uppercase text-xs tracking-wider border-b border-outline-variant/60">
              <tr>
                {/* <th className="px-5 py-3.5 font-semibold">Coupon</th> */}
                <th className="px-5 py-3.5 font-semibold">Code</th>
                <th className="px-5 py-3.5 font-semibold">Discount</th>
                <th className="px-5 py-3.5 font-semibold">Minimum Order</th>
                <th className="px-5 py-3.5 font-semibold">Usage</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Valid Until</th>
                <th className="px-5 py-3.5 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <div className="h-4 bg-secondary-container/60 rounded w-36" />
                      <div className="h-3 bg-secondary-container/40 rounded w-48" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 bg-secondary-container/60 rounded w-20" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-secondary-container/60 rounded w-24" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-secondary-container/60 rounded w-16" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-secondary-container/60 rounded w-20" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 bg-secondary-container/60 rounded-full w-16" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-secondary-container/60 rounded w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty State
  if (coupons.length === 0) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-on-surface">
            No coupons found
          </h4>
          <p className="text-sm text-secondary max-w-100 mx-auto mt-1">
            No promotional coupons matched your filters or no coupons have been
            created yet.
          </p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Coupon</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low/60 text-secondary uppercase text-xs tracking-wider border-b border-outline-variant/60">
            <tr>
              {/* <th className="px-5 py-3.5 font-semibold">Coupon</th> */}
              <th className="px-5 py-3.5 font-semibold">Code</th>
              <th className="px-5 py-3.5 font-semibold">Discount</th>
              <th className="px-5 py-3.5 font-semibold">Minimum Order</th>
              <th className="px-5 py-3.5 font-semibold">Usage</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Valid Until</th>
              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {coupons.map((coupon) => {
              const targetId = coupon.documentId || coupon.id;
              const effectiveStatus = getEffectiveCouponStatus(coupon);
              const discountLabel = formatDiscountLabel(coupon);
              const usagePercentage = getUsagePercentage(
                coupon.used_count,
                coupon.usage_limit,
              );

              return (
                <tr
                  key={targetId}
                  className="hover:bg-surface-container-lowest/80 transition-colors group"
                >
                  {/* Coupon Title & Description */}
                  {/* <td className="px-5 py-4 max-w-xs">
                    <Link
                      to={`/promotions/${targetId}`}
                      className="font-bold text-on-surface hover:text-primary transition-colors block line-clamp-1"
                    >
                      {coupon.title}
                    </Link>
                    {coupon.description && (
                      <p className="text-xs text-secondary line-clamp-1 mt-0.5">
                        {coupon.description}
                      </p>
                    )}
                  </td> */}

                  {/* Code */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-outline-variant/60">
                      <span className="font-mono font-bold text-xs tracking-wide text-primary">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        title="Copy code"
                        className="text-secondary hover:text-on-surface p-0.5 rounded transition-colors cursor-pointer"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="px-5 py-4">
                    <span className="font-semibold text-emerald-400">
                      {discountLabel}
                    </span>
                  </td>

                  {/* Minimum Order */}
                  <td className="px-5 py-4 text-secondary">
                    {coupon.min_order_amount > 0 ? (
                      <span className="font-medium text-on-surface">
                        Min {formatCurrency(coupon.min_order_amount)}
                      </span>
                    ) : (
                      <span className="text-secondary/70">No minimum</span>
                    )}
                  </td>

                  {/* Usage */}
                  <td className="px-5 py-4">
                    <div className="space-y-1 min-w-25">
                      <span className="text-xs font-semibold text-on-surface">
                        {coupon.used_count.toLocaleString("en-IN")}{" "}
                        <span className="text-secondary font-normal">
                          /{" "}
                          {coupon.usage_limit
                            ? coupon.usage_limit.toLocaleString("en-IN")
                            : "∞"}
                        </span>
                      </span>
                      {usagePercentage !== null && (
                        <div className="w-20 h-1.5 bg-secondary-container/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              usagePercentage >= 90
                                ? "bg-amber-500"
                                : "bg-primary"
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <CouponStatusBadge status={effectiveStatus} size="sm" />
                  </td>

                  {/* Valid Until */}
                  <td className="px-5 py-4 text-xs font-medium text-secondary whitespace-nowrap">
                    {formatDate(coupon.end_date, "No expiry")}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Link
                        to={`/promotions/${targetId}`}
                        title="View Details"
                        className="p-1.5 text-secondary hover:text-on-surface hover:bg-secondary-container/50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/promotions/${targetId}/edit`}
                        title="Edit Coupon"
                        className="p-1.5 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => onToggleStatus(coupon)}
                        title={coupon.is_active ? "Deactivate" : "Activate"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          coupon.is_active
                            ? "text-secondary hover:text-amber-600 hover:bg-amber-50"
                            : "text-secondary hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {coupon.is_active ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDelete(coupon)}
                        title="Delete Coupon"
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponTable;
