import type React from "react";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  History,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Info,
  Clock,
  Calculator,
} from "lucide-react";
import {
  useCoupon,
  useDeleteCoupon,
  useUpdateCouponStatus,
} from "../../../hooks/useCoupons";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate, formatDateTime } from "../../../utils/formatDate";
import {
  formatDiscountLabel,
  getEffectiveCouponStatus,
  getUsagePercentage,
  calculateDiscount,
} from "../../../utils/couponCalculations";
import CouponStatusBadge from "../../../components/coupons/CouponStatusBadge";
import CouponDeleteModal from "../../../components/coupons/CouponDeleteModal";
import CouponDeactivateModal from "../../../components/coupons/CouponDeactivateModal";
import useSnackbarStore from "../../../store/useSnackbarStore";

export const CouponDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarStore();

  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [simulatorAmount, setSimulatorAmount] = useState<number>(350);

  const { data: coupon, isLoading, isError, error } = useCoupon(id);
  const deleteCouponMutation = useDeleteCoupon();
  const updateStatusMutation = useUpdateCouponStatus();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto animate-pulse">
        <div className="h-6 bg-secondary-container/60 rounded w-48" />
        <div className="h-32 bg-surface-container-lowest rounded-2xl border border-outline-variant/60" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-surface-container-lowest rounded-2xl border border-outline-variant/60" />
          <div className="h-96 bg-surface-container-lowest rounded-2xl border border-outline-variant/60" />
        </div>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/60 max-w-xl mx-auto mt-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-on-surface">Coupon Not Found</h3>
        <p className="text-sm text-secondary">
          {error?.message || "The requested coupon could not be found or has been removed."}
        </p>
        <button
          onClick={() => navigate("/promotions")}
          className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
        >
          Back to Coupons
        </button>
      </div>
    );
  }

  const effectiveStatus = getEffectiveCouponStatus(coupon);
  const discountLabel = formatDiscountLabel(coupon);
  const usagePercentage = getUsagePercentage(coupon.used_count, coupon.usage_limit);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    showSnackbar({
      message: `Code "${coupon.code}" copied!`,
      type: "info",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const targetId = coupon.documentId || String(coupon.id);

  const handleToggleStatus = () => {
    if (coupon.is_active) {
      setIsDeactivateModalOpen(true);
    } else {
      updateStatusMutation.mutate({
        id: targetId,
        isActive: true,
      });
    }
  };

  const handleConfirmDeactivate = async () => {
    await updateStatusMutation.mutateAsync({
      id: targetId,
      isActive: false,
    });
    setIsDeactivateModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    await deleteCouponMutation.mutateAsync(targetId);
    setIsDeleteModalOpen(false);
    navigate("/promotions");
  };

  // Live simulation tester
  const simResult = calculateDiscount(
    {
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount_amount: coupon.max_discount_amount,
      min_order_amount: coupon.min_order_amount,
    },
    simulatorAmount
  );

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-semibold text-secondary gap-2">
        <Link
          to="/promotions"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Promotions</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface">{coupon.code}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              {coupon.title}
            </h1>
            <CouponStatusBadge status={effectiveStatus} />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              {coupon.code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy code"
              className="p-1 text-secondary hover:text-on-surface rounded-md hover:bg-secondary-container/50 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {coupon.description && (
              <span className="text-xs text-secondary pl-2 border-l border-outline-variant/60 hidden sm:inline">
                {coupon.description}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate(`/promotions/${targetId}/usages`)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-secondary hover:text-on-surface bg-surface hover:bg-secondary-container/50 border border-outline-variant rounded-xl transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-primary" />
            <span>Usage History</span>
          </button>

          <button
            onClick={() => navigate(`/promotions/${targetId}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Coupon</span>
          </button>

          <button
            onClick={handleToggleStatus}
            title={coupon.is_active ? "Deactivate Coupon" : "Activate Coupon"}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              coupon.is_active
                ? "text-secondary hover:text-amber-600 bg-surface border-outline-variant hover:bg-amber-50"
                : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {coupon.is_active ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            title="Delete Coupon"
            className="p-2.5 text-secondary hover:text-error bg-surface border border-outline-variant hover:bg-error-container/30 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details + Usage & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Details Bento */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bento Grid Specifications */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-on-surface border-b border-outline-variant/40 pb-3">
              Coupon Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Discount Value */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Discount Value</span>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {discountLabel}
                </p>
                <p className="text-xs text-secondary">
                  {coupon.discount_type === "PERCENTAGE"
                    ? `${coupon.discount_value}% deduction on qualifying cart`
                    : "Flat fixed amount reduction"}
                </p>
              </div>

              {/* Minimum Order Amount */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Minimum Order</span>
                </div>
                <p className="text-xl font-bold text-on-surface">
                  {coupon.min_order_amount > 0
                    ? formatCurrency(coupon.min_order_amount)
                    : "No Minimum"}
                </p>
                <p className="text-xs text-secondary">
                  Cart subtotal threshold required to redeem
                </p>
              </div>

              {/* Maximum Discount Cap */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  <span>Maximum Discount Cap</span>
                </div>
                <p className="text-xl font-bold text-on-surface">
                  {coupon.max_discount_amount
                    ? formatCurrency(coupon.max_discount_amount)
                    : "—"}
                </p>
                <p className="text-xs text-secondary">
                  {coupon.max_discount_amount
                    ? "Maximum discount limit per checkout"
                    : "No upper cap configured"}
                </p>
              </div>

              {/* Per Customer Limit */}
              <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                  <Layers className="w-3.5 h-3.5 text-secondary" />
                  <span>Usage Limit Per Customer</span>
                </div>
                <p className="text-xl font-bold text-on-surface">
                  {coupon.usage_limit_per_user
                    ? `${coupon.usage_limit_per_user} time(s)`
                    : "Unlimited"}
                </p>
                <p className="text-xs text-secondary">
                  Maximum times an individual user can apply
                </p>
              </div>
            </div>

            {/* Validity Timeline */}
            <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Validity Period</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-secondary block">Starts From:</span>
                  <span className="font-bold text-on-surface text-sm mt-0.5 block">
                    {coupon.start_date ? formatDateTime(coupon.start_date) : "Immediate"}
                  </span>
                </div>
                <div>
                  <span className="text-secondary block">Valid Until:</span>
                  <span className="font-bold text-on-surface text-sm mt-0.5 block">
                    {coupon.end_date ? formatDateTime(coupon.end_date) : "No expiry (Indefinite)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="flex items-center justify-between text-xs text-secondary pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Created on: {formatDate(coupon.createdAt || coupon.created_at)}
              </span>
              <span>Code: {coupon.code}</span>
            </div>
          </div>
        </div>

        {/* 1 Col: Usage Progress Bar & Live Simulator */}
        <div className="space-y-6">
          {/* Usage Meter Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Usage & Redemptions
              </h3>
              <span className="text-xs font-semibold text-secondary">
                {coupon.usage_limit ? `${usagePercentage?.toFixed(1)}%` : "Unlimited"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-on-surface">
                  {coupon.used_count.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-secondary font-medium">
                  {coupon.usage_limit
                    ? `of ${coupon.usage_limit.toLocaleString("en-IN")} Uses`
                    : "Total Redemptions"}
                </span>
              </div>

              {usagePercentage !== null && (
                <div className="w-full h-2.5 bg-secondary-container/60 rounded-full overflow-hidden">
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
              )}
            </div>

            <button
              onClick={() => navigate(`/promotions/${coupon.id}/usages`)}
              className="w-full py-2.5 px-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>View Usage History</span>
            </button>
          </div>

          {/* Live Discount Calculator Simulator */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Calculator className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Discount Simulator</h3>
            </div>
            <p className="text-xs text-secondary">
              Calculate the exact customer discount for any sample order value.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Sample Order Amount (₹)
              </label>
              <input
                type="number"
                value={simulatorAmount}
                onChange={(e) => setSimulatorAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2 bg-surface text-sm font-bold border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/40 space-y-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Order Total:</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(simulatorAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(simResult.discount)}</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/40 flex justify-between font-bold text-sm text-on-surface">
                <span>Customer Pays:</span>
                <span className="text-primary font-black">
                  {formatCurrency(simResult.finalAmount)}
                </span>
              </div>

              {!simResult.isEligible && (
                <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 mt-1">
                  ⚠️ {simResult.reason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <CouponDeleteModal
        isOpen={isDeleteModalOpen}
        coupon={coupon}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteCouponMutation.isPending}
      />

      {/* Deactivate Confirmation Modal */}
      <CouponDeactivateModal
        isOpen={isDeactivateModalOpen}
        coupon={coupon}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default CouponDetailsPage;
