import type React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import type { Coupon } from "../../types/coupon";

interface CouponDeleteModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export const CouponDeleteModal: React.FC<CouponDeleteModalProps> = ({
  isOpen,
  coupon,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-140 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header with warning icon */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-secondary hover:text-on-surface p-1 rounded-lg hover:bg-secondary-container/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 id="delete-modal-title" className="text-lg font-bold text-on-surface">
            Delete Coupon?
          </h3>
          <p className="text-sm text-secondary mt-2 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-on-surface font-mono px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/60">
              "{coupon.code}"
            </span>
            ? This action cannot be undone and any future redemptions will be blocked.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-semibold text-secondary hover:text-on-surface hover:bg-secondary-container/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-error hover:bg-error/90 active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Coupon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponDeleteModal;
