import type React from "react";
import { useNavigate, Link } from "react-router";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useCreateCoupon } from "../../../hooks/useCoupons";
import type { CouponFormData } from "../../../utils/couponValidation";
import type { CreateCouponPayload } from "../../../types/coupon";
import CouponForm from "../../../components/coupons/CouponForm";

export const CreateCouponPage: React.FC = () => {
  const navigate = useNavigate();
  const createCouponMutation = useCreateCoupon();

  const handleCreateSubmit = async (formData: CouponFormData) => {
    const payload: CreateCouponPayload = {
      code: formData.code,
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

    await createCouponMutation.mutateAsync(payload);
    navigate("/promotions");
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs font-semibold text-secondary gap-2">
        <Link
          to="/promotions"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Promotions</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-on-surface">Create New Coupon</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">
          Create New Coupon
        </h1>
        <p className="text-sm text-secondary mt-0.5">
          Configure a new promotional discount offer and set customer eligibility criteria
        </p>
      </div>

      {/* Main Coupon Form */}
      <CouponForm
        onSubmit={handleCreateSubmit}
        isSubmitting={createCouponMutation.isPending}
        onCancel={() => navigate("/promotions")}
      />
    </div>
  );
};

export default CreateCouponPage;
