import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";

// ==================== Type Definitions ====================
type EmployeeStatus = "active" | "inactive" | "on_leave";
type PayType = "monthly" | "daily" | "hourly";
type AttendanceStatus = "finalized" | "pending" | "not_started";

type Employee = {
	id: number;
	firstName: string;
	lastName: string;
	employeeId: string;
	department: string;
	position: string;
	status: EmployeeStatus;
	payType: PayType;
	monthlySalary?: number;
	dailyRate?: number;
	hourlyRate?: number;
	allowances: {
		transportation: number;
		meal: number;
		communication: number;
		other: number;
	};
	loans?: {
		amount: number;
		monthlyDeduction: number;
	};
	lastSlipGenerated?: string;
	hasSlipForPeriod?: boolean; // Whether slip already exists for selected period
};

type AttendanceRecord = {
	date: string;
	status: "present" | "absent" | "late" | "half_day" | "on_leave";
	regularHours: number;
	overtimeHours: number;
	undertimeHours: number;
	checkIn?: string;
	checkOut?: string;
};

type PayrollPeriod = {
	month: string;
	startDate: string;
	endDate: string;
	attendanceStatus: AttendanceStatus;
	workingDays: number;
};

type PayrollCalculation = {
	// Hours Breakdown
	totalRegularHours: number;
	totalOvertimeHours: number;
	totalUndertimeHours: number;
	totalAbsentDays: number;
	
	// Earnings
	basicPay: number;
	overtimePay: number;
	allowances: number;
	totalEarnings: number;
	
	// Deductions
	withholdingTax: number;
	sssContribution: number;
	philhealthContribution: number;
	pagibigContribution: number;
	absentDeductions: number;
	loanDeductions: number;
	otherDeductions: number;
	totalDeductions: number;
	
	// Net Pay
	grossPay: number;
	netPay: number;
};

type Payslip = {
	id: string;
	employeeId: string;
	employeeName: string;
	department: string;
	position: string;
	payrollPeriod: PayrollPeriod;
	calculation: PayrollCalculation;
	generatedAt: string;
	generatedBy: string;
	status: "generated" | "approved" | "paid";
};

// ==================== Icon Components ====================
const CheckCircleIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const ClockIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const AlertIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
	</svg>
);

const EyeIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
	</svg>
);

const CheckIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
	</svg>
);

const CalculatorIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
	</svg>
);

const LockIcon = ({ className = "size-5" }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
	</svg>
);

// ==================== Payroll Calculation Engine ====================

/**
 * Philippine SSS Contribution Table (2026)
 * Employee share based on monthly salary compensation
 */
const calculateSSSContribution = (monthlySalary: number): number => {
	if (monthlySalary < 4250) return 180;
	if (monthlySalary < 4750) return 202.50;
	if (monthlySalary < 5250) return 225;
	if (monthlySalary < 5750) return 247.50;
	if (monthlySalary < 6250) return 270;
	if (monthlySalary < 6750) return 292.50;
	if (monthlySalary < 7250) return 315;
	if (monthlySalary < 7750) return 337.50;
	if (monthlySalary < 8250) return 360;
	if (monthlySalary < 8750) return 382.50;
	if (monthlySalary < 9250) return 405;
	if (monthlySalary < 9750) return 427.50;
	if (monthlySalary < 10250) return 450;
	if (monthlySalary < 10750) return 472.50;
	if (monthlySalary < 11250) return 495;
	if (monthlySalary < 11750) return 517.50;
	if (monthlySalary < 12250) return 540;
	if (monthlySalary < 12750) return 562.50;
	if (monthlySalary < 13250) return 585;
	if (monthlySalary < 13750) return 607.50;
	if (monthlySalary < 14250) return 630;
	if (monthlySalary < 14750) return 652.50;
	if (monthlySalary < 15250) return 675;
	if (monthlySalary < 15750) return 697.50;
	if (monthlySalary < 16250) return 720;
	if (monthlySalary < 16750) return 742.50;
	if (monthlySalary < 17250) return 765;
	if (monthlySalary < 17750) return 787.50;
	if (monthlySalary < 18250) return 810;
	if (monthlySalary < 18750) return 832.50;
	if (monthlySalary < 19250) return 855;
	if (monthlySalary < 19750) return 877.50;
	if (monthlySalary >= 30000) return 1350; // Maximum
	return 900; // Default mid-range
};

/**
 * Philippine PhilHealth Contribution (2026)
 * Employee share = 2.5% of monthly basic salary (capped)
 */
const calculatePhilHealthContribution = (monthlySalary: number): number => {
	const rate = 0.025; // 2.5% employee share
	const minSalary = 10000;
	const maxSalary = 100000;
	
	let baseSalary = monthlySalary;
	if (baseSalary < minSalary) baseSalary = minSalary;
	if (baseSalary > maxSalary) baseSalary = maxSalary;
	
	return Math.round(baseSalary * rate * 100) / 100;
};

/**
 * Philippine Pag-IBIG Contribution (2026)
 * Employee share: 1-2% based on monthly compensation
 */
const calculatePagIbigContribution = (monthlySalary: number): number => {
	if (monthlySalary <= 1500) {
		return Math.round(monthlySalary * 0.01 * 100) / 100; // 1%
	} else {
		const contribution = Math.round(monthlySalary * 0.02 * 100) / 100; // 2%
		return Math.min(contribution, 100); // Capped at ₱100
	}
};

/**
 * Philippine Withholding Tax Calculation (2026)
 * Based on graduated tax rates
 */
const calculateWithholdingTax = (taxableIncome: number): number => {
	// Annual tax brackets
	if (taxableIncome <= 250000) return 0;
	if (taxableIncome <= 400000) return (taxableIncome - 250000) * 0.15;
	if (taxableIncome <= 800000) return 22500 + (taxableIncome - 400000) * 0.20;
	if (taxableIncome <= 2000000) return 102500 + (taxableIncome - 800000) * 0.25;
	if (taxableIncome <= 8000000) return 402500 + (taxableIncome - 2000000) * 0.30;
	return 2202500 + (taxableIncome - 8000000) * 0.35;
};

/**
 * Calculate monthly tax from annual taxable income
 */
const calculateMonthlyTax = (monthlyGrossPay: number, monthlyDeductions: number): number => {
	const monthlyTaxableIncome = monthlyGrossPay - monthlyDeductions;
	const annualTaxableIncome = monthlyTaxableIncome * 12;
	const annualTax = calculateWithholdingTax(annualTaxableIncome);
	const monthlyTax = annualTax / 12;
	return Math.round(monthlyTax * 100) / 100;
};

/**
 * Main Payroll Calculation Function
 */
const calculatePayroll = (
	employee: Employee,
	attendanceRecords: AttendanceRecord[],
	payrollPeriod: PayrollPeriod
): PayrollCalculation => {
	// Step 1: Calculate total hours
	const totalRegularHours = attendanceRecords.reduce((sum, record) => sum + record.regularHours, 0);
	const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + record.overtimeHours, 0);
	const totalUndertimeHours = attendanceRecords.reduce((sum, record) => sum + record.undertimeHours, 0);
	const totalAbsentDays = attendanceRecords.filter(r => r.status === "absent").length;
	
	// Step 2: Determine pay rate based on employee type
	let hourlyRate = 0;
	let dailyRate = 0;
	let monthlyBase = 0;
	
	if (employee.payType === "monthly" && employee.monthlySalary) {
		monthlyBase = employee.monthlySalary;
		dailyRate = monthlyBase / payrollPeriod.workingDays;
		hourlyRate = dailyRate / 8; // Assuming 8 hours per day
	} else if (employee.payType === "daily" && employee.dailyRate) {
		dailyRate = employee.dailyRate;
		hourlyRate = dailyRate / 8;
		monthlyBase = dailyRate * payrollPeriod.workingDays;
	} else if (employee.payType === "hourly" && employee.hourlyRate) {
		hourlyRate = employee.hourlyRate;
		dailyRate = hourlyRate * 8;
		monthlyBase = dailyRate * payrollPeriod.workingDays;
	}
	
	// Step 3: Calculate earnings
	const basicPay = totalRegularHours * hourlyRate;
	const overtimeRate = hourlyRate * 1.25; // 25% overtime premium
	const overtimePay = totalOvertimeHours * overtimeRate;
	
	const allowances = 
		employee.allowances.transportation +
		employee.allowances.meal +
		employee.allowances.communication +
		employee.allowances.other;
	
	const totalEarnings = basicPay + overtimePay + allowances;
	const grossPay = basicPay + overtimePay;
	
	// Step 4: Calculate deductions
	const sssContribution = calculateSSSContribution(monthlyBase);
	const philhealthContribution = calculatePhilHealthContribution(monthlyBase);
	const pagibigContribution = calculatePagIbigContribution(monthlyBase);
	
	const totalStatutoryDeductions = sssContribution + philhealthContribution + pagibigContribution;
	const withholdingTax = calculateMonthlyTax(grossPay, totalStatutoryDeductions);
	
	// Absent deductions (pro-rated)
	const absentDeductions = totalAbsentDays * dailyRate;
	
	// Undertime deductions
	const undertimeDeductions = totalUndertimeHours * hourlyRate;
	
	// Loan deductions
	const loanDeductions = employee.loans?.monthlyDeduction || 0;
	
	const otherDeductions = absentDeductions + undertimeDeductions;
	
	const totalDeductions = 
		withholdingTax +
		sssContribution +
		philhealthContribution +
		pagibigContribution +
		otherDeductions +
		loanDeductions;
	
	// Step 5: Calculate net pay
	const netPay = totalEarnings - totalDeductions;
	
	return {
		totalRegularHours,
		totalOvertimeHours,
		totalUndertimeHours,
		totalAbsentDays,
		basicPay: Math.round(basicPay * 100) / 100,
		overtimePay: Math.round(overtimePay * 100) / 100,
		allowances: Math.round(allowances * 100) / 100,
		totalEarnings: Math.round(totalEarnings * 100) / 100,
		withholdingTax: Math.round(withholdingTax * 100) / 100,
		sssContribution: Math.round(sssContribution * 100) / 100,
		philhealthContribution: Math.round(philhealthContribution * 100) / 100,
		pagibigContribution: Math.round(pagibigContribution * 100) / 100,
		absentDeductions: Math.round(absentDeductions * 100) / 100,
		loanDeductions: Math.round(loanDeductions * 100) / 100,
		otherDeductions: Math.round(otherDeductions * 100) / 100,
		totalDeductions: Math.round(totalDeductions * 100) / 100,
		grossPay: Math.round(grossPay * 100) / 100,
		netPay: Math.round(netPay * 100) / 100,
	};
};

// ==================== Mock Data ====================

const payrollPeriods: PayrollPeriod[] = [
	{
		month: "January 2026",
		startDate: "2026-01-01",
		endDate: "2026-01-31",
		attendanceStatus: "finalized",
		workingDays: 22,
	},
	{
		month: "December 2025",
		startDate: "2025-12-01",
		endDate: "2025-12-31",
		attendanceStatus: "finalized",
		workingDays: 21,
	},
	{
		month: "November 2025",
		startDate: "2025-11-01",
		endDate: "2025-11-30",
		attendanceStatus: "finalized",
		workingDays: 20,
	},
	{
		month: "February 2026",
		startDate: "2026-02-01",
		endDate: "2026-02-28",
		attendanceStatus: "pending",
		workingDays: 20,
	},
];

const employeeData: Employee[] = [
	{
		id: 1,
		firstName: "Ava",
		lastName: "Thompson",
		employeeId: "EMP-1203",
		department: "Engineering",
		position: "Senior Software Engineer",
		status: "active",
		payType: "monthly",
		monthlySalary: 45000,
		allowances: {
			transportation: 2000,
			meal: 1500,
			communication: 1000,
			other: 500,
		},
		loans: {
			amount: 50000,
			monthlyDeduction: 2500,
		},
		lastSlipGenerated: "Dec 31, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 2,
		firstName: "Liam",
		lastName: "Chen",
		employeeId: "EMP-1188",
		department: "Product",
		position: "Product Manager",
		status: "active",
		payType: "monthly",
		monthlySalary: 42000,
		allowances: {
			transportation: 2000,
			meal: 1500,
			communication: 800,
			other: 300,
		},
		lastSlipGenerated: "Dec 31, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 3,
		firstName: "Noah",
		lastName: "Patel",
		employeeId: "EMP-1166",
		department: "Finance",
		position: "Financial Analyst",
		status: "active",
		payType: "monthly",
		monthlySalary: 38000,
		allowances: {
			transportation: 1500,
			meal: 1200,
			communication: 500,
			other: 200,
		},
		lastSlipGenerated: "Dec 31, 2025",
		hasSlipForPeriod: true, // Already has slip for current period
	},
	{
		id: 4,
		firstName: "Sophia",
		lastName: "Reyes",
		employeeId: "EMP-1152",
		department: "Operations",
		position: "Operations Manager",
		status: "active",
		payType: "monthly",
		monthlySalary: 40000,
		allowances: {
			transportation: 1800,
			meal: 1400,
			communication: 700,
			other: 300,
		},
		lastSlipGenerated: "Nov 30, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 5,
		firstName: "Mason",
		lastName: "Clark",
		employeeId: "EMP-1144",
		department: "Support",
		position: "Support Specialist",
		status: "active",
		payType: "monthly",
		monthlySalary: 28000,
		allowances: {
			transportation: 1200,
			meal: 1000,
			communication: 500,
			other: 0,
		},
		lastSlipGenerated: "Nov 30, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 6,
		firstName: "Olivia",
		lastName: "Carter",
		employeeId: "EMP-1129",
		department: "Marketing",
		position: "Marketing Coordinator",
		status: "active",
		payType: "monthly",
		monthlySalary: 32000,
		allowances: {
			transportation: 1500,
			meal: 1200,
			communication: 600,
			other: 200,
		},
		lastSlipGenerated: "Oct 31, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 7,
		firstName: "Ethan",
		lastName: "Brooks",
		employeeId: "EMP-1118",
		department: "Engineering",
		position: "Junior Developer",
		status: "active",
		payType: "monthly",
		monthlySalary: 35000,
		allowances: {
			transportation: 1500,
			meal: 1200,
			communication: 500,
			other: 0,
		},
		lastSlipGenerated: "Oct 31, 2025",
		hasSlipForPeriod: false,
	},
	{
		id: 8,
		firstName: "Mia",
		lastName: "Lopez",
		employeeId: "EMP-1105",
		department: "HR",
		position: "HR Specialist",
		status: "active",
		payType: "monthly",
		monthlySalary: 30000,
		allowances: {
			transportation: 1200,
			meal: 1000,
			communication: 500,
			other: 100,
		},
		lastSlipGenerated: "Sep 30, 2025",
		hasSlipForPeriod: false,
	},
];

// Mock attendance data generator
const generateMockAttendance = (workingDays: number): AttendanceRecord[] => {
	const records: AttendanceRecord[] = [];
	for (let i = 0; i < workingDays; i++) {
		records.push({
			date: `2026-01-${String(i + 1).padStart(2, '0')}`,
			status: i % 10 === 0 ? "absent" : "present",
			regularHours: i % 10 === 0 ? 0 : 8,
			overtimeHours: i % 5 === 0 ? 2 : 0,
			undertimeHours: 0,
		});
	}
	return records;
};

// ==================== Component ====================

const pageSize = 7;

const formatPHP = (value: number) =>
	value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const getInitials = (firstName: string, lastName: string) =>
	(firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

export default function GenerateSlip() {
	const [search, setSearch] = useState("");
	const [department, setDepartment] = useState<string>("");
	const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
	const [page, setPage] = useState(1);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);
	
	// Manual hours input state
	const [totalRegularHours, setTotalRegularHours] = useState<number>(0);
	const [totalOvertimeHours, setTotalOvertimeHours] = useState<number>(0);
	const [totalUndertimeHours, setTotalUndertimeHours] = useState<number>(0);
	const [totalAbsentDays, setTotalAbsentDays] = useState<number>(0);

	const selectedPeriod = payrollPeriods[selectedPeriodIndex];

	const departments = useMemo(
		() => Array.from(new Set(employeeData.map((e) => e.department))),
		[]
	);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return employeeData.filter((e) => {
			const matchesSearch = term
				? [e.firstName, e.lastName, e.employeeId, e.department, e.position]
					.join(" ")
					.toLowerCase()
					.includes(term)
				: true;
			const matchesDepartment = department ? e.department === department : true;
			const matchesStatus = e.status === "active";
			const pendingOnly = !e.hasSlipForPeriod;
			return matchesSearch && matchesDepartment && matchesStatus && pendingOnly;
		});
	}, [search, department]);

	const paginated = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

	const resetPage = () => setPage(1);

	const handleSearch = (value: string) => {
		setSearch(value);
		resetPage();
	};

	const handleDepartment = (value: string) => {
		setDepartment(value);
		resetPage();
	};

	const openEmployee = async (employee: Employee) => {
		// Validation: Check if attendance is finalized
		if (selectedPeriod.attendanceStatus !== "finalized") {
			await Swal.fire({
				icon: "warning",
				title: "Attendance Not Finalized",
				text: `Attendance for ${selectedPeriod.month} has not been finalized yet. Please finalize attendance before generating payslips.`,
				confirmButtonColor: "#3b82f6",
			});
			return;
		}

		// Validation: Check if slip already exists
		if (employee.hasSlipForPeriod) {
			await Swal.fire({
				icon: "info",
				title: "Payslip Already Exists",
				html: `A payslip for <strong>${employee.firstName} ${employee.lastName}</strong> already exists for ${selectedPeriod.month}.<br><br>Please use "View Slip" to see existing payslips.`,
				confirmButtonColor: "#3b82f6",
			});
			return;
		}

		// Validation: Check employee status
		if (employee.status !== "active") {
			await Swal.fire({
				icon: "error",
				title: "Inactive Employee",
				text: `Cannot generate payslip for inactive employee.`,
				confirmButtonColor: "#3b82f6",
			});
			return;
		}

		// Reset hours input fields
		const expectedRegularHours = selectedPeriod.workingDays * 8;
		setTotalRegularHours(expectedRegularHours);
		setTotalOvertimeHours(0);
		setTotalUndertimeHours(0);
		setTotalAbsentDays(0);
		
		setSelectedEmployee(employee);
		setCalculation(null);
	};

	const closeEmployee = () => {
		setSelectedEmployee(null);
		setCalculation(null);
		setTotalRegularHours(0);
		setTotalOvertimeHours(0);
		setTotalUndertimeHours(0);
		setTotalAbsentDays(0);
	};
	
	// Auto-calculate when hours change
	const handleCalculate = () => {
		if (!selectedEmployee) return;
		
		// Create attendance records from manual input
		const attendanceRecords: AttendanceRecord[] = [];
		const daysPresent = selectedPeriod.workingDays - totalAbsentDays;
		
		// Generate records based on manual input
		for (let i = 0; i < selectedPeriod.workingDays; i++) {
			attendanceRecords.push({
				date: `${selectedPeriod.startDate.substring(0, 8)}${String(i + 1).padStart(2, '0')}`,
				status: i < totalAbsentDays ? "absent" : "present",
				regularHours: i < totalAbsentDays ? 0 : totalRegularHours / daysPresent,
				overtimeHours: i < totalAbsentDays ? 0 : totalOvertimeHours / daysPresent,
				undertimeHours: i < totalAbsentDays ? 0 : totalUndertimeHours / daysPresent,
			});
		}
		
		const calc = calculatePayroll(selectedEmployee, attendanceRecords, selectedPeriod);
		setCalculation(calc);
	};

	const handleGenerateSlip = async () => {
		if (!selectedEmployee || !calculation) return;

		// Confirm generation
		const result = await Swal.fire({
			icon: "question",
			title: "Generate Payslip?",
			html: `
				<div class="text-left">
					<p class="mb-2">You are about to generate a payslip for:</p>
					<ul class="list-disc list-inside mb-4">
						<li><strong>Employee:</strong> ${selectedEmployee.firstName} ${selectedEmployee.lastName}</li>
						<li><strong>Period:</strong> ${selectedPeriod.month}</li>
						<li><strong>Net Pay:</strong> ${formatPHP(calculation.netPay)}</li>
					</ul>
					<p class="text-sm text-gray-600">This action will lock the payslip data and cannot be undone without proper authorization.</p>
				</div>
			`,
			showCancelButton: true,
			confirmButtonText: "Generate Payslip",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#3b82f6",
			cancelButtonColor: "#6b7280",
		});

		if (!result.isConfirmed) return;

		setIsGenerating(true);
		
		// Simulate API call to save payslip
		await new Promise((resolve) => setTimeout(resolve, 2000));
		
		// Update employee data to mark slip as generated
		const employeeIndex = employeeData.findIndex(e => e.id === selectedEmployee.id);
		if (employeeIndex !== -1) {
			employeeData[employeeIndex].hasSlipForPeriod = true;
			employeeData[employeeIndex].lastSlipGenerated = new Date().toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'short', 
				day: 'numeric' 
			});
		}
		
		setIsGenerating(false);

		await Swal.fire({
			icon: "success",
			title: "Payslip Generated Successfully",
			html: `
				<div class="text-left">
					<p class="mb-2">Payslip details:</p>
					<ul class="list-disc list-inside mb-4">
						<li><strong>Employee:</strong> ${selectedEmployee.firstName} ${selectedEmployee.lastName}</li>
						<li><strong>Period:</strong> ${selectedPeriod.month}</li>
						<li><strong>Gross Pay:</strong> ${formatPHP(calculation.grossPay)}</li>
						<li><strong>Net Pay:</strong> ${formatPHP(calculation.netPay)}</li>
					</ul>
					<p class="text-sm text-green-700">The payslip has been locked and is ready for review.</p>
				</div>
			`,
			confirmButtonColor: "#3b82f6",
			timer: 5000,
		});

		closeEmployee();
	};

	const startIndex = (page - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, filtered.length);

	const completedSlips = employeeData.filter(e => e.hasSlipForPeriod).length;
	const pendingSlips = employeeData.filter(e => e.status === "active" && !e.hasSlipForPeriod).length;
	const failedSlips = 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Generate Payslip</h1>
				<p className="text-gray-600 dark:text-gray-400">Calculate and generate employee payslips with automatic deductions.</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2">
					<label className="text-sm text-gray-600 dark:text-gray-300">Search</label>
					<input
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search by name, ID, position, or department"
						className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
					/>
				</div>
				<div>
					<label className="text-sm text-gray-600 dark:text-gray-300">Department</label>
					<select
						value={department}
						onChange={(e) => handleDepartment(e.target.value)}
						aria-label="Filter by department"
						className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
					>
						<option value="">All</option>
						{departments.map((d) => (
							<option key={d} value={d}>{d}</option>
						))}
					</select>
				</div>
			</div>

			{/* Employee Table */}
			<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
				<div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Employees</h3>
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300">Payroll Period: </label>
						<select
							value={selectedPeriodIndex}
							onChange={(e) => setSelectedPeriodIndex(Number(e.target.value))}
							aria-label="Select payroll period"
							className="ml-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-900 dark:text-white inline-block"
						>
							{payrollPeriods.map((period, index) => (
								<option key={index} value={index}>
									{period.month} {period.attendanceStatus === "finalized" ? "✓" : "⏳"}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
						<thead className="bg-gray-50 dark:bg-gray-900/40 text-xs uppercase text-gray-500 dark:text-gray-400">
							<tr>
								<th className="px-6 py-3 text-left">Employee</th>
								<th className="px-6 py-3 text-left">Position</th>
								<th className="px-6 py-3 text-left">Pay Type</th>
								<th className="px-6 py-3 text-left">Base Salary</th>
								<th className="px-6 py-3 text-left">Status</th>
								<th className="px-6 py-3 text-center">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
							{paginated.length === 0 && (
								<tr>
									<td className="px-6 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
										No active employees found.
									</td>
								</tr>
							)}
							{paginated.map((employee) => (
								<tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
												<span className="text-blue-600 dark:text-blue-300 font-medium text-sm">{getInitials(employee.firstName, employee.lastName)}</span>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold text-gray-900 dark:text-white">{employee.firstName} {employee.lastName}</span>
												<span className="text-xs text-gray-500 dark:text-gray-400">{employee.employeeId} · {employee.department}</span>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-gray-700 dark:text-gray-300">{employee.position}</td>
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium capitalize">
											{employee.payType}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
										{employee.monthlySalary ? formatPHP(employee.monthlySalary) : 
										 employee.dailyRate ? formatPHP(employee.dailyRate) + "/day" :
										 employee.hourlyRate ? formatPHP(employee.hourlyRate) + "/hr" : "N/A"}
									</td>
									<td className="px-6 py-4">
										{employee.hasSlipForPeriod ? (
											<span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold">
												Generated
											</span>
										) : (
											<span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
												Pending
											</span>
										)}
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => openEmployee(employee)}
											disabled={employee.hasSlipForPeriod}
											className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
												employee.hasSlipForPeriod
													? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
													: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
											}`}
											title={employee.hasSlipForPeriod ? "Payslip already generated" : "Generate payslip for this employee"}
											aria-label="Generate payslip"
										>
											<CalculatorIcon className={`size-5 ${employee.hasSlipForPeriod ? "text-gray-400" : "text-blue-600 dark:text-blue-400"}`} />
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

			{/* Generation Modal - Continued in next part due to length */}
			{selectedEmployee && createPortal(
				<div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
					<div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Payslip</h3>
								<p className="text-gray-500 dark:text-gray-400 text-sm">{selectedPeriod.month} ({selectedPeriod.startDate} to {selectedPeriod.endDate})</p>
							</div>
							<button
								onClick={closeEmployee}
								className="text-2xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
							>
								×
							</button>
						</div>

						{/* Employee Info */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							<div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Employee Information</p>
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
										<span className="text-blue-600 dark:text-blue-300 font-medium">{getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}</span>
									</div>
									<div>
										<p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.employeeId} · {selectedEmployee.position}</p>
									</div>
								</div>
								<div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
									<div className="flex justify-between py-1">
										<span className="text-gray-600 dark:text-gray-400">Department:</span>
										<span className="font-medium">{selectedEmployee.department}</span>
									</div>
									<div className="flex justify-between py-1">
										<span className="text-gray-600 dark:text-gray-400">Pay Type:</span>
										<span className="font-medium capitalize">{selectedEmployee.payType}</span>
									</div>
								</div>
							</div>

							<div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pay Configuration</p>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Base Salary:</span>
										<span className="font-semibold text-gray-900 dark:text-white">
											{selectedEmployee.monthlySalary ? formatPHP(selectedEmployee.monthlySalary) + "/mo" : 
											 selectedEmployee.dailyRate ? formatPHP(selectedEmployee.dailyRate) + "/day" :
											 selectedEmployee.hourlyRate ? formatPHP(selectedEmployee.hourlyRate) + "/hr" : "N/A"}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Transportation:</span>
										<span className="font-medium text-gray-900 dark:text-white">{formatPHP(selectedEmployee.allowances.transportation)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Meal Allowance:</span>
										<span className="font-medium text-gray-900 dark:text-white">{formatPHP(selectedEmployee.allowances.meal)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Communication:</span>
										<span className="font-medium text-gray-900 dark:text-white">{formatPHP(selectedEmployee.allowances.communication)}</span>
									</div>
									{selectedEmployee.loans && selectedEmployee.loans.monthlyDeduction > 0 && (
										<div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400">Loan Deduction:</span>
											<span className="font-medium text-red-600 dark:text-red-400">-{formatPHP(selectedEmployee.loans.monthlyDeduction)}</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Hours Input Section */}
						<div className="mb-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
										<ClockIcon className="size-5 text-blue-600 dark:text-blue-400" />
										Enter Hours Worked
									</h4>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Input the total hours for {selectedPeriod.month} ({selectedPeriod.workingDays} working days)</p>
								</div>
								<button
									onClick={handleCalculate}
									className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
								>
									<CalculatorIcon className="size-4" />
									Calculate
								</button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Regular Hours
									</label>
									<input
										type="number"
										min="0"
										step="0.5"
										value={totalRegularHours}
										onChange={(e) => setTotalRegularHours(parseFloat(e.target.value) || 0)}
										className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
										placeholder="0"
									/>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expected: {selectedPeriod.workingDays * 8}h</p>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Overtime Hours
									</label>
									<input
										type="number"
										min="0"
										step="0.5"
										value={totalOvertimeHours}
										onChange={(e) => setTotalOvertimeHours(parseFloat(e.target.value) || 0)}
										className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
										placeholder="0"
									/>
									<p className="text-xs text-green-600 dark:text-green-400 mt-1">+25% rate</p>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Undertime Hours
									</label>
									<input
										type="number"
										min="0"
										step="0.5"
										value={totalUndertimeHours}
										onChange={(e) => setTotalUndertimeHours(parseFloat(e.target.value) || 0)}
										className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
										placeholder="0"
									/>
									<p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Deducted</p>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Absent Days
									</label>
									<input
										type="number"
										min="0"
										max={selectedPeriod.workingDays}
										step="1"
										value={totalAbsentDays}
										onChange={(e) => setTotalAbsentDays(parseInt(e.target.value) || 0)}
										className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
										placeholder="0"
									/>
									<p className="text-xs text-red-600 dark:text-red-400 mt-1">Max: {selectedPeriod.workingDays}</p>
								</div>
							</div>
						</div>

						{/* Calculation Results */}
						{isCalculating ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-center">
									<svg className="animate-spin size-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									<p className="text-gray-600 dark:text-gray-400">Calculating payroll...</p>
								</div>
							</div>
						) : calculation ? (
							<div className="space-y-4">
								{/* Hours Breakdown */}
								<div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
									<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
										<ClockIcon className="size-4" />
										Hours Breakdown
									</h4>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400 block mb-1 text-xs">Regular Hours</span>
											<span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(calculation.totalRegularHours * 100) / 100}h</span>
										</div>
										<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400 block mb-1 text-xs">Overtime Hours</span>
											<span className="text-lg font-bold text-green-600 dark:text-green-400">{Math.round(calculation.totalOvertimeHours * 100) / 100}h</span>
										</div>
										<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400 block mb-1 text-xs">Undertime</span>
											<span className="text-lg font-bold text-amber-600 dark:text-amber-400">{Math.round(calculation.totalUndertimeHours * 100) / 100}h</span>
										</div>
										<div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
											<span className="text-gray-600 dark:text-gray-400 block mb-1 text-xs">Absent Days</span>
											<span className="text-lg font-bold text-red-600 dark:text-red-400">{calculation.totalAbsentDays}</span>
										</div>
									</div>
								</div>

								{/* Earnings Breakdown */}
								<div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
									<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Earnings</h4>
									<div className="space-y-2.5 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">Basic Pay</span>
											<span className="text-gray-900 dark:text-white font-medium">{formatPHP(calculation.basicPay)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">Overtime Pay</span>
											<span className="text-green-600 dark:text-green-400 font-medium">+{formatPHP(calculation.overtimePay)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">Allowances</span>
											<span className="text-green-600 dark:text-green-400 font-medium">+{formatPHP(calculation.allowances)}</span>
										</div>
										<div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 mt-2.5">
											<div className="flex items-center justify-between">
												<span className="text-sm font-semibold text-gray-900 dark:text-white">Total Earnings</span>
												<span className="text-base font-bold text-green-600 dark:text-green-400">{formatPHP(calculation.totalEarnings)}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Deductions Breakdown */}
								<div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
									<h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Deductions</h4>
									<div className="space-y-2.5 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">Withholding Tax</span>
											<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.withholdingTax)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">SSS Contribution</span>
											<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.sssContribution)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">PhilHealth Contribution</span>
											<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.philhealthContribution)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600 dark:text-gray-400">Pag-IBIG Contribution</span>
											<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.pagibigContribution)}</span>
										</div>
										{calculation.absentDeductions > 0 && (
											<div className="flex items-center justify-between">
												<span className="text-gray-600 dark:text-gray-400">Absent Deductions</span>
												<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.absentDeductions)}</span>
											</div>
										)}
										{calculation.loanDeductions > 0 && (
											<div className="flex items-center justify-between">
												<span className="text-gray-600 dark:text-gray-400">Loan Payment</span>
												<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.loanDeductions)}</span>
											</div>
										)}
										{calculation.otherDeductions > 0 && (
											<div className="flex items-center justify-between">
												<span className="text-gray-600 dark:text-gray-400">Other Deductions</span>
												<span className="text-gray-900 dark:text-white font-medium">-{formatPHP(calculation.otherDeductions)}</span>
											</div>
										)}
										<div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 mt-2.5">
											<div className="flex items-center justify-between">
												<span className="text-sm font-semibold text-gray-900 dark:text-white">Total Deductions</span>
												<span className="text-base font-bold text-red-600 dark:text-red-400">-{formatPHP(calculation.totalDeductions)}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Net Pay Summary */}
								<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Pay</p>
											<p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{formatPHP(calculation.netPay)}</p>
										</div>
										<CheckCircleIcon className="size-16 text-green-500 dark:text-green-400 opacity-50" />
									</div>
									<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-gray-600 dark:text-gray-400 block">Gross Pay</span>
											<span className="font-semibold text-gray-900 dark:text-white">{formatPHP(calculation.grossPay)}</span>
										</div>
										<div>
											<span className="text-gray-600 dark:text-gray-400 block">Total Deductions</span>
											<span className="font-semibold text-red-600 dark:text-red-400">-{formatPHP(calculation.totalDeductions)}</span>
										</div>
									</div>
								</div>

								{/* Warning Message */}
								<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
									<div className="flex gap-3">
										<AlertIcon className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
										<div className="text-sm text-amber-800 dark:text-amber-300">
											<p className="font-semibold mb-1">Important Notice</p>
											<p>Once generated, this payslip will be locked and cannot be modified without proper authorization. Please verify all calculations before proceeding.</p>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="text-center py-12 text-gray-500 dark:text-gray-400">
								<CalculatorIcon className="size-16 mx-auto mb-4 opacity-30" />
								<p className="text-lg font-medium">Enter hours and click Calculate</p>
								<p className="text-sm">Input the employee's hours worked above to see the payroll calculation</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={closeEmployee}
								disabled={isGenerating}
								className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleGenerateSlip}
								disabled={isGenerating || isCalculating || !calculation}
								className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2 ${
									isGenerating || isCalculating || !calculation
										? "bg-blue-400 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
								}`}
							>
								{isGenerating ? (
									<>
										<svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Generating Payslip...
									</>
								) : (
									<>
										<CheckIcon className="size-4" />
										Generate & Lock Payslip
									</>
								)}
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
}
