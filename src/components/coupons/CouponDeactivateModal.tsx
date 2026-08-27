import type React from "react";
import { PowerOff, X } from "lucide-react";
import type { Coupon } from "../../types/coupon";

interface CouponDeactivateModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isUpdating?: boolean;
}

export const CouponDeactivateModal: React.FC<CouponDeactivateModalProps> = ({
  isOpen,
  coupon,
  onClose,
  onConfirm,
  isUpdating = false,
}) => {
  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-140 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <PowerOff className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-secondary hover:text-on-surface p-1 rounded-lg hover:bg-secondary-container/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 id="deactivate-modal-title" className="text-lg font-bold text-on-surface">
            Deactivate Coupon?
          </h3>
          <p className="text-sm text-secondary mt-2 leading-relaxed">
            Customers will no longer be able to apply the coupon{" "}
            <span className="font-bold text-on-surface font-mono px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/60">
              "{coupon.code}"
            </span>{" "}
            during checkout. You can reactivate it at any time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2.5 text-sm font-semibold text-secondary hover:text-on-surface hover:bg-secondary-container/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deactivating...</span>
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span>Deactivate Coupon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponDeactivateModal;
