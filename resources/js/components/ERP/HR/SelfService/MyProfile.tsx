import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeProfile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    department: string | null;
    position: string | null;
    hire_date: string | null;
    status: string;
    salary: number;
    address: string | null;
}

export default function MyProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hr/self-service/profile', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setProfile(data.employee);
                setFormData({
                    phone: data.employee.phone || '',
                    address: data.employee.address || '',
                });
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('An error occurred while loading your profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/hr/self-service/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Profile updated successfully!');
                setProfile(data.employee);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('An error occurred while updating your profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span>Profile not found</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">View and update your personal information</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span>{success}</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Read-Only Information */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Employment Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium">Full Name</span>
                                </div>
                                <p className="text-gray-900">{profile.name}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <p className="text-gray-900">{profile.email}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="text-sm font-medium">Position</span>
                                </div>
                                <p className="text-gray-900">{profile.position || 'N/A'}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="text-sm font-medium">Department</span>
                                </div>
                                <p className="text-gray-900">{profile.department || 'N/A'}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Hire Date</span>
                                </div>
                                <p className="text-gray-900">
                                    {profile.hire_date 
                                        ? new Date(profile.hire_date).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    profile.status === 'active' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                To update employment information, please contact HR department.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editable Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Contact Information
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            You can update your contact details below.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </div>
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="123 Main Street, City, State, ZIP"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
