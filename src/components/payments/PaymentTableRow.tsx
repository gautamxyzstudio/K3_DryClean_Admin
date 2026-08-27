import type React from "react";
// import { useState, useRef, useEffect } from "react";
import type { PaymentTransaction } from "../../types/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";
// import useSnackbarStore from "../../store/useSnackbarStore";

interface PaymentTableRowProps {
  payment: PaymentTransaction;
  onSelect: (payment: PaymentTransaction) => void;
  onRefund: (paymentId: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export const PaymentTableRow: React.FC<PaymentTableRowProps> = ({
  payment,
  onSelect,
  onViewOrder,
}) => {
  return (
    <tr
      onClick={() => onSelect(payment)}
      className="border-b border-[#E5E5E5] hover:bg-surface-container/20 transition-colors cursor-pointer group"
    >
      <td className="px-lg py-md font-medium text-on-surface">{payment.id}</td>
      <td
        className="px-lg py-md text-primary font-medium hover:underline"
        onClick={(e) => {
          if (onViewOrder) {
            e.stopPropagation();
            onViewOrder(payment.orderId);
          }
        }}
      >
        {payment.orderId}
      </td>
      <td className="px-lg py-md text-on-surface">{payment.customerName}</td>
      <td className="px-lg py-md font-medium text-on-surface">
        ₹ {payment.amount.toLocaleString("en-IN")}
      </td>
      <td className="px-lg py-md text-on-surface-variant">{payment.method}</td>
      <td className="px-lg py-md">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-lg py-md text-on-surface-variant whitespace-nowrap">
        {payment.createdAt}
      </td>
      <td className="px-lg py-md text-right relative">
        <div className="inline-block text-left">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(payment);
            }}
            className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container/50 transition-colors cursor-pointer"
            title="More Options"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PaymentTableRow;
