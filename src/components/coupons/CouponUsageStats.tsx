import type React from "react";
import { Ticket, CheckCircle2, PauseCircle, Users } from "lucide-react";
import type { CouponStats } from "../../types/coupon";

interface CouponUsageStatsProps {
  stats?: CouponStats;
  isLoading?: boolean;
}

export const CouponUsageStats: React.FC<CouponUsageStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      title: "Total Coupons",
      value: stats?.totalCoupons ?? 0,
      description: "All campaigns created",
      icon: Ticket,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "Active Coupons",
      value: stats?.activeCoupons ?? 0,
      description: "Live & ready to apply",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      title: "Inactive Coupons",
      value: stats?.inactiveCoupons ?? 0,
      description: "Disabled or expired",
      icon: PauseCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      title: "Total Coupon Uses",
      value: stats?.totalUses ?? 0,
      description: "Orders with discount",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm animate-pulse flex items-start justify-between"
          >
            <div className="space-y-2.5 flex-1">
              <div className="h-3.5 bg-secondary-container/60 rounded w-24" />
              <div className="h-7 bg-secondary-container/80 rounded w-16" />
              <div className="h-3 bg-secondary-container/40 rounded w-32" />
            </div>
            <div className="w-11 h-11 bg-secondary-container/60 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between group"
          >
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-on-surface mt-1.5 tracking-tight group-hover:text-primary transition-colors">
                {card.value.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-secondary/80 mt-1 font-medium">
                {card.description}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
            >
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CouponUsageStats;
