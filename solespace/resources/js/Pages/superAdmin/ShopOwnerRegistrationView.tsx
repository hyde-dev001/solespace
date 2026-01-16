import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "../../layout/AppLayout";
import Swal from 'sweetalert2';
import Button from "../../components/ui/button/Button";
import {
  CheckCircleIcon,
  EyeIcon,
  UserIcon,
  CalenderIcon,
  DocsIcon,
  TimeIcon,
  AlertIcon,
  InfoIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "../../icons";

interface OperatingHours {
  day: string;
  open: string;
  close: string;
}

interface Registration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  serviceType: string;
  operatingHours: OperatingHours[];
  documentUrls: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
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

export default function ShopOwnerRegistrationView({ registrations = [] }: { registrations?: Registration[] }) {
  console.log('Registrations received:', registrations);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<number>>(new Set());
  const [registrationsState, setRegistrationsState] = useState<Registration[]>(registrations);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Approve Registration?',
      text: 'Are you sure you want to approve this shop owner registration?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      router.post(`/superAdmin/shop-owner-registration/${id}/approve`, {}, {
        onSuccess: () => {
          setRegistrationsState(prev =>
            prev.map(reg => reg.id === id ? { ...reg, status: "approved" as const } : reg)
          );
          Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: 'Shop owner registration has been approved successfully.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        onError: (errors) => {
          console.error('Approval error:', errors);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to approve registration. Please try again.'
          });
        }
      });
    }
  };

  const handleReject = async (id: number) => {
    const result = await Swal.fire({
      title: 'Reject Registration?',
      text: 'Are you sure you want to reject this shop owner registration?',
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Enter reason for rejection (optional)',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      router.post(`/superAdmin/shop-owner-registration/${id}/reject`, 
        {
          rejection_reason: result.value || ''
        },
        {
          onSuccess: () => {
            setRegistrationsState(prev =>
              prev.map(reg => reg.id === id ? { ...reg, status: "rejected" as const } : reg)
            );
            Swal.fire({
              icon: 'warning',
              title: 'Rejected!',
              text: 'Shop owner registration has been rejected.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          onError: (errors) => {
            console.error('Rejection error:', errors);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to reject registration. Please try again.'
            });
          }
        }
      );
    }
  };

  // Filter registrations based on status and search term
  const filteredRegistrations = registrationsState.filter(reg => {
    const statusMatch = reg.status === filterStatus;
    const searchMatch = searchTerm === '' ||
      reg.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${reg.firstName} ${reg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <AppLayout>
      <Head title="Shop Owner Registration Approvals" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Shop Owner Registration Approvals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage shop owner registrations, approvals, and verifications
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Applications"
              value={registrationsState.length}
              change={12}
              changeType="increase"
              icon={UserIcon}
              color="info"
              description="Total shop owner applications"
            />
            <MetricCard
              title="Pending Reviews"
              value={registrationsState.filter(r => r.status === 'pending').length}
              change={5}
              changeType="decrease"
              icon={TimeIcon}
              color="warning"
              description="Awaiting approval"
            />
            <MetricCard
              title="Approved"
              value={registrationsState.filter(r => r.status === 'approved').length}
              change={8}
              changeType="increase"
              icon={CheckCircleIcon}
              color="success"
              description="Successfully approved"
            />
            <MetricCard
              title="Rejected"
              value={registrationsState.filter(r => r.status === 'rejected').length}
              change={2}
              changeType="increase"
              icon={AlertIcon}
              color="error"
              description="Application rejected"
            />
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Applications
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by business name or email..."
                  aria-label="Search Applications"
                  className="px-9 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                  aria-label="Filter by Status"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shop Owner Applications ({filteredRegistrations.length})
              </h3>
            </div>
            <div className="overflow-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Business Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Business Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <DocsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{reg.businessName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{reg.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{reg.firstName} {reg.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {reg.businessType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          reg.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 items-center">
                          <button
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setIsViewModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-xs font-medium transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReject(reg.id)}
                                className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 text-xs font-medium transition-colors"
                                title="Reject"
                              >
                                <AlertIcon className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleApprove(reg.id)}
                                className="inline-flex items-center px-3 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-xs font-medium transition-colors"
                                title="Approve"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRegistrations.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are no {filterStatus} shop owner registrations to review.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* View Details Modal */}
          {isViewModalOpen && selectedRegistration && (
            <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedRegistration.businessName} - Registration Details
                  </h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none font-light"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2" />
                            Personal Information
                          </h4>
                          <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">First Name</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.firstName}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Name</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.lastName}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.email}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Phone</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Business Information */}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <DocsIcon className="w-5 h-5 mr-2" />
                            Business Information
                          </h4>
                          <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Business Name</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.businessName}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Business Type</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.businessType}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Service Type</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.serviceType}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Address</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedRegistration.businessAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Documents */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <DocsIcon className="w-5 h-5 mr-2" />
                          Submitted Documents
                        </h4>
                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                          {selectedRegistration.documentUrls && selectedRegistration.documentUrls.length > 0 ? (
                            selectedRegistration.documentUrls.map((url, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                      <DocsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                        Document {index + 1}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {['BIR Registration', 'Valid ID', 'Business Permit', 'Tax Certificate'][index % 4]}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedDocuments);
                                      if (newExpanded.has(index)) {
                                        newExpanded.delete(index);
                                      } else {
                                        newExpanded.add(index);
                                      }
                                      setExpandedDocuments(newExpanded);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                                  >
                                    {expandedDocuments.has(index) ? 'Hide' : 'View'}
                                  </button>
                                </div>
                                {expandedDocuments.has(index) && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <div className="bg-gray-100 dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center" style={{ minHeight: '200px' }}>
                                      <img
                                        src={url}
                                        alt={`Document ${index + 1}`}
                                        className="max-w-full max-h-96 rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) parent.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 text-center">Unable to load image</p>';
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No documents uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <CalenderIcon className="w-5 h-5 mr-2" />
                        Operating Hours
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        {selectedRegistration.operatingHours.map((hours) => (
                          <div key={hours.day} className="bg-white dark:bg-gray-800 p-2 rounded text-center border border-gray-200 dark:border-gray-600">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{hours.day}</p>
                            <p className={`text-xs font-medium mt-1 ${
                              hours.open === "Closed"
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}>
                              {hours.open === "Closed" ? "Closed" : `${hours.open} - ${hours.close}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-end gap-3">
                        {selectedRegistration.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => {
                                handleReject(selectedRegistration.id);
                                setIsViewModalOpen(false);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <AlertIcon className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => {
                                handleApprove(selectedRegistration.id);
                                setIsViewModalOpen(false);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
