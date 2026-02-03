import React, { useState, useMemo, useEffect } from "react";
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

interface PerformanceReview {
	id: string;
	employeeId: string;
	employeeName: string;
	position: string;
	department: string;
	reviewPeriod: string;
	reviewDate: string;
	overallRating: number;
	communicationSkills: number;
	teamworkCollaboration: number;
	reliabilityResponsibility: number;
	productivityEfficiency: number;
	comments: string;
	goals: string;
	improvementAreas: string;
	status: string;
}

interface PaginationMeta {
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
}

// Transform function to convert API data to frontend format
function transformReviewFromApi(review: any): PerformanceReview {
	return {
		id: String(review.id),
		employeeId: String(review.employee_id),
		employeeName: review.employee 
			? `${review.employee.first_name} ${review.employee.last_name}`
			: 'Unknown',
		position: review.employee?.position || 'N/A',
		department: review.employee?.department || 'N/A',
		reviewPeriod: review.review_period,
		reviewDate: review.review_date,
		overallRating: review.overall_rating,
		communicationSkills: review.communication_skills,
		teamworkCollaboration: review.teamwork_collaboration,
		reliabilityResponsibility: review.reliability_responsibility,
		productivityEfficiency: review.productivity_efficiency,
		comments: review.comments || '',
		goals: review.goals || '',
		improvementAreas: review.improvement_areas || '',
		status: review.status,
	};
}

export default function Performance() {
	const [search, setSearch] = useState("");
	const [department, setDepartment] = useState("");
	const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
	const [page, setPage] = useState(1);
	const [reviewData, setReviewData] = useState<PerformanceReview[]>([]);
	const [loading, setLoading] = useState(true);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		current_page: 1,
		last_page: 1,
		per_page: 7,
		total: 0,
	});
	const perPage = 8;

	// Fetch performance reviews from API
	useEffect(() => {
		const fetchReviews = async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams({
					page: String(page),
					per_page: String(perPage),
				});
				if (search) params.append('search', search);
				if (department) params.append('department', department);

				const response = await fetch(`/api/hr/performance-reviews?${params}`, {
					headers: {
						'Accept': 'application/json',
						'X-Requested-With': 'XMLHttpRequest',
					},
					credentials: 'same-origin',
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				const reviews = data.data.map(transformReviewFromApi);
				setReviewData(reviews);
				setPaginationMeta({
					current_page: data.current_page,
					last_page: data.last_page,
					per_page: data.per_page,
					total: data.total,
				});
			} catch (error) {
				console.error('Error fetching reviews:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchReviews();
	}, [page, search, department]);

	const departments = useMemo(() => {
		const depts = new Set(reviewData.map((r) => r.department));
		return Array.from(depts).sort();
	}, [reviewData]);

	const handleSearch = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleDepartment = (value: string) => {
		setDepartment(value);
		setPage(1);
	};

	const openPerformance = (review: PerformanceReview) => {
		setSelectedReview(review);
	};

	const closeModal = () => {
		setSelectedReview(null);
	};

	const getInitials = (name: string) => {
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
		}
		return name.substring(0, 2).toUpperCase();
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
						Track and evaluate employee performance reviews
					</p>
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
							placeholder="Search by name, position, or department"
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

			{/* Reviews Table */}
			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
				<div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Reviews</h3>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						{loading ? 'Loading...' : `${paginationMeta.total} total reviews`}
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
						<thead className="bg-gray-50 dark:bg-gray-900/40 text-xs uppercase text-gray-500 dark:text-gray-400">
							<tr>
								<th className="px-6 py-3 text-left">Employee</th>
								<th className="px-6 py-3 text-left">Position</th>
								<th className="px-6 py-3 text-left">Department</th>
								<th className="px-6 py-3 text-left">Period</th>
								<th className="px-6 py-3 text-center">Rating</th>
								<th className="px-6 py-3 text-center">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{loading && (
								<tr>
									<td className="px-6 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
										Loading performance reviews...
									</td>
								</tr>
							)}
							{!loading && reviewData.length === 0 && (
								<tr>
									<td className="px-6 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
										No performance reviews found.
									</td>
								</tr>
							)}
							{!loading && reviewData.map((review) => (
								<tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
												<span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
													{getInitials(review.employeeName)}
												</span>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold text-gray-900 dark:text-white">
													{review.employeeName}
												</span>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-gray-700 dark:text-gray-300">{review.position}</td>
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
											{review.department}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-700 dark:text-gray-300">
										{review.reviewPeriod}
									</td>
									<td className="px-6 py-4 text-center">
										<div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getRatingBg(review.overallRating)}`}>
											<StarIcon className={`size-4 ${getRatingColor(review.overallRating)}`} />
											<span className={`font-bold ${getRatingColor(review.overallRating)}`}>
												{review.overallRating.toFixed(1)}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => openPerformance(review)}
											className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
											title="View details"
											aria-label="View details"
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
							Showing page <span className="font-medium">{paginationMeta.current_page}</span> of <span className="font-medium">{paginationMeta.last_page}</span>
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

							{Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((p) => {
								if (p === 1 || p === paginationMeta.last_page || (p >= page - 1 && p <= page + 1)) {
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
								onClick={() => setPage((prev) => Math.min(prev + 1, paginationMeta.last_page))}
								disabled={page === paginationMeta.last_page}
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
			{selectedReview && createPortal(
				<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
									<span className="text-blue-600 dark:text-blue-300 font-semibold">
										{getInitials(selectedReview.employeeName)}
									</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-white">
										{selectedReview.employeeName}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{selectedReview.position} · {selectedReview.department}
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
										<p className="text-sm text-gray-600 dark:text-gray-400">Review Period</p>
										<p className="font-semibold text-gray-900 dark:text-white">
											{selectedReview.reviewPeriod}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-500">
											Review Date: {selectedReview.reviewDate}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</p>
									<div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getRatingBg(selectedReview.overallRating)}`}>
										<StarIcon className={`size-4 ${getRatingColor(selectedReview.overallRating)}`} />
										<span className={`font-bold text-lg ${getRatingColor(selectedReview.overallRating)}`}>
											{selectedReview.overallRating.toFixed(1)}
										</span>
										<span className="text-sm text-gray-500 dark:text-gray-400">/5.0</span>
									</div>
								</div>
							</div>

							{/* Performance Ratings */}
							<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
								<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
									<div className="flex items-center gap-2">
										<ChartBarIcon className="size-5 text-gray-600 dark:text-gray-400" />
										<h4 className="font-semibold text-gray-900 dark:text-white">Performance Metrics</h4>
									</div>
								</div>
								<div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Communication</p>
										<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingBg(selectedReview.communicationSkills)}`}>
											<StarIcon className={`size-3 ${getRatingColor(selectedReview.communicationSkills)}`} />
											<span className={`font-bold ${getRatingColor(selectedReview.communicationSkills)}`}>
												{selectedReview.communicationSkills}
											</span>
										</div>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Teamwork</p>
										<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingBg(selectedReview.teamworkCollaboration)}`}>
											<StarIcon className={`size-3 ${getRatingColor(selectedReview.teamworkCollaboration)}`} />
											<span className={`font-bold ${getRatingColor(selectedReview.teamworkCollaboration)}`}>
												{selectedReview.teamworkCollaboration}
											</span>
										</div>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reliability</p>
										<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingBg(selectedReview.reliabilityResponsibility)}`}>
											<StarIcon className={`size-3 ${getRatingColor(selectedReview.reliabilityResponsibility)}`} />
											<span className={`font-bold ${getRatingColor(selectedReview.reliabilityResponsibility)}`}>
												{selectedReview.reliabilityResponsibility}
											</span>
										</div>
									</div>
									<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Productivity</p>
										<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRatingBg(selectedReview.productivityEfficiency)}`}>
											<StarIcon className={`size-3 ${getRatingColor(selectedReview.productivityEfficiency)}`} />
											<span className={`font-bold ${getRatingColor(selectedReview.productivityEfficiency)}`}>
												{selectedReview.productivityEfficiency}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Comments Section */}
							{selectedReview.comments && (
								<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
									<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
										<h4 className="font-semibold text-gray-900 dark:text-white">Comments</h4>
									</div>
									<div className="p-4">
										<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
											{selectedReview.comments}
										</p>
									</div>
								</div>
							)}

							{/* Goals Section */}
							{selectedReview.goals && (
								<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
									<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
										<h4 className="font-semibold text-gray-900 dark:text-white">Goals</h4>
									</div>
									<div className="p-4">
										<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
											{selectedReview.goals}
										</p>
									</div>
								</div>
							)}

							{/* Improvement Areas */}
							{selectedReview.improvementAreas && (
								<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
									<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
										<h4 className="font-semibold text-gray-900 dark:text-white">Areas for Improvement</h4>
									</div>
									<div className="p-4">
										<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
											{selectedReview.improvementAreas}
										</p>
									</div>
								</div>
							)}
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
