import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import { useFinanceApi } from "../../../hooks/useFinanceApi";

type ReconciliationStatus = "unreconciled" | "matched" | "reconciled" | "discrepancy";

type BankTransaction = {
	id: string;
	date: string;
	description: string;
	reference: string;
	debit: number;
	credit: number;
	balance: number;
	status: ReconciliationStatus;
	matched_journal_entry_id?: string;
};

type JournalTransaction = {
	id: string;
	date: string;
	reference: string;
	description: string;
	debit: number;
	credit: number;
	account_name: string;
	status: ReconciliationStatus;
};

type ReconciliationSession = {
	id: string;
	account_id: string;
	account_name: string;
	statement_date: string;
	opening_balance: number;
	closing_balance: number;
	reconciled_by?: string;
	reconciled_at?: string;
	status: "in_progress" | "completed";
	matched_count: number;
	unmatched_count: number;
};

type Account = {
	id: string;
	code: string;
	name: string;
	type: string;
	balance: number;
};

// Icons
const BankIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
	</svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
	</svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
	</svg>
);

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
	</svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
	</svg>
);

const Reconciliation: React.FC = () => {
	const { auth } = usePage().props as any;
	const isAuthenticated = Boolean(auth && auth.user);

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [selectedAccountId, setSelectedAccountId] = useState<string>("");
	const [statementDate, setStatementDate] = useState<string>(new Date().toISOString().split('T')[0]);
	const [openingBalance, setOpeningBalance] = useState<string>("0");
	const [closingBalance, setClosingBalance] = useState<string>("0");
	
	const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
	const [journalTransactions, setJournalTransactions] = useState<JournalTransaction[]>([]);
	const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
	
	const [selectedBankTxn, setSelectedBankTxn] = useState<string[]>([]);
	const [selectedJournalTxn, setSelectedJournalTxn] = useState<string[]>([]);
	
	const [isLoading, setIsLoading] = useState(false);
	const [currentSession, setCurrentSession] = useState<ReconciliationSession | null>(null);

	const api = useFinanceApi();

	// Load accounts on mount
	useEffect(() => {
		loadAccounts();
		loadSessions();
	}, []);

	const loadAccounts = async () => {
		try {
			const response = await api.get('/api/finance/accounts');
			if (response.ok) {
				const bankAccounts = (response.data?.data || response.data).filter((a: Account) => 
					a.type === "Asset" && (
						a.name.toLowerCase().includes("bank") || 
						a.name.toLowerCase().includes("cash")
					)
				);
				setAccounts(bankAccounts);
				if (bankAccounts.length > 0) {
					setSelectedAccountId(bankAccounts[0].id);
				}
			}
		} catch (error) {
			// Silent fail - will show empty state
		}
	};

	const loadSessions = async () => {
		// TODO: Implement API call to load reconciliation sessions
		// For now using mock data
		setSessions([]);
	};

	const loadTransactions = async () => {
		if (!selectedAccountId) return;
		
		setIsLoading(true);
		try {
			// Load journal transactions for the selected account
			const response = await api.get(`/api/finance/reconciliation/transactions?account_id=${selectedAccountId}`);
			
			if (response.ok) {
				setJournalTransactions(response.data?.transactions || []);
			}
		} catch (error) {
			// Silent fail - will show empty state
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (selectedAccountId) {
			loadTransactions();
		}
	}, [selectedAccountId]);

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const text = e.target?.result as string;
				const lines = text.split('\n');
				
				// Parse CSV (expecting: Date, Description, Reference, Debit, Credit, Balance)
				const transactions: BankTransaction[] = lines.slice(1)
					.filter(line => line.trim())
					.map((line, index) => {
						const [date, description, reference, debit, credit, balance] = line.split(',').map(s => s.trim());
						return {
							id: `bank-${index}`,
							date: date || '',
							description: description || '',
							reference: reference || '',
							debit: parseFloat(debit) || 0,
							credit: parseFloat(credit) || 0,
							balance: parseFloat(balance) || 0,
							status: 'unreconciled' as ReconciliationStatus
						};
					});

				setBankTransactions(transactions);
				
				await Swal.fire({
					title: "File Uploaded!",
					text: `Loaded ${transactions.length} bank transactions`,
					icon: "success",
					confirmButtonColor: "#2563eb"
				});
			} catch (error) {
				await Swal.fire({
					title: "Upload Failed",
					text: "Could not parse the file. Please ensure it's a valid CSV.",
					icon: "error",
					confirmButtonColor: "#d33"
				});
			}
		};
		reader.readAsText(file);
	};

	const handleMatchTransactions = async () => {
		if (selectedBankTxn.length === 0 || selectedJournalTxn.length === 0) {
			await Swal.fire({
				title: "Selection Required",
				text: "Please select at least one bank transaction and one journal entry to match.",
				icon: "warning",
				confirmButtonColor: "#f59e0b"
			});
			return;
		}

		const result = await Swal.fire({
			title: "Match Transactions?",
			text: `Match ${selectedBankTxn.length} bank transaction(s) with ${selectedJournalTxn.length} journal entry(ies)?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Match",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#2563eb"
		});

		if (result.isConfirmed) {
			// Update status
			setBankTransactions(prev => prev.map(txn => 
				selectedBankTxn.includes(txn.id) 
					? { ...txn, status: 'matched' as ReconciliationStatus }
					: txn
			));
			
			setJournalTransactions(prev => prev.map(txn => 
				selectedJournalTxn.includes(txn.id) 
					? { ...txn, status: 'matched' as ReconciliationStatus }
					: txn
			));

			setSelectedBankTxn([]);
			setSelectedJournalTxn([]);

			await Swal.fire({
				title: "Matched!",
				text: "Transactions have been successfully matched.",
				icon: "success",
				confirmButtonColor: "#2563eb"
			});
		}
	};

	const handleAutoMatch = async () => {
		setIsLoading(true);
		
		let matchedCount = 0;
		const newBankTxns = [...bankTransactions];
		const newJournalTxns = [...journalTransactions];

		// Simple auto-match logic: match by amount and date within 3 days
		bankTransactions.forEach(bankTxn => {
			if (bankTxn.status !== 'unreconciled') return;

			const matchingJournal = journalTransactions.find(journalTxn => {
				if (journalTxn.status !== 'unreconciled') return false;
				
				const amountMatch = Math.abs(
					(bankTxn.debit || bankTxn.credit) - (journalTxn.debit || journalTxn.credit)
				) < 0.01;
				
				const bankDate = new Date(bankTxn.date);
				const journalDate = new Date(journalTxn.date);
				const daysDiff = Math.abs((bankDate.getTime() - journalDate.getTime()) / (1000 * 60 * 60 * 24));
				
				return amountMatch && daysDiff <= 3;
			});

			if (matchingJournal) {
				const bankIndex = newBankTxns.findIndex(t => t.id === bankTxn.id);
				const journalIndex = newJournalTxns.findIndex(t => t.id === matchingJournal.id);
				
				if (bankIndex >= 0) newBankTxns[bankIndex].status = 'matched';
				if (journalIndex >= 0) newJournalTxns[journalIndex].status = 'matched';
				
				matchedCount++;
			}
		});

		setBankTransactions(newBankTxns);
		setJournalTransactions(newJournalTxns);
		setIsLoading(false);

		await Swal.fire({
			title: "Auto-Match Complete",
			text: `Automatically matched ${matchedCount} transaction(s).`,
			icon: "success",
			confirmButtonColor: "#2563eb"
		});
	};

	const handleCompleteReconciliation = async () => {
		const unreconciledBank = bankTransactions.filter(t => t.status === 'unreconciled').length;
		const unreconciledJournal = journalTransactions.filter(t => t.status === 'unreconciled').length;

		if (unreconciledBank > 0 || unreconciledJournal > 0) {
			const result = await Swal.fire({
				title: "Unmatched Transactions",
				html: `There are ${unreconciledBank} unmatched bank transactions and ${unreconciledJournal} unmatched journal entries.<br><br>Do you want to complete reconciliation anyway?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Complete Anyway",
				cancelButtonText: "Cancel",
				confirmButtonColor: "#f59e0b"
			});

			if (!result.isConfirmed) return;
		}

		// Mark all matched transactions as reconciled
		setBankTransactions(prev => prev.map(txn => 
			txn.status === 'matched' ? { ...txn, status: 'reconciled' as ReconciliationStatus } : txn
		));
		
		setJournalTransactions(prev => prev.map(txn => 
			txn.status === 'matched' ? { ...txn, status: 'reconciled' as ReconciliationStatus } : txn
		));

		await Swal.fire({
			title: "Reconciliation Complete!",
			text: "Bank reconciliation has been completed successfully.",
			icon: "success",
			confirmButtonColor: "#2563eb"
		});
	};

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("en-PH", {
			style: "currency",
			currency: "PHP",
			minimumFractionDigits: 2,
		}).format(value);

	const summary = useMemo(() => {
		const matchedBank = bankTransactions.filter(t => t.status === 'matched' || t.status === 'reconciled').length;
		const unmatchedBank = bankTransactions.filter(t => t.status === 'unreconciled').length;
		const matchedJournal = journalTransactions.filter(t => t.status === 'matched' || t.status === 'reconciled').length;
		const unmatchedJournal = journalTransactions.filter(t => t.status === 'unreconciled').length;
		
		const totalBankDebits = bankTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
		const totalBankCredits = bankTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
		const totalJournalDebits = journalTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
		const totalJournalCredits = journalTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);

		return {
			matchedBank,
			unmatchedBank,
			matchedJournal,
			unmatchedJournal,
			totalBankDebits,
			totalBankCredits,
			totalJournalDebits,
			totalJournalCredits,
			difference: (totalBankDebits - totalBankCredits) - (totalJournalDebits - totalJournalCredits)
		};
	}, [bankTransactions, journalTransactions]);

	const selectedAccount = accounts.find(a => a.id === selectedAccountId);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Reconciliation</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Match bank statements with internal transactions
					</p>
				</div>
			</div>

			{/* Account Selection & Statement Upload */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reconciliation Setup</h2>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Bank Account
						</label>
						<select
							value={selectedAccountId}
							onChange={(e) => setSelectedAccountId(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
						>
							<option value="">Select account...</option>
							{accounts.map(account => (
								<option key={account.id} value={account.id}>
									{account.code} - {account.name} ({formatCurrency(account.balance)})
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Statement Date
						</label>
						<input
							type="date"
							value={statementDate}
							onChange={(e) => setStatementDate(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Opening Balance
						</label>
						<input
							type="number"
							step="0.01"
							value={openingBalance}
							onChange={(e) => setOpeningBalance(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Closing Balance
						</label>
						<input
							type="number"
							step="0.01"
							value={closingBalance}
							onChange={(e) => setClosingBalance(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
						/>
					</div>
				</div>

				<div className="mt-4 flex gap-3">
					<label className="flex-1 cursor-pointer">
						<input
							type="file"
							accept=".csv"
							onChange={handleFileUpload}
							className="hidden"
						/>
						<div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
							<UploadIcon className="size-5 text-gray-600 dark:text-gray-400" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Upload Bank Statement (CSV)
							</span>
						</div>
					</label>
					
					<button
						onClick={handleAutoMatch}
						disabled={bankTransactions.length === 0 || journalTransactions.length === 0 || isLoading}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<RefreshIcon className="size-5" />
						Auto-Match
					</button>
				</div>

				<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
					<p className="text-sm text-blue-800 dark:text-blue-200">
						<strong>CSV Format:</strong> Date, Description, Reference, Debit, Credit, Balance
					</p>
				</div>
			</div>

			{/* Summary Statistics */}
			{(bankTransactions.length > 0 || journalTransactions.length > 0) && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">Matched (Bank)</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
							{summary.matchedBank}
						</p>
					</div>
					
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">Unmatched (Bank)</p>
						<p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
							{summary.unmatchedBank}
						</p>
					</div>
					
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">Matched (Journal)</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
							{summary.matchedJournal}
						</p>
					</div>
					
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">Unmatched (Journal)</p>
						<p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
							{summary.unmatchedJournal}
						</p>
					</div>
				</div>
			)}

			{/* Matching Interface */}
			{bankTransactions.length > 0 && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Bank Transactions */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
								<BankIcon className="size-5" />
								Bank Transactions ({bankTransactions.length})
							</h3>
							<span className="text-sm text-gray-600 dark:text-gray-400">
								{selectedBankTxn.length} selected
							</span>
						</div>
						
						<div className="overflow-x-auto max-h-[600px] overflow-y-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-50 dark:bg-gray-900/40 sticky top-0">
									<tr>
										<th className="px-4 py-3 text-left">
											<input
												type="checkbox"
												checked={selectedBankTxn.length === bankTransactions.filter(t => t.status === 'unreconciled').length && bankTransactions.filter(t => t.status === 'unreconciled').length > 0}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedBankTxn(bankTransactions.filter(t => t.status === 'unreconciled').map(t => t.id));
													} else {
														setSelectedBankTxn([]);
													}
												}}
												className="rounded"
											/>
										</th>
										<th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Date</th>
										<th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Description</th>
										<th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Amount</th>
										<th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{bankTransactions.map(txn => (
										<tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
											<td className="px-4 py-3">
												{txn.status === 'unreconciled' && (
													<input
														type="checkbox"
														checked={selectedBankTxn.includes(txn.id)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedBankTxn([...selectedBankTxn, txn.id]);
															} else {
																setSelectedBankTxn(selectedBankTxn.filter(id => id !== txn.id));
															}
														}}
														className="rounded"
													/>
												)}
											</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">{txn.date}</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white">{txn.description}</td>
											<td className="px-4 py-3 text-right text-gray-900 dark:text-white whitespace-nowrap">
												{txn.debit > 0 && <span className="text-green-600">+{formatCurrency(txn.debit)}</span>}
												{txn.credit > 0 && <span className="text-red-600">-{formatCurrency(txn.credit)}</span>}
											</td>
											<td className="px-4 py-3 text-center">
												{txn.status === 'unreconciled' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
														Unmatched
													</span>
												)}
												{txn.status === 'matched' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
														Matched
													</span>
												)}
												{txn.status === 'reconciled' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
														Reconciled
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Journal Transactions */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
								<BankIcon className="size-5" />
								Journal Entries ({journalTransactions.length})
							</h3>
							<span className="text-sm text-gray-600 dark:text-gray-400">
								{selectedJournalTxn.length} selected
							</span>
						</div>
						
						<div className="overflow-x-auto max-h-[600px] overflow-y-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-50 dark:bg-gray-900/40 sticky top-0">
									<tr>
										<th className="px-4 py-3 text-left">
											<input
												type="checkbox"
												checked={selectedJournalTxn.length === journalTransactions.filter(t => t.status === 'unreconciled').length && journalTransactions.filter(t => t.status === 'unreconciled').length > 0}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedJournalTxn(journalTransactions.filter(t => t.status === 'unreconciled').map(t => t.id));
													} else {
														setSelectedJournalTxn([]);
													}
												}}
												className="rounded"
											/>
										</th>
										<th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Date</th>
										<th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Reference</th>
										<th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Amount</th>
										<th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{journalTransactions.map(txn => (
										<tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
											<td className="px-4 py-3">
												{txn.status === 'unreconciled' && (
													<input
														type="checkbox"
														checked={selectedJournalTxn.includes(txn.id)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedJournalTxn([...selectedJournalTxn, txn.id]);
															} else {
																setSelectedJournalTxn(selectedJournalTxn.filter(id => id !== txn.id));
															}
														}}
														className="rounded"
													/>
												)}
											</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">{txn.date}</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white">{txn.reference}</td>
											<td className="px-4 py-3 text-right text-gray-900 dark:text-white whitespace-nowrap">
												{txn.debit > 0 && <span className="text-green-600">+{formatCurrency(txn.debit)}</span>}
												{txn.credit > 0 && <span className="text-red-600">-{formatCurrency(txn.credit)}</span>}
											</td>
											<td className="px-4 py-3 text-center">
												{txn.status === 'unreconciled' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
														Unmatched
													</span>
												)}
												{txn.status === 'matched' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
														Matched
													</span>
												)}
												{txn.status === 'reconciled' && (
													<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
														Reconciled
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			{bankTransactions.length > 0 && (
				<div className="flex justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						{summary.difference !== 0 && (
							<div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
								<AlertIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
								<span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
									Difference: {formatCurrency(Math.abs(summary.difference))}
								</span>
							</div>
						)}
					</div>
					
					<div className="flex gap-3">
						<button
							onClick={handleMatchTransactions}
							disabled={selectedBankTxn.length === 0 || selectedJournalTxn.length === 0}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							<LinkIcon className="size-5" />
							Match Selected
						</button>
						
						<button
							onClick={handleCompleteReconciliation}
							disabled={summary.matchedBank === 0}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							<CheckIcon className="size-5" />
							Complete Reconciliation
						</button>
					</div>
				</div>
			)}

			{/* Empty State */}
			{bankTransactions.length === 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
					<BankIcon className="size-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						No Bank Statement Loaded
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Upload a bank statement CSV file to start reconciliation
					</p>
				</div>
			)}
		</div>
	);
};

export default Reconciliation;
