import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePage } from '@inertiajs/react';
import { useRef } from 'react';
import Swal from "sweetalert2";
import { useAccounts, useAccountLedger, useCreateAccount } from "../../../hooks/useFinanceQueries";

type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
type NormalBalance = "Debit" | "Credit";

type Account = {
	id: string;
	code: string;
	name: string;
	type: AccountType;
	normalBalance: NormalBalance;
	group: string;
	balance: number | string; // Backend returns string from DECIMAL field
	active: boolean;
	parentId?: string | null;
	updatedAt?: string;
};

// Accounts will be loaded from the backend API
const accountInsights: Record<string, { entriesMTD: number; lastActivity: string; parent?: string; tags?: string[] }> = {};

type TreeNode = Account & { children: TreeNode[] };

function buildTree(accounts: Account[]): TreeNode[] {
	const map = new Map<string, TreeNode>();
	accounts.forEach((a) => map.set(a.id, { ...a, children: [] }));
	const roots: TreeNode[] = [];
	map.forEach((node) => {
		if (node.parentId && map.has(node.parentId)) {
			map.get(node.parentId)?.children.push(node);
		} else {
			roots.push(node);
		}
	});
	return roots.sort((a, b) => a.code.localeCompare(b.code));
}

const badgeColors: Record<AccountType, string> = {
	Asset: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
	Liability: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
	Equity: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
	Revenue: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
	Expense: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const formatMoney = (value: number | string) => {
	const numValue = typeof value === 'string' ? parseFloat(value) : value;
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numValue);
};

// Ledger Entry Type
type LedgerEntry = {
	id: string;
	date: string;
	description: string;
	debit: number;
	credit: number;
	balance: number;
	reference: string;
};

// Helper: parse JSON responses safely, fall back to text when server returns HTML (e.g., 419 page)
async function parseJsonOrText(response: Response) {
	const ct = response.headers.get('content-type') || '';
	if (ct.includes('application/json')) {
		return response.json();
	}
	const text = await response.text();
	try {
		return JSON.parse(text);
	} catch {
		return { __raw: text };
	}
}

type MetricCardProps = {
	title: string;
	value: number | string;
	change?: number;
	changeType?: "increase" | "decrease";
	description?: string;
	color?: "success" | "error" | "warning" | "info";
	icon: React.FC<{ className?: string }>;
};

// Icon Components
const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
	</svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
	</svg>
);

const TrendingDownIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
	</svg>
);

const CashIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
			<div
				className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
			/>

			<div className="relative">
				<div className="flex items-center justify-between mb-4">
					<div
						className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
					>
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
						{typeof value === 'number' ? value.toLocaleString() : value}
					</h3>
					<p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
				</div>
			</div>
		</div>
	);
};

// ledgerData will be fetched per-account from the backend when requested

// Icon Components
const GroupIcon = ({ className = "" }) => (
	<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 14.262 12.5362C14.3853 12.4831 14.8044 12.4549 15.2503 12.4549C17.5447 12.4549 19.1291 13.2008 20.1936 14.2549C21.2395 15.2906 21.7206 16.5607 21.9444 17.5202C22.2657 18.8971 21.107 19.8987 19.9248 19.8987Z" fill="currentColor" />
	</svg>
);

const BoxIconLine = ({ className = "" }) => (
	<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M11.665 3.75621C11.8762 3.65064 12.1247 3.65064 12.3358 3.75621L18.7807 6.97856L12.3358 10.2009C12.1247 10.3065 11.8762 10.3065 11.665 10.2009L5.22014 6.97856L11.665 3.75621ZM4.29297 8.19203V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0366V11.6513C11.1631 11.6205 11.0777 11.5843 10.9942 11.5426L4.29297 8.19203ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19202L13.0066 11.5426C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41456C12.3732 2.09786 11.6277 2.09786 10.9942 2.41456L4.03676 5.89319C3.27449 6.27432 2.79297 7.05342 2.79297 7.90566V16.0946C2.79297 16.9469 3.27448 17.726 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.726 21.2079 16.9469 21.2079 16.0946V7.90566C21.2079 7.05342 20.7264 6.27432 19.9641 5.89319L13.0066 2.41456Z" fill="currentColor" />
	</svg>
);

const DollarLineIcon = ({ className = "" }) => (
	<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M12 2C13.1046 2 14 2.89543 14 4V5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H14V8.1C15.2151 8.4261 16 9.5261 16 10.9C16 12.2739 15.2151 13.3739 14 13.7V17H16C16.5523 17 17 17.4477 17 18C17 18.5523 16.5523 19 16 19H14V20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20V19H8C7.44772 19 7 18.5523 7 18C7 17.4477 7.44772 17 8 17H10V13.7C8.78489 13.3739 8 12.2739 8 10.9C8 9.5261 8.78489 8.4261 10 8.1V7H8C7.44772 7 7 6.55228 7 6C7 5.44772 7.44772 5 8 5H10V4C10 2.89543 10.8954 2 12 2ZM12 14.1V17H12.0001V14.1H12ZM12 9.7V7H12.0001V9.7H12Z" fill="currentColor" />
	</svg>
);

const AccountRow: React.FC<{ node: TreeNode; level?: number; selectedId?: string | null; onSelect: (id: string) => void; deactivatedAccounts?: Set<string> }> = ({ node, level = 0, selectedId, onSelect, deactivatedAccounts = new Set() }) => {
	const isSelected = node.id === selectedId;
	const isDeactivated = deactivatedAccounts.has(node.id);

	return (
		<div className="space-y-2">
			<button
				onClick={() => onSelect(node.id)}
				className={`w-full rounded-xl border px-3 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3 ${
					isSelected ? "border-blue-500 bg-blue-50/80 dark:border-blue-500/60" : "bg-white dark:bg-white/[0.02]"
				}`}
				style={{ paddingLeft: `${level * 18 + 12}px` }}
			>
				<span className="text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[72px]">{node.code}</span>
				<div className="flex-1">
					<p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{node.name}</p>
					<div className="flex flex-wrap items-center gap-2 mt-1">
						<span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${badgeColors[node.type]}`}>{node.type}</span>
						<span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{node.group}</span>
						<span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Normal: {node.normalBalance}</span>
						{node.updatedAt && <span className="text-[11px] text-gray-500">Updated {node.updatedAt}</span>}
					</div>
				</div>
				<div className="text-right">
					<p className={`text-sm font-semibold ${parseFloat(String(node.balance)) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatMoney(node.balance)}</p>
					<p className="text-xs text-gray-500">{isDeactivated ? "Deactivated" : node.active ? "Active" : "Inactive"}</p>
				</div>
				</button>
				{node.children.length > 0 && (
				<div className="space-y-2">
					{node.children
						.sort((a, b) => a.code.localeCompare(b.code))
						.map((child) => (
							<AccountRow key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} deactivatedAccounts={deactivatedAccounts} />
						))}
				</div>
			)}
		</div>
	);
};

export default function ChartoOfAccounts() {
	const { auth } = usePage().props as any;

	// Use React Query hooks for shared state
	const { data: accounts = [], isLoading, error } = useAccounts();
	const createAccountMutation = useCreateAccount();

	const [search, setSearch] = useState("");
	const [selectedTypes, setSelectedTypes] = useState<Set<AccountType>>(new Set());
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [deactivatedAccounts, setDeactivatedAccounts] = useState<Set<string>>(new Set());
	const [showLedgerModal, setShowLedgerModal] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>("1000");
	const [page, setPage] = useState(1);
	const [pageSize] = useState(15);
	const [newAccount, setNewAccount] = useState({
		code: "",
		name: "",
		type: "Asset" as AccountType,
		normalBalance: "Debit" as NormalBalance,
		group: "",
		parentId: null as string | null,
		initialBalance: "0" as string,
	});
	const [codeExists, setCodeExists] = useState(false);
	const [checkingCode, setCheckingCode] = useState(false);

	// Load ledger for selected account
	const { data: ledgerData = [] } = useAccountLedger(selectedId, showLedgerModal);

	const tree = useMemo(() => buildTree(accounts), [accounts]);

	const handleDeactivate = async () => {
		if (!selected) return;

		const result = await Swal.fire({
			title: "Deactivate Account?",
			html: `<p class="mb-2">Are you sure you want to deactivate <strong>${selected.name}</strong> (${selected.code})?</p><p class="text-sm text-gray-600">This action will prevent the account from being used in future transactions.</p>`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, Deactivate",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (result.isConfirmed) {
			setDeactivatedAccounts((prev) => new Set([...prev, selected.id]));
			await Swal.fire({
				title: "Deactivated!",
				text: `${selected.name} has been deactivated successfully.`,
				icon: "success",
				confirmButtonColor: "#3b82f6",
			});
		}
	};

	const filteredTree = useMemo(() => {
		if (!search.trim() && selectedTypes.size === 0 && !showActiveOnly) return tree;
		const term = search.toLowerCase();

		const filterNode = (node: TreeNode): TreeNode | null => {
			const name = String(node.name ?? '').toLowerCase();
			const code = String(node.code ?? '').toLowerCase();
			const group = String(node.group ?? '').toLowerCase();
			const matchesSearch = !search.trim() || name.includes(term) || code.includes(term) || group.includes(term);
			const matchesType = selectedTypes.size === 0 || selectedTypes.has(node.type);
			const matchesActive = !showActiveOnly || node.active;
			const match = matchesSearch && matchesType && matchesActive;
			const children = node.children.map(filterNode).filter((c): c is TreeNode => Boolean(c));
			if (match || children.length) return { ...node, children };
			return null;
		};

		return tree.map(filterNode).filter((n): n is TreeNode => Boolean(n));
	}, [search, tree, selectedTypes, showActiveOnly]);

	const totalPages = Math.max(1, Math.ceil(filteredTree.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const paginatedRoots = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredTree.slice(start, start + pageSize);
	}, [filteredTree, currentPage, pageSize]);

	const showingStart = filteredTree.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const showingEnd = Math.min(filteredTree.length, currentPage * pageSize);

	const pageButtons = useMemo(() => {
		const buttons: (number | "ellipsis")[] = [];
		for (let i = 1; i <= totalPages; i += 1) {
			if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
				buttons.push(i);
			} else if (i === currentPage - 2 || i === currentPage + 2) {
				buttons.push("ellipsis");
			}
		}
		return buttons.filter((val, idx, arr) => !(val === "ellipsis" && arr[idx - 1] === "ellipsis"));
	}, [currentPage, totalPages]);

	const selected = useMemo(() => accounts.find((a) => a.id === selectedId) ?? null, [accounts, selectedId]);
	const selectedInsight = selected ? accountInsights[selected.id] : undefined;
	const isSelectedDeactivated = selected ? deactivatedAccounts.has(selected.id) : false;

	const totals = useMemo(() => {
		const active = accounts.filter((a) => a.active).length;
		const byType: Record<AccountType, number> = { Asset: 0, Liability: 0, Equity: 0, Revenue: 0, Expense: 0 };
		accounts.forEach((a) => {
			byType[a.type] += 1;
		});
		return { active, byType };
	}, [accounts]);

	const metrics = useMemo(() => {
		const totalAccounts = accounts.length;
		const totalAssets = accounts
			.filter((a) => a.type === "Asset")
			.reduce((sum, a) => sum + parseFloat(String(a.balance)), 0);
		const totalLiabilities = accounts
			.filter((a) => a.type === "Liability")
			.reduce((sum, a) => sum + Math.abs(parseFloat(String(a.balance))), 0);
		const totalRevenue = accounts
			.filter((a) => a.type === "Revenue")
			.reduce((sum, a) => sum + Math.abs(parseFloat(String(a.balance))), 0);
		const netPosition = totalAssets - totalLiabilities;
		return { totalAccounts, totalAssets, totalLiabilities, totalRevenue, netPosition };
	}, [accounts]);

	// Auto-set normal balance when account type changes
	const handleAccountTypeChange = (type: AccountType) => {
		const normalBalance: NormalBalance = 
			(type === "Asset" || type === "Expense") ? "Debit" : "Credit";
		setNewAccount({ ...newAccount, type, normalBalance });
	};

	// Check if account code already exists
	const handleCodeBlur = async () => {
		if (!newAccount.code.trim()) {
			setCodeExists(false);
			return;
		}
		setCheckingCode(true);
		const exists = accounts.some(a => a.code.toLowerCase() === newAccount.code.toLowerCase());
		setCodeExists(exists);
		setCheckingCode(false);
	};

	// create account via API
	const handleCreateAccount = async () => {
		if (!newAccount.code || !newAccount.name) {
			await Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill in all required fields.' });
			return;
		}

		try {
			const payload = {
				code: newAccount.code,
				name: newAccount.name,
				type: newAccount.type,
				normal_balance: newAccount.normalBalance,
				group: newAccount.group || null,
				parent_id: newAccount.parentId || null,
				balance: parseFloat(newAccount.initialBalance) || 0,
			};

			await createAccountMutation.mutateAsync(payload);
			
			setShowAddModal(false);
			setNewAccount({ code: '', name: '', type: 'Asset', normalBalance: 'Debit', group: '', parentId: null, initialBalance: '0' });
			setCodeExists(false);
			await Swal.fire({ icon: 'success', title: 'Account Created', text: `Account ${newAccount.code} has been created successfully.`, timer: 1500 });
		} catch (e: any) {
			await Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Failed to create account' });
		}
	};

	return (
		<div className="space-y-6">
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-16 gap-4">
					<div className="relative w-12 h-12">
						<div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600"></div>
						<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
					</div>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading chart of accounts...</p>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chart of Accounts</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400">Central ledger structure for all finance features.</p>
						</div>
						<div className="flex flex-wrap gap-2">
					<button onClick={() => setShowAddModal(true)} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md flex items-center gap-2">
							<svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Add Account
						</button>

						</div>
					</div>

			{/* Metric Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="Total Accounts"
					value={metrics.totalAccounts}
					change={3}
					changeType="increase"
					icon={ChartIcon}
					color="info"
					description="Active and inactive accounts"
				/>
				<MetricCard
					title="Total Assets"
					value={formatMoney(metrics.totalAssets)}
					change={8}
					changeType="increase"
					icon={TrendingUpIcon}
					color="success"
					description="Combined asset balances"
				/>
				<MetricCard
					title="Total Liabilities"
					value={formatMoney(metrics.totalLiabilities)}
					change={2}
					changeType="decrease"
					icon={TrendingDownIcon}
					color="warning"
					description="Outstanding obligations"
				/>
				<MetricCard
					title="Net Position"
					value={formatMoney(metrics.netPosition)}
					change={12}
					changeType="increase"
					icon={CashIcon}
					color={metrics.netPosition >= 0 ? "success" : "error"}
					description="Assets minus liabilities"
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Tree</h3>
							<p className="text-sm text-gray-500">Browse and select accounts to manage details.</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative w-64 max-w-full">
								<input
									type="text"
									value={search}
									onChange={(e) => {
										setPage(1);
										setSearch(e.target.value);
									}}
									placeholder="Search code or name"
									className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
								/>
							</div>
						<div className="relative">
							<button 
								onClick={() => setShowFilters(!showFilters)}
								className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-white">Filter</button>
							
							{showFilters && (
								<div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 z-10">
									<div className="p-4 space-y-4">
										<div>
											<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Type</h4>
											<div className="space-y-2">
												{(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as AccountType[]).map((type) => (
													<label key={type} className="flex items-center gap-2 cursor-pointer">
														<input
															type="checkbox"
															checked={selectedTypes.has(type)}
															onChange={(e) => {
																const newTypes = new Set(selectedTypes);
																if (e.target.checked) {
																	newTypes.add(type);
																} else {
																	newTypes.delete(type);
																}
																setSelectedTypes(newTypes);
																setPage(1);
															}}
															className="w-4 h-4 rounded border-gray-300 cursor-pointer"
														/>
														<span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
													</label>
												))}
											</div>
										</div>
										<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
											<label className="flex items-center gap-2 cursor-pointer">
												<input
													type="checkbox"
													checked={showActiveOnly}
													onChange={(e) => {
														setShowActiveOnly(e.target.checked);
														setPage(1);
													}}
													className="w-4 h-4 rounded border-gray-300 cursor-pointer"
												/>
												<span className="text-sm text-gray-700 dark:text-gray-300">Active Accounts Only</span>
											</label>
										</div>
										<div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-2">
											<button 
												onClick={() => {
													setSelectedTypes(new Set());
													setShowActiveOnly(false);
													setPage(1);
												}}
												className="flex-1 text-xs font-semibold text-gray-700 dark:text-gray-300 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
											>
												Clear Filters
											</button>
											<button 
												onClick={() => setShowFilters(false)}
												className="flex-1 text-xs font-semibold text-blue-600 dark:text-blue-400 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
											>
												Done
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
						</div>
					</div>

					<div className="mt-4 space-y-2">
						{filteredTree.length === 0 && <p className="text-sm text-gray-500">No accounts match your search.</p>}
						{paginatedRoots.map((node) => (
							<AccountRow key={node.id} node={node} selectedId={selectedId} onSelect={setSelectedId} deactivatedAccounts={deactivatedAccounts} />
						))}
					</div>

					{filteredTree.length > 0 && (
						<div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
									<span className="font-medium">Showing</span>
									<span className="font-semibold">{showingStart}</span>
									<span className="text-gray-400 dark:text-gray-500">to</span>
									<span className="font-semibold">{showingEnd}</span>
									<span className="text-gray-400 dark:text-gray-500">of</span>
									<span className="font-semibold">{filteredTree.length}</span>
								</div>

								<div className="flex items-center gap-2">
									<button
										onClick={() => setPage(Math.max(1, currentPage - 1))}
										disabled={currentPage === 1}
										className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										title="Previous page"
									>
										<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
									</button>

									{pageButtons.map((btn, idx) => {
										if (btn === "ellipsis") {
											return (
												<span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">
													...
												</span>
											);
										}
										return (
											<button
												key={btn}
												onClick={() => setPage(btn)}
												className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
													currentPage === btn
														? "bg-blue-600 text-white"
														: "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
												}`}
											>
												{btn}
											</button>
										);
									})}

									<button
										onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
										disabled={currentPage === totalPages}
										className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										title="Next page"
									>
										<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h3>
						<p className="text-sm text-gray-500">View metadata and balances.</p>
					</div>

					{selected ? (
						<div className="mt-4 space-y-4">
							<div className="flex flex-wrap items-center gap-2">
								<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">Code {selected.code}</span>
								<span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelectedDeactivated ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200" : selected.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
									{isSelectedDeactivated ? "Deactivated" : selected.active ? "Active" : "Inactive"}
								</span>
								{selected.updatedAt && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">Updated {selected.updatedAt}</span>}
								{selectedInsight?.tags?.map((tag) => (
									<span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{tag}</span>
								))}
							</div>

							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
								<p className="text-xs text-gray-500">Name</p>
								<p className="text-base font-semibold text-gray-900 dark:text-white">{selected.name}</p>
								<p className="text-xs text-gray-500">{selected.group}</p>
							</div>

							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
									<p className="text-xs text-gray-500">Type</p>
									<p className="font-semibold text-gray-900 dark:text-white">{selected.type}</p>
								</div>
								<div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
									<p className="text-xs text-gray-500">Normal Balance</p>
									<p className="font-semibold text-gray-900 dark:text-white">{selected.normalBalance}</p>
								</div>
								<div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
									<p className="text-xs text-gray-500">Parent</p>
									<p className="font-semibold text-gray-900 dark:text-white">{selectedInsight?.parent || "Top-level"}</p>
								</div>
								<div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
									<p className="text-xs text-gray-500">Status</p>
									<p className={`font-semibold ${isSelectedDeactivated ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{isSelectedDeactivated ? "Deactivated" : selected.active ? "Active" : "Inactive"}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
									<p className="text-xs text-gray-500">Current Balance</p>
									<p className={`text-2xl font-semibold ${parseFloat(String(selected.balance)) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatMoney(selected.balance)}</p>
								</div>
								<div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
									<p className="text-xs text-gray-500">Entries (MTD)</p>
									<p className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedInsight?.entriesMTD ?? 0}</p>
									<p className="text-xs text-gray-500">Last activity {selectedInsight?.lastActivity || "-"}</p>
								</div>
							</div>

							<div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
								<p className="text-xs text-gray-500">Notes</p>
								<p className="text-sm text-gray-700 dark:text-gray-200">Use this account for posting {selected.type === "Revenue" ? "sales revenue" : selected.type === "Expense" ? "operating expenses" : "balance sheet"} entries. Ensure normal {String(selected.normalBalance ?? '').toLowerCase()} balance.</p>
							</div>

							<div className="flex flex-wrap gap-2">
								<button onClick={() => setShowLedgerModal(true)} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">View Ledger</button>
								<button
									onClick={handleDeactivate}
									disabled={isSelectedDeactivated}
									className={`rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${
										isSelectedDeactivated
											? "border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
											: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
									}`}
								>
									{isSelectedDeactivated ? "Deactivated" : "Deactivate"}
								</button>
							</div>
						</div>
					) : (
						<p className="mt-6 text-sm text-gray-500">Select an account to see details.</p>
					)}
				</div>
			</div>

			{/* Ledger Modal */}
			{showLedgerModal && selected && createPortal(
				<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
					<div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
						<div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ledger: {selected.name}</h2>
								<p className="text-sm text-gray-500">Account Code: {selected.code} ({selected.type})</p>
							</div>
							<button
								onClick={() => setShowLedgerModal(false)}
								className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
								title="Close modal"
							>
								<svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="max-h-96 overflow-y-auto p-6">
							<div className="rounded-xl border border-gray-200 dark:border-gray-800">
								<table className="w-full text-sm">
									<thead className="border-b border-gray-200 dark:border-gray-800">
										<tr>
											<th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
											<th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Description</th>
											<th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Debit</th>
											<th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Credit</th>
											<th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Balance</th>
											<th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Reference</th>
										</tr>
									</thead>
									<tbody>
										{ledgerData[selectedId] && ledgerData[selectedId].length > 0 ? (
											ledgerData[selectedId].map((entry, idx) => (
												<tr key={entry.id} className={`border-t border-gray-200 dark:border-gray-800 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-white/[0.02]" : ""}`}>
													<td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.date}</td>
													<td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.description}</td>
													<td className="px-4 py-3 text-right font-semibold text-emerald-600">{entry.debit > 0 ? formatMoney(entry.debit) : "-"}</td>
													<td className="px-4 py-3 text-right font-semibold text-rose-600">{entry.credit > 0 ? formatMoney(entry.credit) : "-"}</td>
													<td className={`px-4 py-3 text-right font-bold ${entry.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatMoney(entry.balance)}</td>
													<td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{entry.reference}</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
													No ledger entries found for this account.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>

						<div className="border-t border-gray-200 p-6 dark:border-gray-800">
							<button
								onClick={() => setShowLedgerModal(false)}
								className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
							>
								Close
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}

		{/* Add Account Modal */}
		{showAddModal && createPortal(
			<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8" onClick={() => { setShowAddModal(false); setCodeExists(false); }}>
				<div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
					<div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800 flex-shrink-0">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Account</h2>
						<button
							onClick={() => { setShowAddModal(false); setCodeExists(false); }}
							className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							title="Close"
						>
							<svg className="size-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="p-6 space-y-4 overflow-y-auto flex-1">
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Account Code *</label>
							<input
								type="text"
								value={newAccount.code}
								onChange={(e) => { setNewAccount({ ...newAccount, code: e.target.value }); setCodeExists(false); }}
								onBlur={handleCodeBlur}
								placeholder="e.g., 1000"
								className={`w-full rounded-lg border ${codeExists ? 'border-red-500' : 'border-gray-200'} bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
							/>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								1000-1999: Assets • 2000-2999: Liabilities • 3000-3999: Equity • 4000-4999: Revenue • 5000+: Expenses
							</p>
							{checkingCode && <p className="text-xs text-blue-600 mt-1">Checking...</p>}
							{codeExists && <p className="text-xs text-red-600 mt-1">⚠ This code already exists</p>}
						</div>
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Account Name *</label>
							<input
								type="text"
								value={newAccount.name}
								onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
								placeholder="e.g., Cash & Cash Equivalents"
								className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Account Type *</label>
								<select
									value={newAccount.type}
									onChange={(e) => handleAccountTypeChange(e.target.value as AccountType)}
									className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								>
									<option>Asset</option>
									<option>Liability</option>
									<option>Equity</option>
									<option>Revenue</option>
									<option>Expense</option>
								</select>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Normal Balance auto-set: Asset/Expense=Debit, Liability/Equity/Revenue=Credit
								</p>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Normal Balance (Auto)</label>
								<input
									type="text"
									value={newAccount.normalBalance}
									readOnly
									className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Account Group</label>
							<input
								type="text"
								value={newAccount.group}
								onChange={(e) => setNewAccount({ ...newAccount, group: e.target.value })}
								placeholder="e.g., Current Assets"
								className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Parent Account (Optional)</label>
							<select
								value={newAccount.parentId || ''}
								onChange={(e) => setNewAccount({ ...newAccount, parentId: e.target.value || null })}
								className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
							>
								<option value="">None (Top Level Account)</option>
								{accounts
									.filter(a => a.type === newAccount.type)
									.sort((a, b) => a.code.localeCompare(b.code))
									.map(acc => (
										<option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
									))}
							</select>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Create sub-accounts under existing accounts (e.g., Petty Cash under Cash)
							</p>
						</div>
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Initial Balance</label>
							<input
								type="number"
								step="0.01"
								value={newAccount.initialBalance}
								onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })}
								placeholder="0.00"
								className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
							/>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Opening balance for this account (use negative for credits)
							</p>
						</div>
					</div>

					<div className="border-t border-gray-200 p-6 dark:border-gray-800 flex gap-3 justify-end flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
						<button
							onClick={() => { setShowAddModal(false); setCodeExists(false); }}
							className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
						>
							Cancel
						</button>
						<button 
							onClick={handleCreateAccount} 
							disabled={codeExists || !newAccount.code || !newAccount.name}
							className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Create Account
						</button>
					</div>
				</div>
			</div>,
			document.body
		)}
		</>
		)}
		</div>
		);
	}
