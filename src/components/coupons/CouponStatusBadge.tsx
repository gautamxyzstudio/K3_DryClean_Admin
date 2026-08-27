import type React from "react";
import { type CouponStatus } from "../../types/coupon";

interface CouponStatusBadgeProps {
  status: CouponStatus | "active" | "inactive" | "expired";
  size?: "sm" | "md";
  className?: string;
}

export const CouponStatusBadge: React.FC<CouponStatusBadgeProps> = ({
  status,
  size = "md",
  className = "",
}) => {
  const normalized = status.toUpperCase() as CouponStatus;

  const config = {
    ACTIVE: {
      label: "Active",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    INACTIVE: {
      label: "Inactive",
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    EXPIRED: {
      label: "Expired",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
  };

  const current = config[normalized] || config.INACTIVE;
  const sizeStyles =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1.5"
      : "px-2.5 py-1 text-xs font-semibold gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeStyles} ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

export default CouponStatusBadge;
