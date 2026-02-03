import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, FileText, AlertCircle, Filter } from 'lucide-react';

interface Payslip {
    id: number;
    period_start: string;
    period_end: string;
    basic_salary: number;
    allowances: number;
    deductions: number;
    gross_salary: number;
    net_salary: number;
    status: string;
    generated_at: string;
}

export default function MyPayslips() {
    const [loading, setLoading] = useState(true);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

    useEffect(() => {
        fetchPayslips();
    }, [selectedYear]);

    useEffect(() => {
        if (payslips.length > 0) {
            filterPayslips();
        }
    }, [payslips, selectedYear]);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const url = `/api/hr/self-service/payslips${selectedYear ? `?year=${selectedYear}` : ''}`;
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setPayslips(data.payslips);
            } else {
                setError(data.message || 'Failed to load payslips');
            }
        } catch (err) {
            console.error('Error fetching payslips:', err);
            setError('An error occurred while loading payslips');
        } finally {
            setLoading(false);
        }
    };

    const filterPayslips = () => {
        let filtered = [...payslips];
        if (selectedYear) {
            filtered = filtered.filter(p => 
                new Date(p.period_start).getFullYear() === selectedYear
            );
        }
        setFilteredPayslips(filtered);
    };

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        return years;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatPeriod = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
                    <p className="text-gray-600 mt-1">View and download your salary slips</p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {getYearOptions().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {filteredPayslips.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Payslips</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredPayslips.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Gross</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(filteredPayslips.reduce((sum, p) => sum + p.gross_salary, 0))}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Net</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(filteredPayslips.reduce((sum, p) => sum + p.net_salary, 0))}
                        </p>
                    </div>
                </div>
            )}

            {/* Payslips List */}
            {filteredPayslips.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips Found</h3>
                    <p className="text-gray-600">No payslips available for the selected year.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Basic Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Allowances
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deductions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayslips.map((payslip) => (
                                    <tr key={payslip.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {formatPeriod(payslip.period_start, payslip.period_end)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(payslip.basic_salary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            +{formatCurrency(payslip.allowances)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -{formatCurrency(payslip.deductions)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-blue-600">
                                                {formatCurrency(payslip.net_salary)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                payslip.status === 'processed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payslip.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => setSelectedPayslip(payslip)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <Download className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
