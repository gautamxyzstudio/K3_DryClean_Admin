import type React from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronRight, ArrowLeft, Info } from "lucide-react";
import { useCoupon, useUpdateCoupon } from "../../../hooks/useCoupons";
import type { CouponFormData } from "../../../utils/couponValidation";
import type { UpdateCouponPayload } from "../../../types/coupon";
import CouponForm from "../../../components/coupons/CouponForm";

export const EditCouponPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: coupon, isLoading, isError, error } = useCoupon(id);
  const updateCouponMutation = useUpdateCoupon();

  const handleUpdateSubmit = async (formData: CouponFormData) => {
    if (!id) return;

    const payload: UpdateCouponPayload = {
      title: formData.title,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_amount: formData.min_order_amount,
      max_discount_amount: formData.max_discount_amount || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      usage_limit: formData.usage_limit ?? null,
      usage_limit_per_user: formData.usage_limit_per_user ?? null,
      is_active: formData.is_active,
    };

    await updateCouponMutation.mutateAsync({ id, payload });
    navigate(`/promotions/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto animate-pulse">
        <div className="h-6 bg-secondary-container/60 rounded w-48" />
        <div className="h-12 bg-secondary-container/60 rounded w-64" />
        <div className="h-96 bg-surface-container-lowest rounded-2xl border border-outline-variant/60" />
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
          {error?.message || "Could not load the coupon to edit."}
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

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto animate-in fade-in duration-200">
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
        <Link
          to={`/promotions/${coupon.documentId || coupon.id}`}
          className="hover:text-primary transition-colors"
        >
          {coupon.code}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface">Edit</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">
          Edit Coupon: {coupon.code}
        </h1>
        <p className="text-sm text-secondary mt-0.5">
          Modify discount parameters, dates, order limits, or active status
        </p>
      </div>

      {/* Form */}
      <CouponForm
        initialData={coupon}
        isEdit={true}
        onSubmit={handleUpdateSubmit}
        isSubmitting={updateCouponMutation.isPending}
        onCancel={() => navigate(`/promotions/${coupon.documentId || coupon.id}`)}
      />
    </div>
  );
};

export default EditCouponPage;
