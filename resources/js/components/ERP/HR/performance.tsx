import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

// Icons
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
		</svg>
	);
}

function MagnifyingGlassIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
		</svg>
	);
}

function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
		</svg>
	);
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
		</svg>
	);
}

function XMarkIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
		</svg>
	);
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
			<path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
		</svg>
	);
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
		</svg>
	);
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
		</svg>
	);
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
		</svg>
	);
}

// Types
interface Employee {
	id: string;
	employeeId: string;
	firstName: string;
	lastName: string;
	position: string;
	department: string;
	email: string;
}

interface AttendanceStats {
	present: number;
	late: number;
	absent: number;
	totalDays: number;
	attendanceRate: number;
}

interface TaskStats {
	completed: number;
	pending: number;
	overdue: number;
	total: number;
	completionRate: number;
}

interface PerformanceMetrics {
	employeeId: string;
	period: string;
	periodType: "weekly" | "monthly";
	dateRange: string;
	attendance: AttendanceStats;
	tasks: TaskStats;
	overallRating: number;
	strengths: string[];
	improvements: string[];
}

// Sample Data
const employees: Employee[] = [
	{ id: "1", employeeId: "EMP-001", firstName: "Juan", lastName: "Dela Cruz", position: "Senior Developer", department: "Engineering", email: "juan.delacruz@company.com" },
	{ id: "2", employeeId: "EMP-002", firstName: "Maria", lastName: "Santos", position: "HR Manager", department: "Human Resources", email: "maria.santos@company.com" },
	{ id: "3", employeeId: "EMP-003", firstName: "Pedro", lastName: "Reyes", position: "Marketing Specialist", department: "Marketing", email: "pedro.reyes@company.com" },
	{ id: "4", employeeId: "EMP-004", firstName: "Ana", lastName: "Garcia", position: "Sales Executive", department: "Sales", email: "ana.garcia@company.com" },
	{ id: "5", employeeId: "EMP-005", firstName: "Carlos", lastName: "Bautista", position: "UX Designer", department: "Design", email: "carlos.bautista@company.com" },
	{ id: "6", employeeId: "EMP-006", firstName: "Sofia", lastName: "Mendoza", position: "Data Analyst", department: "Analytics", email: "sofia.mendoza@company.com" },
	{ id: "7", employeeId: "EMP-007", firstName: "Miguel", lastName: "Torres", position: "Backend Developer", department: "Engineering", email: "miguel.torres@company.com" },
	{ id: "8", employeeId: "EMP-008", firstName: "Isabella", lastName: "Cruz", position: "Content Writer", department: "Marketing", email: "isabella.cruz@company.com" },
	{ id: "9", employeeId: "EMP-009", firstName: "Gabriel", lastName: "Ramos", position: "Product Manager", department: "Product", email: "gabriel.ramos@company.com" },
	{ id: "10", employeeId: "EMP-010", firstName: "Lucia", lastName: "Fernandez", position: "Accountant", department: "Finance", email: "lucia.fernandez@company.com" },
];

// Generate sample performance data
const generatePerformanceData = (employee: Employee, periodType: "weekly" | "monthly"): PerformanceMetrics => {
	const isWeekly = periodType === "weekly";
	const totalDays = isWeekly ? 5 : 22;
	const present = Math.floor(totalDays * (0.85 + Math.random() * 0.15));
	const late = Math.floor((totalDays - present) * (Math.random() * 0.5));
	const absent = totalDays - present - late;

	const totalTasks = isWeekly ? Math.floor(5 + Math.random() * 10) : Math.floor(20 + Math.random() * 30);
	const completed = Math.floor(totalTasks * (0.7 + Math.random() * 0.25));
	const overdue = Math.floor((totalTasks - completed) * (Math.random() * 0.3));
	const pending = totalTasks - completed - overdue;

	const attendanceRate = (present / totalDays) * 100;
	const completionRate = (completed / totalTasks) * 100;
	const overallRating = ((attendanceRate + completionRate) / 2) / 20; // Scale to 5

	const dateRange = isWeekly ? "Jan 17-23, 2026" : "January 2026";

	return {
		employeeId: employee.id,
		period: isWeekly ? "Week 4" : "January",
		periodType,
		dateRange,
		attendance: {
			present,
			late,
			absent,
			totalDays,
			attendanceRate: Math.round(attendanceRate * 10) / 10,
		},
		tasks: {
			completed,
			pending,
			overdue,
			total: totalTasks,
			completionRate: Math.round(completionRate * 10) / 10,
		},
		overallRating: Math.round(overallRating * 10) / 10,
		strengths: [
			"Consistent attendance",
			"High task completion rate",
			"Team collaboration",
		],
		improvements: [
			"Time management for deadlines",
			"Communication frequency",
		],
	};
};

export default function Performance() {
	const [search, setSearch] = useState("");
	const [department, setDepartment] = useState("");
	const [periodType, setPeriodType] = useState<"weekly" | "monthly">("weekly");
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
	const [page, setPage] = useState(1);
	const perPage = 8;

	const departments = useMemo(() => {
		const depts = new Set(employees.map((e) => e.department));
		return Array.from(depts).sort();
	}, []);

	const filtered = useMemo(() => {
		return employees.filter((employee) => {
			const matchesSearch =
				search === "" ||
				employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
				employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
				employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||
				employee.position.toLowerCase().includes(search.toLowerCase()) ||
				employee.department.toLowerCase().includes(search.toLowerCase());

			const matchesDept = department === "" || employee.department === department;

			return matchesSearch && matchesDept;
		});
	}, [search, department]);

	const totalPages = Math.ceil(filtered.length / perPage);
	const startIndex = (page - 1) * perPage;
	const endIndex = Math.min(startIndex + perPage, filtered.length);
	const paginated = filtered.slice(startIndex, endIndex);

	const handleSearch = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleDepartment = (value: string) => {
		setDepartment(value);
		setPage(1);
	};

	const openPerformance = (employee: Employee) => {
		setSelectedEmployee(employee);
		const data = generatePerformanceData(employee, periodType);
		setPerformanceData(data);
	};

	const closeModal = () => {
		setSelectedEmployee(null);
		setPerformanceData(null);
	};

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`;
	};

	const getRatingColor = (rating: number) => {
		if (rating >= 4.5) return "text-green-600 dark:text-green-400";
		if (rating >= 3.5) return "text-blue-600 dark:text-blue-400";
		if (rating >= 2.5) return "text-amber-600 dark:text-amber-400";
		return "text-red-600 dark:text-red-400";
	};

	const getRatingBg = (rating: number) => {
		if (rating >= 4.5) return "bg-green-100 dark:bg-green-900/20";
		if (rating >= 3.5) return "bg-blue-100 dark:bg-blue-900/20";
		if (rating >= 2.5) return "bg-amber-100 dark:bg-amber-900/20";
		return "bg-red-100 dark:bg-red-900/20";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Performance</h2>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
						Track and evaluate employee performance metrics
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
						<button
							onClick={() => setPeriodType("weekly")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								periodType === "weekly"
									? "bg-blue-600 text-white"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Weekly
						</button>
						<button
							onClick={() => setPeriodType("monthly")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								periodType === "monthly"
									? "bg-blue-600 text-white"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Monthly
						</button>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="text-sm text-gray-600 dark:text-gray-300">Search</label>
					<div className="relative mt-1">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
						<input
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder="Search by name, ID, position, or department"
							className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-white"
						/>
					</div>
				</div>
				<div>
					<label className="text-sm text-gray-600 dark:text-gray-300">Department</label>
					<select
						value={department}
						onChange={(e) => handleDepartment(e.target.value)}
						aria-label="Filter by department"
						className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
					>
						<option value="">All Departments</option>
						{departments.map((d) => (
							<option key={d} value={d}>{d}</option>
						))}
					</select>
				</div>
			</div>

			{/* Employee Table */}
			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
				<div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employees</h3>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						Viewing <span className="font-semibold">{periodType === "weekly" ? "This Week" : "This Month"}</span>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
						<thead className="bg-gray-50 dark:bg-gray-900/40 text-xs uppercase text-gray-500 dark:text-gray-400">
							<tr>
								<th className="px-6 py-3 text-left">Employee</th>
								<th className="px-6 py-3 text-left">Position</th>
								<th className="px-6 py-3 text-left">Department</th>
								<th className="px-6 py-3 text-center">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{paginated.length === 0 && (
								<tr>
									<td className="px-6 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
										No employees found.
									</td>
								</tr>
							)}
							{paginated.map((employee) => (
								<tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
												<span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
													{getInitials(employee.firstName, employee.lastName)}
												</span>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold text-gray-900 dark:text-white">
													{employee.firstName} {employee.lastName}
												</span>
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{employee.employeeId}
												</span>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-gray-700 dark:text-gray-300">{employee.position}</td>
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
											{employee.department}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => openPerformance(employee)}
											className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
											title="View performance"
											aria-label="View performance"
										>
											<EyeIcon className="size-5 text-blue-600 dark:text-blue-400" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-700 dark:text-gray-300">
							Showing <span className="font-medium">{filtered.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{filtered.length}</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
								disabled={page === 1}
								className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								title="Previous page"
							>
								<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>

							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
								if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
									return (
										<button
											key={p}
											onClick={() => setPage(p)}
											className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
												page === p
													? "bg-blue-600 text-white"
													: "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
											}`}
										>
											{p}
										</button>
									);
								} else if (p === page - 2 || p === page + 2) {
									return (
										<span key={p} className="px-2 text-gray-500 dark:text-gray-400">
											...
										</span>
									);
								}
								return null;
							})}

							<button
								onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
								disabled={page === totalPages}
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
			</div>

			{/* Performance Modal */}
			{selectedEmployee && performanceData && createPortal(
				<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
									<span className="text-blue-600 dark:text-blue-300 font-semibold">
										{getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
									</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-white">
										{selectedEmployee.firstName} {selectedEmployee.lastName}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{selectedEmployee.position} · {selectedEmployee.department}
									</p>
								</div>
							</div>
							<button
								onClick={closeModal}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
								aria-label="Close modal"
							>
								<XMarkIcon className="size-5 text-gray-500 dark:text-gray-400" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6 space-y-6">
							{/* Period Info */}
							<div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
								<div className="flex items-center gap-3">
									<CalendarIcon className="size-5 text-gray-400" />
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400">Performance Period</p>
										<p className="font-semibold text-gray-900 dark:text-white">
											{performanceData.period} ({performanceData.dateRange})
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</p>
									<div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getRatingBg(performanceData.overallRating)}`}>
										<StarIcon className={`size-4 ${getRatingColor(performanceData.overallRating)}`} />
										<span className={`font-bold text-lg ${getRatingColor(performanceData.overallRating)}`}>
											{performanceData.overallRating.toFixed(1)}
										</span>
										<span className="text-sm text-gray-500 dark:text-gray-400">/5.0</span>
									</div>
								</div>
							</div>

							{/* Attendance Stats */}
							<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
								<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
									<div className="flex items-center gap-2">
										<ClockIcon className="size-5 text-gray-600 dark:text-gray-400" />
										<h4 className="font-semibold text-gray-900 dark:text-white">Attendance Overview</h4>
									</div>
								</div>
								<div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Present</p>
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">
											{performanceData.attendance.present}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">days</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Late</p>
										<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
											{performanceData.attendance.late}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">days</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Absent</p>
										<p className="text-2xl font-bold text-red-600 dark:text-red-400">
											{performanceData.attendance.absent}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">days</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Attendance Rate</p>
										<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
											{performanceData.attendance.attendanceRate}%
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
											of {performanceData.attendance.totalDays} days
										</p>
									</div>
								</div>
							</div>

							{/* Task Stats */}
							<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
								<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
									<div className="flex items-center gap-2">
										<CheckCircleIcon className="size-5 text-gray-600 dark:text-gray-400" />
										<h4 className="font-semibold text-gray-900 dark:text-white">Task Performance</h4>
									</div>
								</div>
								<div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">
											{performanceData.tasks.completed}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tasks</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
										<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
											{performanceData.tasks.pending}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tasks</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
										<p className="text-2xl font-bold text-red-600 dark:text-red-400">
											{performanceData.tasks.overdue}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tasks</p>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
										<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
											{performanceData.tasks.completionRate}%
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
											of {performanceData.tasks.total} tasks
										</p>
									</div>
								</div>
							</div>

						</div>

						{/* Modal Footer */}
						<div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end gap-3">
							<button
								onClick={closeModal}
								className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
}
