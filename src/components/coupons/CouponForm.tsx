/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
import type React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ticket,
  Sparkles,
  Percent,
  IndianRupee,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from "lucide-react";
import {
  couponFormSchema,
  type CouponFormData,
  type CouponFormInput,
} from "../../utils/couponValidation";
import type { Coupon } from "../../types/coupon";
import { formatCurrency } from "../../utils/formatCurrency";
import { toDateTimeLocalInput, toISOStringSafe } from "../../utils/formatDate";
import { calculateDiscount } from "../../utils/couponCalculations";
import { CustomDateTimePicker } from "../common/CustomDateTimePicker";

interface CouponFormProps {
  initialData?: Coupon | null;
  isEdit?: boolean;
  onSubmit: (data: CouponFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  // Test order amount for interactive discount simulator
  const [simulatorAmount, setSimulatorAmount] = useState<number>(500);

  // Defaults
  const defaultStartDate = initialData?.start_date
    ? toDateTimeLocalInput(initialData.start_date)
    : "";

  const defaultEndDate = initialData?.end_date
    ? toDateTimeLocalInput(initialData.end_date)
    : "";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormInput, any, CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      discount_type: initialData?.discount_type || "FLAT",
      discount_value: initialData?.discount_value ?? undefined,
      min_order_amount: initialData?.min_order_amount ?? 0,
      max_discount_amount: initialData?.max_discount_amount ?? null,
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      is_unlimited_total: initialData ? initialData.usage_limit === null : true,
      usage_limit: initialData?.usage_limit ?? null,
      is_unlimited_per_user: initialData
        ? initialData.usage_limit_per_user === null
        : true,
      usage_limit_per_user: initialData?.usage_limit_per_user ?? null,
      is_active: initialData?.is_active ?? true,
    },
  });

  // Watch values for real-time live preview & validation triggers
  const watchedCode = watch("code");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");
  const watchedDiscountType = watch("discount_type");
  const watchedDiscountValue = watch("discount_value");
  const watchedMinOrder = watch("min_order_amount");
  const watchedMaxDiscount = watch("max_discount_amount");
  const watchedStartDate = watch("start_date");
  const watchedIsUnlimitedTotal = watch("is_unlimited_total");
  const watchedIsUnlimitedPerUser = watch("is_unlimited_per_user");
  const watchedIsActive = watch("is_active");

  // Keep code uppercase & without spaces
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toUpperCase().replace(/\s+/g, "");
    setValue("code", formatted, { shouldValidate: true });
  };

  // Live discount simulation calculation
  const simulationResult = calculateDiscount(
    {
      discount_type: watchedDiscountType,
      discount_value: Number(watchedDiscountValue) || 0,
      max_discount_amount: watchedMaxDiscount
        ? Number(watchedMaxDiscount)
        : null,
      min_order_amount: Number(watchedMinOrder) || 0,
    },
    simulatorAmount,
  );

  const handleFormSubmit = (data: CouponFormData) => {
    // Format dates to ISO before sending
    const formattedData: CouponFormData = {
      ...data,
      code: data.code.toUpperCase().trim(),
      start_date: data.start_date ? toISOStringSafe(data.start_date) : null,
      end_date: data.end_date ? toISOStringSafe(data.end_date) : null,
      usage_limit: data.is_unlimited_total ? null : Number(data.usage_limit),
      usage_limit_per_user: data.is_unlimited_per_user
        ? null
        : Number(data.usage_limit_per_user),
      max_discount_amount:
        data.discount_type === "PERCENTAGE" && data.max_discount_amount
          ? Number(data.max_discount_amount)
          : null,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Basic Information */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Basic Information
                </h3>
                <p className="text-xs text-secondary">
                  General identifiers and promotional text
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Coupon Code */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Coupon Code <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("code")}
                    onChange={handleCodeChange}
                    disabled={isEdit}
                    placeholder="COUPON CODE"
                    className={`w-full px-4 py-2.5 bg-surface text-sm font-mono font-bold tracking-wider uppercase border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.code
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-primary/20"
                    } ${isEdit ? "bg-surface-container opacity-80 cursor-not-allowed" : ""}`}
                  />
                  {isEdit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary bg-surface px-2 py-0.5 rounded border border-outline-variant">
                      Locked
                    </span>
                  )}
                </div>
                {errors.code ? (
                  <p className="text-xs text-error flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.code.message}
                  </p>
                ) : (
                  <p className="text-[11px] text-secondary">
                    Letters, numbers, hyphens, and underscores only.
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Title / Headline <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="Coupon title / headline"
                  className={`w-full px-4 py-2.5 bg-surface text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? "border-error focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Description{" "}
                  <span className="text-secondary/60 font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  rows={2}
                  {...register("description")}
                  placeholder="Coupon description..."
                  className="w-full px-4 py-2.5 bg-surface text-sm border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-error">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Discount Configuration */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Discount Configuration
                </h3>
                <p className="text-xs text-secondary">
                  Define flat deductions or percentage discounts with maximum
                  caps
                </p>
              </div>
            </div>

            {/* Discount Type Radio / Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                Discount Type <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setValue("discount_type", "FLAT", { shouldValidate: true })
                  }
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    watchedDiscountType === "FLAT"
                      ? "bg-primary/10 border-primary text-primary shadow-xs"
                      : "bg-surface border-outline-variant text-secondary hover:border-on-surface"
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  <span>FLAT DISCOUNT (₹)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setValue("discount_type", "PERCENTAGE", {
                      shouldValidate: true,
                    })
                  }
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    watchedDiscountType === "PERCENTAGE"
                      ? "bg-primary/10 border-primary text-primary shadow-xs"
                      : "bg-surface border-outline-variant text-secondary hover:border-on-surface"
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span>PERCENTAGE (%)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Discount Value */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  {watchedDiscountType === "PERCENTAGE"
                    ? "Percentage (%)"
                    : "Flat Amount (₹)"}{" "}
                  <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm font-bold">
                    {watchedDiscountType === "PERCENTAGE" ? "%" : "₹"}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    {...register("discount_value")}
                    placeholder="0"
                    className={`w-full pl-9 pr-4 py-2.5 bg-surface text-sm font-bold border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.discount_value
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.discount_value && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.discount_value.message}
                  </p>
                )}
              </div>

              {/* Maximum Discount Amount (Only for PERCENTAGE) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
                  <span>
                    Maximum Discount Cap (₹){" "}
                    {watchedDiscountType === "FLAT" && (
                      <span className="text-secondary/60 text-[11px] font-normal">
                        N/A for flat discounts
                      </span>
                    )}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    disabled={watchedDiscountType === "FLAT"}
                    {...register("max_discount_amount")}
                    placeholder={
                      watchedDiscountType === "PERCENTAGE" ? "0" : "Disabled"
                    }
                    className={`w-full pl-9 pr-4 py-2.5 bg-surface text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      watchedDiscountType === "FLAT"
                        ? "bg-surface-container/50 opacity-60 cursor-not-allowed border-outline-variant/40"
                        : errors.max_discount_amount
                          ? "border-error focus:ring-error/20"
                          : "border-outline-variant focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.max_discount_amount &&
                  watchedDiscountType === "PERCENTAGE" && (
                    <p className="text-xs text-error flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.max_discount_amount.message}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Order Conditions & Validity */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Order Conditions & Validity Period
                </h3>
                <p className="text-xs text-secondary">
                  Specify eligibility thresholds and start/end dates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Minimum Order Amount */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Minimum Order (₹) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    {...register("min_order_amount")}
                    placeholder="0"
                    className={`w-full pl-9 pr-4 py-2.5 bg-surface text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.min_order_amount
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.min_order_amount && (
                  <p className="text-xs text-error">
                    {errors.min_order_amount.message}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  Start Date & Time
                </label>
                <Controller
                  control={control}
                  name="start_date"
                  render={({ field, fieldState }) => (
                    <CustomDateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date & time"
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {errors.start_date && (
                  <p className="text-xs text-error">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                  End Date & Time
                </label>
                <Controller
                  control={control}
                  name="end_date"
                  render={({ field, fieldState }) => (
                    <CustomDateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      minDate={watchedStartDate}
                      placeholder="Select end date & time"
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {errors.end_date && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Usage Limits & Active Status */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/40">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Usage Limits & Status
                </h3>
                <p className="text-xs text-secondary">
                  Control how many times this coupon can be redeemed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total Usage Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Total Usage Limit
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_unlimited_total")}
                      className="rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span>Unlimited</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="1"
                  disabled={watchedIsUnlimitedTotal}
                  {...register("usage_limit")}
                  placeholder={
                    watchedIsUnlimitedTotal
                      ? "Unlimited redemptions"
                      : "Usage limit"
                  }
                  className={`w-full px-4 py-2.5 bg-surface text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    watchedIsUnlimitedTotal
                      ? "bg-surface-container/50 opacity-60 cursor-not-allowed"
                      : errors.usage_limit
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {errors.usage_limit && !watchedIsUnlimitedTotal && (
                  <p className="text-xs text-error">
                    {errors.usage_limit.message}
                  </p>
                )}
              </div>

              {/* Usage Limit Per User */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Limit Per Customer
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_unlimited_per_user")}
                      className="rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span>Unlimited</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="1"
                  disabled={watchedIsUnlimitedPerUser}
                  {...register("usage_limit_per_user")}
                  placeholder={
                    watchedIsUnlimitedPerUser
                      ? "Unlimited per user"
                      : "Per user limit"
                  }
                  className={`w-full px-4 py-2.5 bg-surface text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    watchedIsUnlimitedPerUser
                      ? "bg-surface-container/50 opacity-60 cursor-not-allowed"
                      : errors.usage_limit_per_user
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {errors.usage_limit_per_user && !watchedIsUnlimitedPerUser && (
                  <p className="text-xs text-error">
                    {errors.usage_limit_per_user.message}
                  </p>
                )}
              </div>
            </div>

            {/* Active Status Toggle */}
            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">
                  Coupon Active Status
                </p>
                <p className="text-xs text-secondary">
                  When active, customers can immediately apply this coupon
                  during checkout
                </p>
              </div>

              <Controller
                control={control}
                name="is_active"
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      value ? "bg-emerald-600" : "bg-secondary-container"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Preview & Calculator Simulator */}
        <div className="space-y-6">
          {/* Coupon Live Preview Card */}
          <div className="bg-linear-to-br from-primary to-primary-container p-6 rounded-2xl text-white shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
                Live Customer Card
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  watchedIsActive ? "bg-emerald-400" : "bg-white/40"
                }`}
              />
            </div>

            <div>
              <h4 className="font-bold text-xl leading-tight">
                {watchedTitle || "Flat ₹20 OFF"}
              </h4>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                {watchedDescription ||
                  "Get discount on your next laundry service order."}
              </p>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                  Promo Code
                </p>
                <p className="font-mono font-black text-lg tracking-widest mt-0.5">
                  {watchedCode || "SAVE20"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                  Min Order
                </p>
                <p className="font-bold text-sm mt-0.5">
                  {watchedMinOrder && Number(watchedMinOrder) > 0
                    ? formatCurrency(watchedMinOrder)
                    : "No Min"}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculation Simulator */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Calculator className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-sm">
                Discount Calculator Simulator
              </h4>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Test how this coupon applies against test cart values.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Sample Order Amount (₹)
              </label>
              <input
                type="number"
                value={simulatorAmount}
                onChange={(e) =>
                  setSimulatorAmount(Math.max(0, Number(e.target.value)))
                }
                className="w-full px-3.5 py-2 bg-surface text-sm font-bold border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Breakdown Result */}
            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/40 space-y-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal:</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(simulatorAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(simulationResult.discount)}</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/40 flex justify-between font-bold text-sm text-on-surface">
                <span>Customer Pays:</span>
                <span className="text-primary font-black">
                  {formatCurrency(simulationResult.finalAmount)}
                </span>
              </div>

              {!simulationResult.isEligible && (
                <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 mt-1">
                  ⚠️ {simulationResult.reason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-2xl border border-outline-variant shadow-lg flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-secondary hover:text-on-surface hover:bg-secondary-container/50 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {isEdit ? "Updating Coupon..." : "Creating Coupon..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? "Update Coupon" : "Create Coupon"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CouponForm;
