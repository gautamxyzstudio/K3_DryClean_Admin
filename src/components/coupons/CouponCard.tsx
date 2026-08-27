import type React from "react";
import { Link } from "react-router";
import {
  Eye,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Check,
  Calendar,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
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

interface CouponCardProps {
  coupon: Coupon;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onToggleStatus,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const { showSnackbar } = useSnackbarStore();
  const effectiveStatus = getEffectiveCouponStatus(coupon);
  const discountLabel = formatDiscountLabel(coupon);
  const usagePercentage = getUsagePercentage(coupon.used_count, coupon.usage_limit);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    showSnackbar({
      message: `Coupon code "${coupon.code}" copied to clipboard!`,
      type: "info",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const targetId = coupon.documentId || coupon.id;

  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      {/* Top row: Title and Status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-bold text-base text-on-surface line-clamp-1">
            {coupon.title}
          </h4>
          <p className="text-xs text-secondary line-clamp-1 mt-0.5">
            {coupon.description || "No description provided"}
          </p>
        </div>
        <CouponStatusBadge status={effectiveStatus} size="sm" />
      </div>

      {/* Code & Discount Banner */}
      <div className="p-3 bg-surface rounded-xl border border-outline-variant/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            {coupon.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy coupon code"
            className="p-1 text-secondary hover:text-on-surface rounded-md hover:bg-secondary-container/50 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {discountLabel}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-secondary">
          <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
          <span>
            Min:{" "}
            <strong className="text-on-surface font-semibold">
              {coupon.min_order_amount > 0
                ? formatCurrency(coupon.min_order_amount)
                : "No minimum"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <Calendar className="w-3.5 h-3.5 text-secondary" />
          <span>
            Until:{" "}
            <strong className="text-on-surface font-semibold">
              {formatDate(coupon.end_date, "No expiry")}
            </strong>
          </span>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Redemptions
          </span>
          <span className="font-semibold text-on-surface">
            {coupon.used_count.toLocaleString("en-IN")}{" "}
            {coupon.usage_limit ? `/ ${coupon.usage_limit.toLocaleString("en-IN")}` : "• Unlimited"}
          </span>
        </div>
        {usagePercentage !== null ? (
          <div className="w-full h-1.5 bg-secondary-container/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercentage >= 90
                  ? "bg-amber-500"
                  : usagePercentage >= 100
                  ? "bg-error"
                  : "bg-primary"
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        ) : null}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
        <Link
          to={`/promotions/${targetId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-container transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Link>

        <div className="flex items-center gap-1">
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
          <Link
            to={`/promotions/${targetId}/edit`}
            title="Edit Coupon"
            className="p-1.5 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(coupon)}
            title="Delete Coupon"
            className="p-1.5 text-secondary hover:text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
