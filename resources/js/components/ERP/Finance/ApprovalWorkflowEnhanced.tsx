import React, { useState, useEffect, useMemo } from "react";
import { Head } from "@inertiajs/react";
import Swal from "sweetalert2";
import AppLayoutERP from "../../../layout/AppLayout_ERP";
import { useFinanceApi } from "../../../hooks/useFinanceApi";
import { usePendingApprovals, useApproveTransaction } from "../../../hooks/useFinanceQueries";

type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";
type ApprovalType = "expense" | "journal_entry" | "invoice" | "budget";

type StaffInfo = {
	name: string;
	position: string;
	employee_id: string;
};

type JobOrder = {
	id: string;
	customer: string;
	product: string;
	status: string;
};

type ApprovalLimitWarning = {
	type: "insufficient_limit" | "approaching_limit";
	message: string;
	transaction_amount: number;
	your_limit: number;
	difference?: number;
	percentage?: number;
};

type ApprovalRequest = {
	id: string;
	type: ApprovalType;
	reference: string;
	description: string;
	amount: number;
	requested_by: string;
	requested_at: string;
	status: ApprovalStatus;
	current_level: number;
	total_levels: number;
	reviewed_by?: string;
	reviewed_at?: string;
	comments?: string;
	metadata?: any;
	requires_higher_authority?: boolean;
	approval_limit_warning?: ApprovalLimitWarning;
	staff_info?: StaffInfo;
	job_order?: JobOrder;
};

type ApprovalHistory = {
	id: string;
	approval_id: string;
	level: number;
	reviewer: string;
	action: "approved" | "rejected";
	comments: string;
	reviewed_at: string;
};

// Icons
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
	</svg>
);

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
	</svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
	</svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
	</svg>
);

const ApprovalWorkflowEnhanced: React.FC = () => {
	const api = useFinanceApi();
	const { data: approvalData = [], isLoading, refetch: refetchApprovals } = usePendingApprovals();
	const approveTransactionMutation = useApproveTransaction();
	
	const approvalRequests = Array.isArray(approvalData) ? approvalData : [];
	
	const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
	const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
	const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
	const [filterType, setFilterType] = useState<ApprovalType | "all">("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		refetchApprovals();
	}, [activeTab, refetchApprovals]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterType, activeTab]);

	const handleApprove = async (request: ApprovalRequest) => {
		// Check if user has authority
		if (request.requires_higher_authority) {
			await Swal.fire({
				title: "Insufficient Authority",
				html: `
					<p class="text-sm text-gray-600 mb-4">You do not have sufficient approval authority for this transaction.</p>
					<p class="text-red-600 font-semibold">Transaction Amount: ${formatCurrency(request.amount)}</p>
					<p class="text-sm text-gray-600 mt-2">Please escalate to a manager with higher approval limits.</p>
				`,
				icon: "warning",
				confirmButtonColor: "#f59e0b"
			});
			return;
		}

		const { value: comments } = await Swal.fire({
			title: "Approve Request",
			html: `
				<p class="text-sm text-gray-600 mb-4">You are about to approve:</p>
				<p class="font-semibold">${request.reference}</p>
				<p class="text-sm text-gray-600 mb-2">${request.description}</p>
				<p class="text-lg font-bold text-green-600">${formatCurrency(request.amount)}</p>
				${request.approval_limit_warning?.type === 'approaching_limit' ? `
					<div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
						<p class="text-xs text-yellow-700">⚠️ ${request.approval_limit_warning.message}</p>
						<p class="text-xs text-yellow-600">This is ${request.approval_limit_warning.percentage}% of your approval limit</p>
					</div>
				` : ''}
			`,
			input: "textarea",
			inputLabel: "Comments (optional)",
			inputPlaceholder: "Add any comments about this approval...",
			showCancelButton: true,
			confirmButtonText: "Approve",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#10b981",
			customClass: {
				input: "text-sm"
			}
		});

		if (comments !== undefined) {
			try {
				const response = await api.post(`/api/finance/approvals/${request.id}/approve`, { comments });

				if (response.ok) {
					await Swal.fire({
						title: "Approved!",
						text: "The request has been approved successfully.",
						icon: "success",
						confirmButtonColor: "#10b981"
					});
					refetchApprovals();
					setSelectedRequest(null);
				} else {
					throw new Error(response.error || "Failed to approve request");
				}
			} catch (error) {
				await Swal.fire({
					title: "Error",
					text: error instanceof Error ? error.message : "Failed to approve the request. Please try again.",
					icon: "error",
					confirmButtonColor: "#d33"
				});
			}
		}
	};

	const handleReject = async (request: ApprovalRequest) => {
		const { value: comments } = await Swal.fire({
			title: "Reject Request",
			html: `
				<p class="text-sm text-gray-600 mb-4">You are about to reject:</p>
				<p class="font-semibold">${request.reference}</p>
				<p class="text-sm text-gray-600 mb-4">${request.description}</p>
			`,
			input: "textarea",
			inputLabel: "Reason for rejection (required)",
			inputPlaceholder: "Please provide a reason for rejecting this request...",
			inputValidator: (value) => {
				if (!value) {
					return "You must provide a reason for rejection!";
				}
			},
			showCancelButton: true,
			confirmButtonText: "Reject",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#ef4444",
			customClass: {
				input: "text-sm"
			}
		});

		if (comments) {
			try {
				const response = await api.post(`/api/finance/approvals/${request.id}/reject`, { comments });

				if (response.ok) {
					await Swal.fire({
						title: "Rejected",
						text: "The request has been rejected.",
						icon: "info",
						confirmButtonColor: "#2563eb"
					});
					refetchApprovals();
					setSelectedRequest(null);
				} else {
					throw new Error(response.error || "Failed to reject request");
				}
			} catch (error) {
				await Swal.fire({
					title: "Error",
					text: error instanceof Error ? error.message : "Failed to reject the request. Please try again.",
					icon: "error",
					confirmButtonColor: "#d33"
				});
			}
		}
	};

	const filteredRequests = useMemo(() => {
		return approvalRequests.filter((request: ApprovalRequest) => {
			const matchesType = filterType === "all" || request.type === filterType;
			const matchesSearch = !searchTerm || 
				request.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
				request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				request.requested_by.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesType && matchesSearch;
		});
	}, [approvalRequests, filterType, searchTerm]);

	const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("en-PH", {
			style: "currency",
			currency: "PHP",
			minimumFractionDigits: 2,
		}).format(value);

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const getStatusBadge = (status: ApprovalStatus) => {
		const badges = {
			pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
			approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
			rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
			cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
		};
		return badges[status];
	};

	const getTypeBadge = (type: ApprovalType) => {
		const badges = {
			expense: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
			journal_entry: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
			invoice: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
			budget: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
		};
		return badges[type];
	};

	return (
		<AppLayoutERP>
			<Head title="Enhanced Approval Workflow - Solespace ERP" />
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Approval Workflow</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Review and approve pending financial requests with full context
					</p>
				</div>

				{/* Enhanced Approval Table */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					{isLoading ? (
						<div className="p-12 text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-4 text-gray-600 dark:text-gray-400">Loading approvals...</p>
						</div>
					) : paginatedRequests.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-900">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff Info</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Order</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{paginatedRequests.map((request) => (
										<tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
											<td className="px-6 py-4">
												<div>
													<p className="font-medium text-gray-900 dark:text-white">{request.reference}</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">{request.description}</p>
													<span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(request.type)}`}>
														{request.type}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												{request.staff_info ? (
													<div className="flex items-start gap-2">
														<UserIcon className="size-5 text-gray-400 mt-0.5" />
														<div>
															<p className="text-sm font-medium text-gray-900 dark:text-white">{request.staff_info.name}</p>
															<p className="text-xs text-gray-600 dark:text-gray-400">{request.staff_info.position}</p>
															<p className="text-xs text-gray-500 dark:text-gray-500">ID: {request.staff_info.employee_id}</p>
														</div>
													</div>
												) : (
													<span className="text-sm text-gray-500">N/A</span>
												)}
											</td>
											<td className="px-6 py-4">
												{request.job_order ? (
													<div className="flex items-start gap-2">
														<BriefcaseIcon className="size-5 text-blue-500 mt-0.5" />
														<div>
															<p className="text-sm font-medium text-gray-900 dark:text-white">{request.job_order.customer}</p>
															<p className="text-xs text-gray-600 dark:text-gray-400">{request.job_order.product}</p>
															<span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
																{request.job_order.status}
															</span>
														</div>
													</div>
												) : (
													<span className="text-sm text-gray-500">No Job</span>
												)}
											</td>
											<td className="px-6 py-4">
												<div>
													<p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(request.amount)}</p>
													{request.approval_limit_warning && (
														<div className={`mt-1 flex items-center gap-1 text-xs ${
															request.approval_limit_warning.type === 'insufficient_limit' 
																? 'text-red-600 dark:text-red-400' 
																: 'text-yellow-600 dark:text-yellow-400'
														}`}>
															<ExclamationIcon className="size-4" />
															<span>{request.approval_limit_warning.message}</span>
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
													{request.status}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-center gap-2">
													{request.status === 'pending' && !request.requires_higher_authority && (
														<>
															<button
																onClick={() => handleApprove(request)}
																className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
																title="Approve"
															>
																<CheckIcon className="size-5" />
															</button>
															<button
																onClick={() => handleReject(request)}
																className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
																title="Reject"
															>
																<XIcon className="size-5" />
															</button>
														</>
													)}
													{request.requires_higher_authority && (
														<span className="text-xs text-red-600 dark:text-red-400 font-medium">
															Higher Authority Required
														</span>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="p-12 text-center">
							<ClockIcon className="size-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								No pending approvals
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								There are no pending approval requests at this time.
							</p>
						</div>
					)}
				</div>
			</div>
		</AppLayoutERP>
	);
};

export default ApprovalWorkflowEnhanced;
