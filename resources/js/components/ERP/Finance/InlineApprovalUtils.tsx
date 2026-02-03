import React from "react";
import Swal from "sweetalert2";
import { useFinanceApi } from "../../../hooks/useFinanceApi";

// Types for approval functionality
export interface InlineApprovalProps {
  transactionId: string;
  transactionType: "expense" | "invoice" | "journal_entry";
  requiresApproval: boolean;
  status: string;
  amount: number;
  userRole?: string;
  userApprovalLimit?: number | null;
  onApprovalSuccess?: () => void;
}

// Check if user can approve this transaction
export const canUserApprove = (
  userRole?: string,
  userApprovalLimit?: number | null,
  transactionAmount: number = 0
): boolean => {
  if (!userRole) return false;

  // Only Finance Manager can approve (unlimited authority)
  if (userRole !== "FINANCE_MANAGER") {
    return false;
  }

  // Finance Manager has unlimited approval authority
  return true;

  return false;
};

// Get approval status badge
export const getApprovalStatusBadge = (
  requiresApproval: boolean,
  status: string
): JSX.Element => {
  if (requiresApproval && status === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <svg className="size-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
        Awaiting Approval
      </span>
    );
  }

  if (requiresApproval && status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
      <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
      </svg>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Inline approval action buttons component
export const InlineApprovalActions: React.FC<InlineApprovalProps> = ({
  transactionId,
  transactionType,
  requiresApproval,
  status,
  amount,
  userRole,
  userApprovalLimit,
  onApprovalSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);
  const api = useFinanceApi();

  const handleApprove = async () => {
    const { value: comments } = await Swal.fire({
      title: "Approve Transaction",
      input: "textarea",
      inputPlaceholder: "Add optional approval comments...",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      inputAttributes: {
        rows: 3,
      },
    });

    if (comments !== undefined) {
      setLoading(true);
      try {
        const response = await api.post(`/api/finance/session/approvals/${transactionId}/approve`, {
          comments: comments || null,
        });

        if (!response.ok) {
          throw new Error(response.error || `Approval failed`);
        }

        await Swal.fire({
          icon: "success",
          title: "Approved",
          text: "Transaction has been approved successfully",
          timer: 2000,
        });

        onApprovalSuccess?.();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to approve transaction",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: "Reject Transaction",
      input: "textarea",
      inputPlaceholder: "Reason for rejection (required)...",
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      inputAttributes: {
        rows: 3,
      },
    });

    if (reason !== undefined) {
      setLoading(true);
      try {
        const response = await api.post(`/api/finance/session/approvals/${transactionId}/reject`, {
          comments: reason,
        });

        if (!response.ok) {
          throw new Error(response.error || `Rejection failed`);
        }

        await Swal.fire({
          icon: "warning",
          title: "Rejected",
          text: "Transaction has been rejected",
          timer: 2000,
        });

        onApprovalSuccess?.();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to reject transaction",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const canApprove = canUserApprove(userRole, userApprovalLimit, amount);

  // Only show buttons if:
  // 1. Transaction requires approval
  // 2. Status is "draft" (pending)
  // 3. User has approval authority
  if (!requiresApproval || status !== "draft" || !canApprove) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Approve transaction"
        title="Approve"
      >
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Reject transaction"
        title="Reject"
      >
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
      </button>
    </div>
  );
};

// Informational badge for users without approval authority
export const ApprovalLimitInfo: React.FC<{
  userRole?: string;
  userApprovalLimit?: number | null;
  transactionAmount: number;
}> = ({ userRole, userApprovalLimit, transactionAmount }) => {
  const canApprove = canUserApprove(userRole, userApprovalLimit, transactionAmount);

  if (!userRole || canApprove) return null;

  if (userRole === "FINANCE_STAFF") {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
        Finance Staff cannot approve
      </span>
    );
  }

  return null;
};
