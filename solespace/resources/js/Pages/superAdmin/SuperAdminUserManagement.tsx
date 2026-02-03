import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layout/AppLayout';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import {
  UserCircleIcon,
  LockIcon,
  CheckCircleIcon,
  AlertIcon,
  TrashBinIcon,
  UserIcon,
  InfoIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../../icons';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  age: number;
  role?: 'Customer';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'deactivated' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  validIdPath?: string;
}

interface MetricData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'success' | 'error' | 'warning' | 'info';
  description: string;
}

// Professional Metric Card Component
const MetricCard: React.FC<MetricData> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description
}) => {

  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'from-green-500 to-emerald-600';
      case 'error': return 'from-red-500 to-rose-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      case 'info': return 'from-blue-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>

          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
            changeType === 'increase'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {changeType === 'increase' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {value.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};





interface PageProps {
  users: User[];
}

const SuperAdminUserManagement: React.FC<PageProps> = ({ users: initialUsers }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'active' | 'deactivated' | 'suspended'>('active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deactivateReason, setDeactivateReason] = useState<string>('');

  // Initialize with data from backend
  const [users, setUsers] = useState<User[]>(initialUsers || []);

  // Filter users based on status, and search term
  const filteredUsers = users.filter(user => {
    const statusMatch = user.status === filterStatus;
    const searchMatch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Handle approve/reject user
  const handleApproval = async (userId: number, action: 'approve' | 'reject') => {
    const result = await Swal.fire({
      title: action === 'approve' ? 'Approve User?' : 'Reject User?',
      text: `Are you sure you want to ${action} this user registration?`,
      icon: action === 'approve' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: action === 'approve' ? 'Yes, approve' : 'Yes, reject',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: action === 'approve' ? 'approved' : 'rejected' }
          : user
      ));
      Swal.fire({
        icon: action === 'approve' ? 'success' : 'warning',
        title: action === 'approve' ? 'Approved!' : 'Rejected!',
        text: `User has been ${action}d successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Handle deactivate account
  const handleDeactivate = async () => {
    if (!selectedUser) return;

    const userToDeactivate = selectedUser; // Capture user before closing modal

    // Close modal first to prevent z-index issues
    setIsDeactivateModalOpen(false);
    setSelectedUser(null);
    setDeactivateReason('');

    // Wait for modal to close before showing SweetAlert
    setTimeout(async () => {
      const result = await Swal.fire({
        title: 'Deactivate Account?',
        text: `Are you sure you want to deactivate ${userToDeactivate.name}'s account? This action can be reversed later.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, deactivate',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'z-[10000]'
        }
      });

      if (result.isConfirmed) {
        setUsers(users.map(user =>
          user.id === userToDeactivate.id
            ? { ...user, status: 'deactivated' }
            : user
        ));

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Account Deactivated!',
          text: `${userToDeactivate.name}'s account has been deactivated successfully.`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'z-[10000]'
          }
        });
      }
    }, 100); // Small delay to ensure modal closes
  };

  const openDeactivateModal = (user: User) => {
    setSelectedUser(user);
    setIsDeactivateModalOpen(true);
  };

  // Handle reset password
  const handleResetPassword = () => {
    // In real app, this would send a reset email
    Swal.fire({
      icon: 'info',
      title: 'Password Reset',
      text: 'A password reset link has been sent to the user\'s email.',
      timer: 3000,
      showConfirmButton: false
    });
  };



  return (
    <AppLayout>
      <Head title="User Registration Management" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              User Registration Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage user registrations, approvals, and account controls
            </p>
          </div>
          <Link
            href="/superAdmin/flagged-accounts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            View Flagged Accounts
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={users.length}
            change={12}
            changeType="increase"
            icon={UserCircleIcon}
            color="info"
            description="Total registered users"
          />
          <MetricCard
            title="Pending Approvals"
            value={users.filter(u => u.status === 'pending').length}
            change={-5}
            changeType="decrease"
            icon={AlertIcon}
            color="warning"
            description="Users awaiting approval"
          />
          <MetricCard
            title="Active Users"
            value={users.filter(u => u.status === 'active' || u.status === 'approved').length}
            change={8}
            changeType="increase"
            icon={CheckCircleIcon}
            color="success"
            description="Currently active users"
          />
          <MetricCard
            title="Deactivated"
            value={users.filter(u => u.status === 'deactivated').length}
            change={2}
            changeType="increase"
            icon={TrashBinIcon}
            color="error"
            description="Deactivated accounts"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                aria-label="Search Users"
                className="px-9 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'pending' | 'approved' | 'rejected' | 'active' | 'deactivated' | 'suspended')}
                aria-label="Filter by Status"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Register Users ({filteredUsers.length})
            </h3>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Customer
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        user.status === 'approved' || user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        user.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <InfoIcon className={user.status === 'pending' ? "h-5 w-5 text-yellow-600 dark:text-yellow-400" : "h-5 w-5"} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsPasswordModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Reset Password"
                        >
                          <LockIcon className="h-5 w-5" />
                        </button>
                        {user.status !== 'deactivated' && (
                          <button
                            onClick={() => openDeactivateModal(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Deactivate Account"
                          >
                            <TrashBinIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



        {/* Password Reset Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 h-full w-full bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Reset Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User: {selectedUser?.name}
                    </label>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email: {selectedUser?.email}
                    </label>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                    <div className="flex">
                      <AlertIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Password Reset Confirmation
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>
                            This will send a password reset link to the user's email address.
                            The user will be able to set a new password using the link.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    if (selectedUser) {
                      handleResetPassword();
                      setIsPasswordModalOpen(false);
                      setSelectedUser(null);
                    }
                  }}>
                    Send Reset Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Details Modal */}
        {isViewModalOpen && (
          <div className="fixed inset-0 h-full w-full bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  User Details
                </h3>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.age}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Role
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          selectedUser.status === 'approved' || selectedUser.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          selectedUser.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {selectedUser.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Created At
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Login
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedUser.lastLogin ? selectedUser.lastLogin.toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {selectedUser.status === 'pending' && (
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Approval Actions
                        </h4>
                      )}
                      <div className="flex justify-between items-center">
                        {selectedUser.status === 'pending' && (
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => {
                                handleApproval(selectedUser.id, 'approve');
                                setIsViewModalOpen(false);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => {
                                handleApproval(selectedUser.id, 'reject');
                                setIsViewModalOpen(false);
                              }}
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                            >
                              <AlertIcon className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Account Modal */}
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 h-full w-full bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Deactivate Account
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User: {selectedUser?.name}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Deactivation
                    </label>
                    <select
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      aria-label="Select Reason"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a reason</option>
                      <option value="Violation of Terms">Violation of Terms</option>
                      <option value="Suspicious Activity">Suspicious Activity</option>
                      <option value="Request by User">Request by User</option>
                      <option value="Inactivity">Inactivity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <div className="flex">
                      <AlertIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Account Deactivation Warning
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          <p>
                            This action will deactivate the user's account. The user will no longer be able to access the system.
                            This action can be reversed by reactivating the account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsDeactivateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeactivate}
                    disabled={!deactivateReason}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SuperAdminUserManagement;
