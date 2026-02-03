import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { usePage } from '@inertiajs/react';
import { useFinanceApi } from "../../../hooks/useFinanceApi";
import { InlineApprovalActions, getApprovalStatusBadge, ApprovalLimitInfo } from "./InlineApprovalUtils";

type JournalEntryStatus = "draft" | "posted" | "void";
type TaxCategory = "GST" | "VAT" | "No Tax" | "Exempt";

type JournalLine = {
	id: string;
	account_id: string;
	account_code: string;
	account_name: string;
	debit: number | string;
	credit: number | string;
	memo: string;
	tax: TaxCategory;
};

type JournalEntry = {
	id: string;
	reference: string;
	date: string;
	description: string;
	lines: JournalLine[];
	status: JournalEntryStatus;
	posted_by?: string;
	posted_at?: string;
	void_reason?: string;
	created_at: string;
	updated_at: string;
	linked_invoice_id?: string;
	linked_expense_id?: string;
	approval_notes?: string;
	edit_history?: EditHistory[];
};

type EditHistory = {
	changed_by: string;
	changed_at: string;
	changes: string;
};

type Account = {
	id: string;
	code: string;
	name: string;
	type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
	normalBalance: "Debit" | "Credit";
	balance: number;
	active: boolean;
};

type MetricCardProps = {
	title: string;
	value: number | string;
	change?: number;
	changeType?: "increase" | "decrease";
	description?: string;
	color?: "success" | "error" | "warning" | "info";
	icon: React.FC<{ className?: string }>;
};

// load accounts and journal entries from backend API

// Icon Components
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
	</svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-5.002-4.5-10.747-10-10.747z" />
	</svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
	</svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
	</svg>
);

const BalanceCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const BalanceWarningIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
	</svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
	</svg>
);

const ArchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
	</svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
	</svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
	</svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
	</svg>
);

const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
	</svg>
);

// Portal wrapper
const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	if (typeof document === "undefined") return null;
	return createPortal(children, document.body);
};

// Custom account select to avoid native dropdown white panel in dark mode
const AccountSelect: React.FC<{
	value: string;
	accounts: Account[];
	onSelect: (account: Account) => void;
	placeholder?: string;
}> = ({ value, accounts, onSelect, placeholder = 'Select account...' }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onDoc = (e: MouseEvent) => {
			if (!ref.current) return;
			if (!ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onDoc);
		return () => document.removeEventListener('mousedown', onDoc);
	}, []);

	const selected = accounts.find((a) => String(a.id) === String(value));

	return (
		<div ref={ref} className="relative inline-block w-full">
			<button
				type="button"
				onClick={() => setOpen((s) => !s)}
				className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white flex items-center justify-between"
			>
				<span className="truncate">{selected ? `${selected.code} - ${selected.name}` : placeholder}</span>
				<svg className="ml-2 size-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4" />
				</svg>
			</button>

			{open && (
				<ul className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded bg-white dark:bg-[#0f1726] border border-gray-200 dark:border-gray-700 shadow-lg">
					{accounts.map((acct) => (
						<li
							key={acct.id}
							onClick={() => {
								onSelect(acct);
								setOpen(false);
							}}
							className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm text-gray-900 dark:text-white"
						>
							{acct.code} - {acct.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

// Button Component
const Button: React.FC<{
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "success" | "danger" | "warning";
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
	size?: "sm" | "md" | "lg";
	icon?: React.FC<{ className?: string }>;
}> = ({ children, variant = "primary", onClick, className = "", disabled = false, size = "md", icon: Icon }) => {
	const baseClasses = "transition-colors duration-200 font-medium flex items-center gap-2 justify-center";
	const sizeClasses = {
		sm: "px-3 py-1 text-sm rounded-md",
		md: "px-4 py-2 rounded-lg text-base",
		lg: "px-6 py-3 rounded-lg text-lg",
	} as const;
	const variantClasses = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
		secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",
		success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
		danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
		warning: "bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400",
	} as const;

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
		>
			{Icon && <Icon className="size-4" />}
			{children}
		</button>
	);
};

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	change,
	changeType,
	icon: Icon,
	color = "info",
	description,
}) => {
	const getColorClasses = () => {
		switch (color) {
			case "success":
				return "from-green-500 to-emerald-600";
			case "error":
				return "from-red-500 to-rose-600";
			case "warning":
				return "from-yellow-500 to-orange-600";
			case "info":
			default:
				return "from-blue-500 to-indigo-600";
		}
	};

	return (
		<div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
			<div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

			<div className="relative">
				<div className="flex items-center justify-between mb-4">
					<div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
						<Icon className="text-white size-7 drop-shadow-sm" />
					</div>

					{change !== undefined && changeType && (
						<div
							className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
								changeType === "increase"
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							}`}
						>
							{changeType === "increase" ? (
								<ArrowUpIcon className="size-3" />
							) : (
								<ArrowDownIcon className="size-3" />
							)}
							{Math.abs(change)}%
						</div>
					)}
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
					<h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
						{typeof value === "number" ? value.toLocaleString() : value}
					</h3>
					{description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
				</div>
			</div>
		</div>
	);
};

// Status Badge Component
const StatusBadge: React.FC<{ status: JournalEntryStatus }> = ({ status }) => {
	const statusMap = {
		draft: { bg: "bg-yellow-100", text: "text-yellow-800", darkBg: "dark:bg-yellow-900", darkText: "dark:text-yellow-200", label: "Draft" },
		posted: { bg: "bg-green-100", text: "text-green-800", darkBg: "dark:bg-green-900", darkText: "dark:text-green-200", label: "Posted" },
		void: { bg: "bg-red-100", text: "text-red-800", darkBg: "dark:bg-red-900", darkText: "dark:text-red-200", label: "Void" },
	};

	const current = statusMap[status];
	return (
		<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text} ${current.darkBg} ${current.darkText}`}>
			{current.label}
		</span>
	);
};

// Main Journal Entries Component
export const JournalEntries: React.FC<{ entries?: JournalEntry[] }> = ({ entries }) => {
	const page = usePage();
	const user = page.props.auth?.user as any;

	const canUserPost = () => {
		if (!user) return false;
		return String(user.role || "").toUpperCase() === "FINANCE_MANAGER";
	};

	const canUserReverse = () => {
		if (!user) return false;
		return String(user.role || "").toUpperCase() === "FINANCE_MANAGER";
	};
	
	const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(entries && entries.length > 0 ? entries : []);
	const [filterStatus, setFilterStatus] = useState<JournalEntryStatus | "all">("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
	const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
	const [entryToReverse, setEntryToReverse] = useState<JournalEntry | null>(null);
	const [reverseReason, setReverseReason] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Form state
	const [formReference, setFormReference] = useState("");
	const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
	const [formDescription, setFormDescription] = useState("");
	const [formLines, setFormLines] = useState<JournalLine[]>([
		{ id: "1", account_id: "", account_code: "", account_name: "", debit: 0, credit: 0, memo: "", tax: "No Tax" },
		{ id: "2", account_id: "", account_code: "", account_name: "", debit: 0, credit: 0, memo: "", tax: "No Tax" },
	]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// fetch accounts and journal entries from API
	const { auth } = usePage().props as any;
	const isAuthenticated = Boolean(auth && auth.user);
	const api = useFinanceApi();

	useEffect(() => {
		(async () => {
		try {
			// Accounts
			const accountsResponse = await api.get('/api/finance/accounts');
			if (accountsResponse.ok) {
				setAccounts(accountsResponse.data?.data ?? accountsResponse.data);
			}

			// Journal entries
			const journalResponse = await api.get('/api/finance/journal-entries');
			if (journalResponse.ok) {
				setJournalEntries(journalResponse.data?.data ?? journalResponse.data);
			}
		} catch (err) {
			// Silent fail - will show empty state
		} finally {
			setIsLoading(false);
		}
	})();
}, []);

	// Inject dark-mode select styling once so native dropdown panels match dark theme
	useEffect(() => {
		if (typeof document === 'undefined') return;
		if (document.getElementById('ss-finance-modal-select-style')) return;
		const style = document.createElement('style');
		style.id = 'ss-finance-modal-select-style';
		style.innerHTML = `
			/* Dark-mode styling for modal select dropdowns */
			.modal-select { background-color: white; }
			.dark .modal-select { background-color: rgba(15,23,42,1) !important; color: #fff !important; }
			.dark .modal-select option { background-color: rgba(15,23,42,1) !important; color: #fff !important; }
			/* ensure select caret and focus ring remain visible */
			.dark .modal-select:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.2) !important; }
		`;
		document.head.appendChild(style);
	}, []);

	// Filtered entries
	const filteredEntries = useMemo(() => {
		return journalEntries.filter((entry) => {
			const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
			const matchesSearch =
				entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
				entry.description.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesStatus && matchesSearch;
		});
	}, [journalEntries, filterStatus, searchTerm]);

	// Pagination logic
	const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

	// Reset to page 1 when filters change
	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterStatus]);

	// Calculate totals for an entry
	const calculateTotals = (lines: JournalLine[]) => {
		const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
		const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
		const difference = totalDebit - totalCredit;
		return { totalDebit, totalCredit, difference };
	};

	// Form totals
	const formTotals = calculateTotals(formLines);
	const isBalanced = formTotals.difference === 0 && formTotals.totalDebit > 0 && formTotals.totalCredit > 0;

	// Validate form
	const validateForm = () => {
		const errors: string[] = [];

		if (!formReference.trim()) errors.push("Reference is required");
		if (!formDate) errors.push("Date is required");
		if (!formDescription.trim()) errors.push("Description is required");
		if (formLines.length < 2) errors.push("At least 2 journal lines are required");

		const emptyLines = formLines.filter((line) => !line.account_id);
		if (emptyLines.length > 0) errors.push(`${emptyLines.length} line(s) have missing account`);

		if (formTotals.difference !== 0) errors.push(`Debit and Credit must be equal (Difference: ${Math.abs(formTotals.difference).toFixed(2)})`);

		setValidationErrors(errors);
		return errors.length === 0;
	};

	// Reset form
	const resetForm = () => {
		setFormReference("");
		setFormDate(new Date().toISOString().split("T")[0]);
		setFormDescription("");
		setFormLines([
			{ id: "1", account_id: "", account_code: "", account_name: "", debit: 0, credit: 0, memo: "", tax: "No Tax" },
			{ id: "2", account_id: "", account_code: "", account_name: "", debit: 0, credit: 0, memo: "", tax: "No Tax" },
		]);
		setValidationErrors([]);
	};

	// Save draft
	const handleSaveDraft = async () => {
		if (!validateForm()) return;

		try {
			const payload = {
				reference: formReference,
				date: formDate,
				description: formDescription,
				lines: formLines.map((l) => ({
					account_id: Number(l.account_id) || l.account_id,
					debit: Number(l.debit) || 0,
					credit: Number(l.credit) || 0,
					memo: l.memo || null,
				})),
			};

			const response = await api.post('/api/finance/journal-entries', payload);

			if (response.ok) {
				const entry = response.data?.data ?? response.data;
				setJournalEntries([entry, ...journalEntries]);
				resetForm();
				setIsCreateModalOpen(false);
				Swal.fire({ icon: 'success', title: 'Success', text: 'Journal entry saved as draft', timer: 1500 });
				return;
			}

			Swal.fire({ icon: 'error', title: 'Save Failed', text: response.error || 'Failed to save entry' });
		} catch (e) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save draft (network error).' });
		}
	};

	// Update draft entry
	const handleUpdateDraft = async () => {
		if (!validateForm() || !editingEntry) return;

		const payload = {
			reference: formReference,
			date: formDate,
			description: formDescription,
			lines: formLines.map((l) => ({
				account_id: Number(l.account_id) || l.account_id,
				debit: Number(l.debit) || 0,
				credit: Number(l.credit) || 0,
				memo: l.memo || null,
			})),
		};

		try {
			const response = await api.patch(`/api/finance/journal-entries/${editingEntry.id}`, payload);

			if (response.ok) {
				const updated = response.data?.data ?? response.data;
				setJournalEntries(journalEntries.map((e) => (e.id === editingEntry.id ? updated : e)));
				resetForm();
				setIsEditModalOpen(false);
				setEditingEntry(null);
				Swal.fire({ icon: 'success', title: 'Updated', text: 'Journal entry has been updated', timer: 2000 });
				return;
			}

			Swal.fire({ icon: 'error', title: 'Update Failed', text: response.error || 'Failed to update entry' });
			return;

			// If not authenticated, update locally only
			const updatedEntry: JournalEntry = {
				...editingEntry,
				reference: formReference,
				date: formDate,
				description: formDescription,
				lines: formLines,
				updated_at: new Date().toISOString(),
			};

			setJournalEntries(journalEntries.map((e) => (e.id === editingEntry.id ? updatedEntry : e)));
			resetForm();
			setIsEditModalOpen(false);
			setEditingEntry(null);
			Swal.fire({ icon: 'success', title: 'Updated', text: 'Journal entry has been updated', timer: 2000 });
		} catch (e) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update draft (network error).' });
		}
	};

	// Post entry
	const handlePostEntry = async (entry: JournalEntry) => {
		const totals = calculateTotals(entry.lines);
		if (totals.difference !== 0) {
			Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Cannot post: Debit and Credit must be equal' });
			return;
		}

		try {
			const response = await api.post(`/api/finance/journal-entries/${entry.id}/post`);

			if (response.ok) {
				const updatedEntry = response.data?.data ?? response.data;
				setJournalEntries((prev) => prev.map((e) => (e.id === entry.id ? updatedEntry : e)));
				setIsViewModalOpen(false);
				Swal.fire({ icon: 'success', title: 'Posted', text: 'Journal entry has been posted successfully', timer: 1500 });
				return;
			}

			Swal.fire({ icon: 'error', title: 'Post Failed', text: response.error || 'Failed to post entry' });
			return;
		} catch (e) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to post entry (network error).' });
		}
	};

	// Reverse entry
	const handleReverseEntry = (entry: JournalEntry) => {
		setEntryToReverse(entry);
		setReverseReason("");
		setIsViewModalOpen(false);
		setIsReverseModalOpen(true);
	};

	// Confirm reverse entry
	const handleConfirmReverse = async () => {
		if (!entryToReverse || !reverseReason.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Reason Required",
				text: "Please provide a reason for reversing this entry",
			});
			return;
		}

		try {
			const response = await api.post(`/api/finance/journal-entries/${entryToReverse.id}/reverse`, {
				reason: reverseReason,
			});

			if (response.ok) {
				const rev = response.data?.reversal ?? response.data;
				setJournalEntries((prev) => [rev, ...prev.map((e) => (e.id === entryToReverse.id ? { ...e, status: 'void', void_reason: reverseReason } : e))]);
				setIsReverseModalOpen(false);
				setEntryToReverse(null);
				setReverseReason("");
				Swal.fire({ icon: 'success', title: 'Reversed', text: 'Journal entry has been reversed', timer: 2000 });
				return;
			}

			Swal.fire({ icon: 'error', title: 'Reverse Failed', text: response.error || 'Failed to reverse entry' });
			return;

			// Local fallback
			const reversingLines = entryToReverse.lines.map((line) => ({
				...line,
				id: `rev-${line.id}`,
				debit: line.credit,
				credit: line.debit,
			}));

			const reversingEntry: JournalEntry = {
				id: `JE${Date.now()}`,
				reference: `${entryToReverse.reference}-REV`,
				date: new Date().toISOString().split("T")[0],
				description: `Reversal of ${entryToReverse.reference}: ${reverseReason}`,
				lines: reversingLines,
				status: "posted",
				posted_by: "Current User",
				posted_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const updated = journalEntries.map((e) =>
				e.id === entryToReverse.id
					? {
						  ...e,
						  status: "void" as JournalEntryStatus,
						  void_reason: reverseReason,
						  updated_at: new Date().toISOString(),
					  }
					: e
			);

			setJournalEntries([reversingEntry, ...updated]);
			setIsReverseModalOpen(false);
			setEntryToReverse(null);
			setReverseReason("");

			Swal.fire({
				icon: "success",
				title: "Reversed",
				text: "Journal entry has been reversed with a reversing entry",
				timer: 2000,
			});
		} catch (e) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to reverse entry (network error).' });
		}
	};

	// Delete entry
	const handleDeleteEntry = async (id: string) => {
		const result = await Swal.fire({
			title: 'Delete Entry',
			text: 'Are you sure? Only draft entries can be deleted.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete',
			confirmButtonColor: '#dc2626',
		});

		if (!result.isConfirmed) return;

		const entry = journalEntries.find((e) => e.id === id);
		if (entry && entry.status !== 'draft') {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Only draft entries can be deleted' });
			return;
		}

		try {
			const response = await api.delete(`/api/finance/journal-entries/${id}`);

			if (response.ok) {
				setJournalEntries((prev) => prev.filter((e) => e.id !== id));
				Swal.fire({ icon: 'success', title: 'Deleted', text: 'Entry has been deleted', timer: 2000 });
				return;
			}

			Swal.fire({ icon: 'error', title: 'Delete Failed', text: response.error || 'Failed to delete entry' });
			return;
		} catch (e) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete entry (network error).' });
		}
	};

	// Add line
	const handleAddLine = () => {
		const newId = Math.max(...formLines.map((l) => parseInt(l.id) || 0), 0) + 1;
		setFormLines([
			...formLines,
			{ id: String(newId), account_id: "", account_code: "", account_name: "", debit: 0, credit: 0, memo: "", tax: "No Tax" },
		]);
	};

	// Remove line
	const handleRemoveLine = (id: string) => {
		if (formLines.length > 2) {
			setFormLines(formLines.filter((line) => line.id !== id));
		}
	};

	// Update line
	const handleUpdateLine = (id: string, updates: Partial<JournalLine>) => {
		setFormLines(formLines.map((line) => (line.id === id ? { ...line, ...updates } : line)));
	};

	// Statistics
	const stats = {
		totalEntries: journalEntries.length,
		draftEntries: journalEntries.filter((e) => e.status === "draft").length,
		postedEntries: journalEntries.filter((e) => e.status === "posted").length,
		totalPostedAmount: journalEntries
			.filter((e) => e.status === "posted")
			.reduce((sum, e) => sum + calculateTotals(e.lines).totalDebit, 0),
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-24 gap-4">
					<div className="relative w-12 h-12">
						<div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600"></div>
						<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
					</div>
					<p className="text-gray-600 dark:text-gray-300 font-medium">Loading journal entries...</p>
				</div>
			) : (
				<>
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Journal Entries</h1>
								<p className="text-gray-600 dark:text-gray-400">Create and manage double-entry journal entries for your GL accounts</p>
							</div>
							<Button
								variant="primary"
								size="md"
								icon={PlusIcon}
								onClick={() => {
									resetForm();
									setIsCreateModalOpen(true);
								}}
							>
								New Entry
							</Button>
						</div>
					</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<MetricCard
					title="Total Entries"
					value={stats.totalEntries}
					icon={BookIcon}
					color="info"
					description="All journal entries"
				/>
				<MetricCard
					title="Draft Entries"
					value={stats.draftEntries}
					icon={EditIcon}
					color="warning"
					description="Pending posting"
				/>
				<MetricCard
					title="Posted Entries"
					value={stats.postedEntries}
					icon={CheckIcon}
					color="success"
					description="Successfully posted"
				/>
				<MetricCard
					title="Posted Amount"
					value={`₱${stats.totalPostedAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
					icon={BookIcon}
					color="success"
					description="Total debits posted"
				/>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
						<input
							type="text"
							placeholder="Search by reference or description..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value as JournalEntryStatus | "all")}
							aria-label="Filter by status"
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Statuses</option>
							<option value="draft">Draft</option>
							<option value="posted">Posted</option>
							<option value="void">Void</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200 dark:border-gray-700">
							<th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Reference</th>
							<th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
							<th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
							<th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Debit</th>
							<th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Credit</th>
							<th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
							<th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
						</tr>
					</thead>
					<tbody>
						{paginatedEntries.length > 0 ? (
							paginatedEntries.map((entry) => {
								const totals = calculateTotals(entry.lines);
								return (
									<tr
										key={entry.id}
										className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-200"
									>
										<td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">{entry.reference}</td>
										<td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
											{new Date(entry.date).toLocaleDateString()}
										</td>
										<td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{entry.description}</td>
										<td className="py-4 px-6 text-sm text-right text-gray-900 dark:text-white">
											₱{totals.totalDebit.toFixed(2)}
										</td>
										<td className="py-4 px-6 text-sm text-right text-gray-900 dark:text-white">
											₱{totals.totalCredit.toFixed(2)}
										</td>
										<td className="py-4 px-6 text-sm text-center">
											{getApprovalStatusBadge(false, entry.status)}
										</td>
										<td className="py-4 px-6 text-center">
											<div className="flex justify-center gap-2">
												<InlineApprovalActions
													transactionId={entry.id}
													transactionType="journal_entry"
													requiresApproval={false}
													status={entry.status}
													amount={calculateTotals(entry.lines).totalDebit}
													userRole={user?.role}
													userApprovalLimit={user?.approval_limit}
													onApprovalSuccess={() => {
														window.location.reload();
													}}
												/>
												<button
													onClick={() => {
														setSelectedEntry(entry);
														setIsViewModalOpen(true);
													}}
													className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
													title="View"
												>
													<EyeIcon className="size-5" />
												</button>
												{entry.status === "draft" && (
													<button
														onClick={() => {
															setEditingEntry(entry);
															setFormReference(entry.reference);
															setFormDate(entry.date);
															setFormDescription(entry.description);
															setFormLines(entry.lines);
															setIsEditModalOpen(true);
														}}
														className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
														title="Edit"
													>
														<EditIcon className="size-5" />
													</button>
												)}
												{entry.status === "draft" && (
													<button
														onClick={() => handleDeleteEntry(entry.id)}
														className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
														title="Delete"
													>
														<TrashIcon className="size-5" />
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
									No journal entries found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{filteredEntries.length > 0 && (
				<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
					<div className="text-sm text-gray-600 dark:text-gray-400">
						Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
						<span className="font-medium">{Math.min(endIndex, filteredEntries.length)}</span> of{" "}
						<span className="font-medium">{filteredEntries.length}</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
						>
							Previous
						</button>
						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((page) => {
									if (totalPages <= 7) return true;
									if (page === 1 || page === totalPages) return true;
									if (page >= currentPage - 1 && page <= currentPage + 1) return true;
									return false;
								})
								.map((page, idx, arr) => (
									<React.Fragment key={page}>
										{idx > 0 && arr[idx - 1] !== page - 1 && (
											<span className="px-2 text-gray-500">...</span>
										)}
										<button
											onClick={() => setCurrentPage(page)}
											className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												currentPage === page
													? "bg-blue-600 text-white"
													: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
											}`}
										>
											{page}
										</button>
									</React.Fragment>
								))}
						</div>
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
						>
							Next
						</button>
					</div>
				</div>
			)}

			{/* View Modal */}
			{isViewModalOpen && selectedEntry && (
				<ModalPortal>
					<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="border-b border-gray-200 dark:border-gray-800 p-6 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEntry.reference}</h2>
									<p className="text-gray-600 dark:text-gray-400 mt-1">{selectedEntry.description}</p>
								</div>
								<button
									onClick={() => setIsViewModalOpen(false)}
									className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
								>
									✕
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6 space-y-6">
								{/* Info Row */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Date</p>
										<p className="text-lg font-semibold text-gray-900 dark:text-white">
											{new Date(selectedEntry.date).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Status</p>
										<div className="mt-2">
											<StatusBadge status={selectedEntry.status} />
										</div>
									</div>
									{selectedEntry.posted_by && (
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Posted By</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEntry.posted_by}</p>
										</div>
									)}
									{selectedEntry.posted_at && (
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Posted At</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-white">
												{new Date(selectedEntry.posted_at).toLocaleString()}
											</p>
										</div>
									)}
								</div>

								{/* Lines Table */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Journal Lines</h3>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-gray-200 dark:border-gray-700">
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Account Code</th>
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Account Name</th>
													<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Debit</th>
													<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Credit</th>
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Memo</th>
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Tax</th>
												</tr>
											</thead>
											<tbody>
												{selectedEntry.lines.map((line) => (
													<tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
														<td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{line.account_code}</td>
														<td className="py-3 px-4 text-gray-600 dark:text-gray-400">{line.account_name}</td>
														<td className="py-3 px-4 text-right text-gray-900 dark:text-white">
															{Number(line.debit) > 0 ? `₱${Number(line.debit).toFixed(2)}` : "—"}
														</td>
														<td className="py-3 px-4 text-right text-gray-900 dark:text-white">
															{Number(line.credit) > 0 ? `₱${Number(line.credit).toFixed(2)}` : "—"}
														</td>
														<td className="py-3 px-4 text-gray-600 dark:text-gray-400">{line.memo}</td>
														<td className="py-3 px-4 text-gray-600 dark:text-gray-400">{line.tax}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Totals Row */}
									<div className="mt-4 border-t-2 border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-16">
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Debit</p>
											<p className="text-xl font-bold text-gray-900 dark:text-white">
												₱{calculateTotals(selectedEntry.lines).totalDebit.toFixed(2)}
											</p>
										</div>
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Credit</p>
											<p className="text-xl font-bold text-gray-900 dark:text-white">
												₱{calculateTotals(selectedEntry.lines).totalCredit.toFixed(2)}
											</p>
										</div>
									</div>
								</div>

								{/* Approval Notes */}
								{selectedEntry.approval_notes && (
									<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
										<p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">Approval Notes</p>
										<p className="text-blue-900 dark:text-blue-200 mt-2">{selectedEntry.approval_notes}</p>
									</div>
								)}

								{/* Edit History */}
								{selectedEntry.edit_history && selectedEntry.edit_history.length > 0 && (
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit History</h3>
										<div className="space-y-3">
											{selectedEntry.edit_history.map((history, idx) => (
												<div
													key={idx}
													className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm"
												>
													<p className="font-medium text-gray-900 dark:text-white">{history.changed_by}</p>
													<p className="text-gray-600 dark:text-gray-400">
														{new Date(history.changed_at).toLocaleString()}
													</p>
													<p className="text-gray-700 dark:text-gray-300 mt-2">{history.changes}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Modal Footer */}
							<div className="border-t border-gray-200 dark:border-gray-800 p-6 flex justify-end gap-3 bg-gray-50 dark:bg-white/[0.02]">
								{selectedEntry.status === "draft" && canUserPost() && (
									<Button variant="success" onClick={() => handlePostEntry(selectedEntry)} icon={CheckIcon}>
										Post Entry
									</Button>
								)}
								{selectedEntry.status === "posted" && canUserReverse() && (
									<Button variant="warning" onClick={() => handleReverseEntry(selectedEntry)} icon={ArchiveIcon}>
										Reverse Entry
									</Button>
								)}
								<Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
									Close
								</Button>
							</div>
						</div>
					</div>
				</ModalPortal>
			)}

					{/* Edit Modal */}
					{isEditModalOpen && editingEntry && (
						<ModalPortal>
							<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
								<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
									{/* Modal Header */}
									<div className="border-b border-gray-200 dark:border-gray-800 p-6 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Journal Entry</h2>
										<button
											onClick={() => {
												setIsEditModalOpen(false);
												setEditingEntry(null);
												resetForm();
											}}
											className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
										>
											✕
										</button>
									</div>

									{/* Modal Content */}
									<div className="p-6 space-y-6">
										{/* Validation Errors */}
										{validationErrors.length > 0 && (
											<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
												<div className="flex gap-3">
													<AlertCircleIcon className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
													<div>
														<h4 className="font-semibold text-red-900 dark:text-red-200">Validation Errors</h4>
														<ul className="list-disc list-inside text-red-800 dark:text-red-300 mt-2 text-sm">
															{validationErrors.map((error, idx) => (
																<li key={idx}>{error}</li>
															))}
														</ul>
													</div>
												</div>
											</div>
										)}

										{/* Form Fields */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Reference <span className="text-red-600">*</span>
												</label>
												<input
													type="text"
													value={formReference}
													onChange={(e) => setFormReference(e.target.value)}
													placeholder="e.g., JE-2026-001"
													aria-label="Reference"
													className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Date <span className="text-red-600">*</span>
												</label>
												<input
													type="date"
													value={formDate}
													onChange={(e) => setFormDate(e.target.value)}
													aria-label="Date"
													className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Description <span className="text-red-600">*</span>
											</label>
											<input
												type="text"
												value={formDescription}
												onChange={(e) => setFormDescription(e.target.value)}
												placeholder="e.g., Monthly rent payment"
												className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										{/* Journal Lines */}
										<div>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Journal Lines</h3>
											<div className="overflow-x-auto">
												<table className="w-full text-sm">
													<thead>
														<tr className="border-b border-gray-200 dark:border-gray-700">
															<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Account</th>
															<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Debit</th>
															<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Credit</th>
															<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Memo</th>
															<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Tax</th>
															<th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300"></th>
														</tr>
													</thead>
													<tbody>
														{formLines.map((line) => (
															<tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
																<td className="py-3 px-4">
																	<AccountSelect
																		value={line.account_id}
																		accounts={accounts}
																		onSelect={(account) =>
																			handleUpdateLine(line.id, {
																				account_id: account.id,
																				account_code: account.code,
																				account_name: account.name,
																			})
																		}
																	/>
																</td>
																<td className="py-3 px-4">
																	<input
																		type="number"
																		value={line.debit || ""}
																		onChange={(e) =>
																			handleUpdateLine(line.id, { debit: parseFloat(e.target.value) || 0 })
																		}
																		placeholder="0.00"
																		className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-right text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
																	/>
																</td>
																<td className="py-3 px-4">
																	<input
																		type="number"
																		value={line.credit || ""}
																		onChange={(e) =>
																			handleUpdateLine(line.id, { credit: parseFloat(e.target.value) || 0 })
																		}
																		placeholder="0.00"
																		className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-right text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
																	/>
																</td>
																<td className="py-3 px-4">
																	<input
																		type="text"
																		value={line.memo}
																		onChange={(e) => handleUpdateLine(line.id, { memo: e.target.value })}
																		placeholder="Memo..."
																		className="modal-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
																	/>
																</td>
																<td className="py-3 px-4">
																	<select
																		value={line.tax}
																		onChange={(e) =>
																			handleUpdateLine(line.id, { tax: e.target.value as TaxCategory })
																		}
																		className="modal-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
																		aria-label="Tax"
																	>
																		<option>No Tax</option>
																		<option>GST</option>
																		<option>VAT</option>
																		<option>Exempt</option>
																	</select>
																</td>
																<td className="py-3 px-4 text-center">
																	{formLines.length > 2 && (
																		<button
																			onClick={() => handleRemoveLine(line.id)}
																			className="text-red-600 hover:text-red-700"
																			aria-label="Remove line"
																		>
																			<TrashIcon className="size-4" />
																		</button>
																	)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>

											{/* Real-Time Balance Validation */}
											{formTotals.totalDebit > 0 || formTotals.totalCredit > 0 ? (
												<div className={`mt-4 mb-4 rounded-lg border-2 p-4 transition-all duration-300 ${
													isBalanced
														? "border-green-500 bg-green-50 dark:bg-green-900/20"
														: "border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
												}`}>
													<div className="flex items-center gap-3">
														{isBalanced ? (
															<BalanceCheckIcon className="size-6 text-green-600 dark:text-green-400 flex-shrink-0" />
														) : (
															<BalanceWarningIcon className="size-6 text-red-600 dark:text-red-400 flex-shrink-0" />
														)}
														<div className="flex-1">
															{isBalanced ? (
																<>
																	<p className="font-semibold text-green-900 dark:text-green-200">✓ Entry is Balanced</p>
																	<p className="text-sm text-green-800 dark:text-green-300 mt-0.5">Debits and credits are equal. Ready to save!</p>
																</>
															) : (
																<>
																	<p className="font-semibold text-red-900 dark:text-red-200">⚠ Entry is Not Balanced</p>
																	<p className="text-sm text-red-800 dark:text-red-300 mt-0.5">
																		Difference: ₱{Math.abs(formTotals.difference).toFixed(2)}
																		{formTotals.totalDebit > formTotals.totalCredit ? " - Add more credits" : " - Add more debits"}
																	</p>
																</>
															)}
														</div>
													</div>
												</div>
											) : null}

											{/* Totals & Add Line */}
											<div className="mt-4">
												<div className="flex justify-between mb-4 border-t-2 border-gray-200 dark:border-gray-700 pt-4">
													<div className="flex-1">
														<Button variant="secondary" size="sm" onClick={handleAddLine} icon={PlusIcon}>
															Add Line
														</Button>
													</div>
													<div className="flex gap-8">
														<div>
															<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Debit</p>
															<p className="text-xl font-bold text-gray-900 dark:text-white">
																₱{formTotals.totalDebit.toFixed(2)}
															</p>
														</div>
														<div>
															<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Credit</p>
															<p className="text-xl font-bold text-gray-900 dark:text-white">
																₱{formTotals.totalCredit.toFixed(2)}
															</p>
														</div>
														<div>
															<p className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
																Difference
															</p>
															<p
																className={`text-xl font-bold ${
																	formTotals.difference === 0
																		? "text-green-600 dark:text-green-400"
																		: "text-red-600 dark:text-red-400"
																}`}
															>
																₱{Math.abs(formTotals.difference).toFixed(2)}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Modal Footer */}
									<div className="border-t border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center gap-3 bg-gray-50 dark:bg-white/[0.02]">
										<div className="flex items-center gap-2">
											{!isBalanced && (
												<span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
													<BalanceWarningIcon className="size-4" />
													Entry must be balanced to save
												</span>
											)}
										</div>
										<div className="flex gap-3">
											<Button variant="secondary" onClick={() => {
												setIsEditModalOpen(false);
												setEditingEntry(null);
												resetForm();
											}}>
												Cancel
											</Button>
											<Button variant="success" onClick={handleUpdateDraft} icon={CheckIcon} disabled={!isBalanced}>
												Update Draft
											</Button>
										</div>
									</div>
								</div>
							</div>
						</ModalPortal>
					)}

			{/* Create Modal */}
			{isCreateModalOpen && (
				<ModalPortal>
					<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="border-b border-gray-200 dark:border-gray-800 p-6 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Journal Entry</h2>
								<button
									onClick={() => {
										setIsCreateModalOpen(false);
										resetForm();
									}}
									className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
								>
									✕
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6 space-y-6">
								{/* Validation Errors */}
								{validationErrors.length > 0 && (
									<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
										<div className="flex gap-3">
											<AlertCircleIcon className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
											<div>
												<h4 className="font-semibold text-red-900 dark:text-red-200">Validation Errors</h4>
												<ul className="list-disc list-inside text-red-800 dark:text-red-300 mt-2 text-sm">
													{validationErrors.map((error, idx) => (
														<li key={idx}>{error}</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}

								{/* Form Fields */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Reference <span className="text-red-600">*</span>
										</label>
										<input
											type="text"
											value={formReference}
											onChange={(e) => setFormReference(e.target.value)}
											placeholder="e.g., JE-2026-001"
											aria-label="Reference"
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Date <span className="text-red-600">*</span>
										</label>
										<input
											type="date"
											value={formDate}
											onChange={(e) => setFormDate(e.target.value)}
											aria-label="Date"
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Description <span className="text-red-600">*</span>
									</label>
									<input
										type="text"
										value={formDescription}
										onChange={(e) => setFormDescription(e.target.value)}
										placeholder="e.g., Monthly rent payment"
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Journal Lines */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Journal Lines</h3>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-gray-200 dark:border-gray-700">
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Account</th>
													<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Debit</th>
													<th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Credit</th>
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Memo</th>
													<th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Tax</th>
													<th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300"></th>
												</tr>
											</thead>
											<tbody>
												{formLines.map((line) => (
													<tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
														<td className="py-3 px-4">
															<AccountSelect
																value={line.account_id}
																accounts={accounts}
																onSelect={(account) =>
																	handleUpdateLine(line.id, {
																		account_id: account.id,
																		account_code: account.code,
																		account_name: account.name,
																	})
																}
															/>
														</td>
														<td className="py-3 px-4">
															<input
																type="number"
																value={line.debit || ""}
																onChange={(e) =>
																	handleUpdateLine(line.id, { debit: parseFloat(e.target.value) || 0 })
																}
																placeholder="0.00"
																className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-right text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
															/>
														</td>
														<td className="py-3 px-4">
															<input
																type="number"
																value={line.credit || ""}
																onChange={(e) =>
																	handleUpdateLine(line.id, { credit: parseFloat(e.target.value) || 0 })
																}
																placeholder="0.00"
																className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-right text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
															/>
														</td>
														<td className="py-3 px-4">
															<input
																type="text"
																value={line.memo}
																onChange={(e) => handleUpdateLine(line.id, { memo: e.target.value })}
																placeholder="Memo..."
																className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
															/>
														</td>
														<td className="py-3 px-4">
															<select
																value={line.tax}
																onChange={(e) =>
																	handleUpdateLine(line.id, { tax: e.target.value as TaxCategory })
																}
																className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500"
																aria-label="Tax"
															>
																<option>No Tax</option>
																<option>GST</option>
																<option>VAT</option>
																<option>Exempt</option>
															</select>
														</td>
														<td className="py-3 px-4 text-center">
															{formLines.length > 2 && (
																<button
																	onClick={() => handleRemoveLine(line.id)}
																	className="text-red-600 hover:text-red-700"
																	aria-label="Remove line"
																>
																	<TrashIcon className="size-4" />
																</button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Real-Time Balance Validation */}
									{formTotals.totalDebit > 0 || formTotals.totalCredit > 0 ? (
										<div className={`mt-4 mb-4 rounded-lg border-2 p-4 transition-all duration-300 ${
											isBalanced
												? "border-green-500 bg-green-50 dark:bg-green-900/20"
												: "border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
										}`}>
											<div className="flex items-center gap-3">
												{isBalanced ? (
													<BalanceCheckIcon className="size-6 text-green-600 dark:text-green-400 flex-shrink-0" />
												) : (
													<BalanceWarningIcon className="size-6 text-red-600 dark:text-red-400 flex-shrink-0" />
												)}
												<div className="flex-1">
													{isBalanced ? (
														<>
															<p className="font-semibold text-green-900 dark:text-green-200">✓ Entry is Balanced</p>
															<p className="text-sm text-green-800 dark:text-green-300 mt-0.5">Debits and credits are equal. Ready to save!</p>
														</>
													) : (
														<>
															<p className="font-semibold text-red-900 dark:text-red-200">⚠ Entry is Not Balanced</p>
															<p className="text-sm text-red-800 dark:text-red-300 mt-0.5">
																Difference: ₱{Math.abs(formTotals.difference).toFixed(2)}
																{formTotals.totalDebit > formTotals.totalCredit ? " - Add more credits" : " - Add more debits"}
															</p>
														</>
													)}
												</div>
											</div>
										</div>
									) : null}

									{/* Totals & Add Line */}
									<div className="mt-4">
										<div className="flex justify-between mb-4 border-t-2 border-gray-200 dark:border-gray-700 pt-4">
											<div className="flex-1">
												<Button variant="secondary" size="sm" onClick={handleAddLine} icon={PlusIcon}>
													Add Line
												</Button>
											</div>
											<div className="flex gap-8">
												<div>
													<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Debit</p>
													<p className="text-xl font-bold text-gray-900 dark:text-white">
														₱{formTotals.totalDebit.toFixed(2)}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Credit</p>
													<p className="text-xl font-bold text-gray-900 dark:text-white">
														₱{formTotals.totalCredit.toFixed(2)}
													</p>
												</div>
												<div>
													<p className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
														Difference
													</p>
													<p
														className={`text-xl font-bold ${
															formTotals.difference === 0
																? "text-green-600 dark:text-green-400"
																: "text-red-600 dark:text-red-400"
														}`}
													>
														₱{Math.abs(formTotals.difference).toFixed(2)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="border-t border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center gap-3 bg-gray-50 dark:bg-white/[0.02]">
								<div className="flex items-center gap-2">
									{!isBalanced && (
										<span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
											<BalanceWarningIcon className="size-4" />
											Entry must be balanced to save
										</span>
									)}
								</div>
								<div className="flex gap-3">
									<Button variant="secondary" onClick={() => {
										setIsCreateModalOpen(false);
										resetForm();
									}}>
										Cancel
									</Button>
									<Button variant="success" onClick={handleSaveDraft} icon={CheckIcon} disabled={!isBalanced}>
										Save as Draft
									</Button>
								</div>
							</div>
						</div>
					</div>
				</ModalPortal>
			)}

			{/* Reverse Entry Modal */}
			{isReverseModalOpen && entryToReverse && (
				<ModalPortal>
					<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="border-b border-gray-200 dark:border-gray-800 p-6 sticky top-0 bg-white dark:bg-gray-900 flex justify-between items-center">
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reverse Journal Entry</h2>
									<p className="text-gray-600 dark:text-gray-400 mt-1">Create a reversing entry for {entryToReverse.reference}</p>
								</div>
								<button
									onClick={() => {
										setIsReverseModalOpen(false);
										setEntryToReverse(null);
										setReverseReason("");
										setIsViewModalOpen(true);
									}}
									className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
								>
									✕
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6 space-y-6">
								{/* Info Box */}
								<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
									<div className="flex gap-3">
										<AlertCircleIcon className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
										<div>
											<p className="text-sm font-medium text-blue-900 dark:text-blue-200">What happens when you reverse?</p>
											<p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
												A new reversing entry will be created with all debit/credit amounts swapped. The original entry will be marked as void.
											</p>
										</div>
									</div>
								</div>

								{/* Original Entry Details */}
								<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
									<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Original Entry Details</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Reference</p>
											<p className="text-base font-semibold text-gray-900 dark:text-white">{entryToReverse.reference}</p>
										</div>
										<div>
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Date</p>
											<p className="text-base font-semibold text-gray-900 dark:text-white">
												{new Date(entryToReverse.date).toLocaleDateString()}
											</p>
										</div>
										<div className="col-span-2">
											<p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Description</p>
											<p className="text-base text-gray-900 dark:text-white">{entryToReverse.description}</p>
										</div>
									</div>
								</div>

								{/* Reason Input */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Reason for Reversal <span className="text-red-600">*</span>
									</label>
									<textarea
										value={reverseReason}
										onChange={(e) => setReverseReason(e.target.value)}
										placeholder="Explain why you are reversing this journal entry..."
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
										rows={4}
									/>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
										This reason will be included in the reversal entry description for audit purposes.
									</p>
								</div>

								{/* Reversing Entry Preview */}
								<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
									<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Reversing Entry Preview</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">Reference:</span>
											<span className="font-medium text-gray-900 dark:text-white">{entryToReverse.reference}-REV</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 dark:text-gray-400">Date:</span>
											<span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
										</div>
										<div className="pt-2 border-t border-gray-200 dark:border-gray-700">
											<p className="text-gray-600 dark:text-gray-400 mb-2">All amounts will be reversed:</p>
											<ul className="space-y-1 text-xs">
												{entryToReverse.lines.slice(0, 3).map((line, idx) => (
													<li key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
														<span>{line.account_name}</span>
														<span>
															{Number(line.credit) > 0 ? `Dr: ₱${Number(line.credit).toFixed(2)}` : `Cr: ₱${Number(line.debit).toFixed(2)}`}
														</span>
													</li>
												))}
												{entryToReverse.lines.length > 3 && (
													<li className="text-gray-600 dark:text-gray-400">
														+{entryToReverse.lines.length - 3} more lines...
													</li>
												)}
											</ul>
										</div>
									</div>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="border-t border-gray-200 dark:border-gray-800 p-6 flex justify-end gap-3 bg-gray-50 dark:bg-white/[0.02]">
								<Button
									variant="secondary"
									onClick={() => {
										setIsReverseModalOpen(false);
										setEntryToReverse(null);
										setReverseReason("");
										setIsViewModalOpen(true);
									}}
								>
									Cancel
								</Button>
								<Button
									variant="warning"
									onClick={handleConfirmReverse}
									icon={ArchiveIcon}
									disabled={!reverseReason.trim()}
								>
									Confirm Reversal
								</Button>
							</div>
						</div>
					</div>
				</ModalPortal>
			)}
			</>
			)}
		</div>
	);
};

export default JournalEntries;
