import { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";
import AppLayoutERP from "../../layout/AppLayout_ERP";

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    requiresPasswordChange: boolean;
}

export default function Profile({ user, requiresPasswordChange }: PageProps) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // Password strength validation
    const validatePassword = (pwd: string) => {
        return {
            hasMinLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
        };
    };

    const passwordStrength = validatePassword(data.password);
    const isPasswordStrong = Object.values(passwordStrength).every(v => v);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route("erp.password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // Determine destination based on role
                const role = user?.role?.toUpperCase();
                const isHR = role === "HR";
                const isFinance = role === "FINANCE_STAFF" || role === "FINANCE_MANAGER";
                const isCRM = role === "CRM";
                const isManager = role === "MANAGER";
                const isStaff = role === "STAFF";

                const confirmText = isHR
                    ? "Go to HR Dashboard"
                    : isFinance
                    ? "Go to Finance Dashboard"
                    : isCRM
                    ? "Go to CRM Dashboard"
                    : isManager
                    ? "Go to Manager Dashboard"
                    : isStaff
                    ? "Go to Staff Dashboard"
                    : "Continue";

                const destination = isHR
                    ? route('erp.hr')
                    : isFinance
                    ? route('finance.index')
                    : isCRM
                    ? route('crm.dashboard')
                    : isManager
                    ? route('erp.manager.dashboard')
                    : isStaff
                    ? route('erp.staff.dashboard')
                    : route('erp.profile');

                // Show success alert and redirect to the correct module
                Swal.fire({
                    title: "Success!",
                    text: "Your password has been changed successfully.",
                    icon: "success",
                    confirmButtonText: confirmText,
                    confirmButtonColor: "#2563eb",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then(() => {
                    router.visit(destination);
                });
            },
            onError: () => {
                // Show error alert if something goes wrong
                Swal.fire({
                    title: "Error",
                    text: "Failed to update password. Please check your current password and try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#ef4444",
                });
            },
        });
    };

    return (
        <AppLayoutERP>
            <Head title="Profile - Solespace ERP" />
            
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="px-4 py-6 sm:px-6">
                            {requiresPasswordChange && (
                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        ⚠️ You are required to change your password on first login.
                                    </p>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    User Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 dark:text-gray-400">Role</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{user.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Form */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Change Password
                                </h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.current_password}
                                            onChange={(e) =>
                                                setData("current_password", e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                                                errors.current_password
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                            disabled={processing}
                                        />
                                        {errors.current_password && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData("password", e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                                                errors.password
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                            disabled={processing}
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors.password}
                                            </p>
                                        )}
                                        
                                        {/* Password Requirements */}
                                        {data.password && (
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
                                                <div className="space-y-1 text-xs">
                                                    <div className={`flex items-center gap-2 ${passwordStrength.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        <span className={`${passwordStrength.hasMinLength ? '✓' : '✗'}`}></span>
                                                        At least 8 characters
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordStrength.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        <span className={`${passwordStrength.hasUppercase ? '✓' : '✗'}`}></span>
                                                        Uppercase letter (A-Z)
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordStrength.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        <span className={`${passwordStrength.hasLowercase ? '✓' : '✗'}`}></span>
                                                        Lowercase letter (a-z)
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        <span className={`${passwordStrength.hasNumber ? '✓' : '✗'}`}></span>
                                                        Number (0-9)
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData("password_confirmation", e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300 dark:border-gray-600`}
                                            disabled={processing}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing || (data.password && !isPasswordStrong)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition"
                                        >
                                            {processing ? "Updating..." : "Update Password"}
                                        </button>
                                        {data.password && !isPasswordStrong && (
                                            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 text-center">
                                                Please meet all password requirements above
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayoutERP>
    );
}
