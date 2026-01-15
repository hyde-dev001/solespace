// Converted from TSX to JSX for Inertia
import { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";
import { CheckCircleIcon, EyeIcon, UserIcon, CalenderIcon, DocsIcon, TimeIcon } from "@/icons";

export default function ShopOwnerRegistrationView() {
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandedDocuments, setExpandedDocuments] = useState(new Set());
  const [registrations, setRegistrations] = useState([
    {
      id: 1,
      firstName: "John Paul",
      lastName: "Yambao",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      businessName: "yambao services Repair Shop",
      businessAddress: "123 Main Street, Dasmarinas, Philippines",
      businessType: "Repair",
      serviceType: "Both",
      operatingHours: [
        { day: "Monday", open: "09:00", close: "17:00" },
        { day: "Tuesday", open: "09:00", close: "17:00" },
        { day: "Wednesday", open: "09:00", close: "17:00" },
        { day: "Thursday", open: "09:00", close: "17:00" },
        { day: "Friday", open: "09:00", close: "17:00" },
        { day: "Saturday", open: "10:00", close: "16:00" },
        { day: "Sunday", open: "Closed", close: "Closed" },
      ],
      documentUrls: ["/images/documents/fake documents 1.png", "/images/documents/fake documents.webp"],
      status: "pending",
    },
    {
      id: 2,
      firstName: "John Daniel",
      lastName: "Paragas",
      email: "john@example.com",
      phone: "+1 (555) 987-6543",
      businessName: "Smith's Retail Store",
      businessAddress: "456 Street, Dasmarinas, Philippines",
      businessType: "Retail",
      serviceType: "Retail",
      operatingHours: [
        { day: "Monday", open: "08:00", close: "18:00" },
        { day: "Tuesday", open: "08:00", close: "18:00" },
        { day: "Wednesday", open: "08:00", close: "18:00" },
        { day: "Thursday", open: "08:00", close: "18:00" },
        { day: "Friday", open: "08:00", close: "18:00" },
        { day: "Saturday", open: "09:00", close: "17:00" },
        { day: "Sunday", open: "10:00", close: "16:00" },
      ],
      documentUrls: ["/images/documents/fake documents.webp"],
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: "approved" } : reg));
    // TODO: Send approval to backend
  };

  const handleReject = (id) => {
    setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: "rejected" } : reg));
    // TODO: Send rejection to backend
  };

  const pendingRegistrations = registrations.filter(reg => reg.status === "pending");

  return (
    <>
      <PageMeta title="Shop Owner Registration Approvals | Admin Dashboard" description="Review and approve shop owner registrations" />
      <PageBreadcrumb pageTitle="Shop Owner Registration Approvals" />
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TimeIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRegistrations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{registrations.filter(r => r.status === "approved").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{registrations.length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {pendingRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-600 dark:text-gray-400">There are no pending shop owner registrations to review at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals ({pendingRegistrations.length})</h2>
            </div>
            {pendingRegistrations.map((registration) => (
              <div key={registration.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{registration.businessName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Registration #{registration.id} • Submitted recently</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <TimeIcon className="w-3 h-3 mr-1" />
                        Pending Review
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{registration.firstName} {registration.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DocsIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Business Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{registration.businessType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalenderIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{registration.serviceType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{registration.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={() => setExpandedCardId(expandedCardId === registration.id ? null : registration.id)} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      {expandedCardId === registration.id ? 'Hide Details' : 'View Full Details'}
                    </Button>
                    <div className="flex space-x-3">
                      <Button onClick={() => handleReject(registration.id)} className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-500 rounded-md shadow-sm text-sm font-medium text-white dark:text-white bg-red-500 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reject</Button>
                      <Button onClick={() => handleApprove(registration.id)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                  {expandedCardId === registration.id && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">First Name:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.firstName}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Name:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.lastName}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{registration.email}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.phone}</span>
                              </div>
                            </div>
                          </div>
                          {/* Business Information */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <DocsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Name</span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.businessName}</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Address</span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.businessAddress}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Type</span>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.businessType}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Service Type</span>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.serviceType}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Operating Hours */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <CalenderIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Operating Hours</h3>
                            </div>
                            <div className="space-y-3">
                              {registration.operatingHours.map((hours) => (
                                <div key={hours.day} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-24">{hours.day}</span>
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${hours.open === "Closed" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>{hours.open === "Closed" ? "Closed" : `${hours.open} - ${hours.close}`}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Document Verification */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 h-full">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <DocsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Verification</h3>
                            </div>
                            <div className="space-y-4 h-full">
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Status</span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{registration.documentUrls.length} document{registration.documentUrls.length !== 1 ? 's' : ''} uploaded for verification</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex-1">
                                <div className="flex items-center space-x-2 mb-4">
                                  <DocsIcon className="w-5 h-5 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">Business Documents</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  {registration.documentUrls.map((url, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            <DocsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Document {index + 1}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Business Permit</p>
                                          </div>
                                        </div>
                                        <button onClick={() => {
                                          const newExpanded = new Set(expandedDocuments);
                                          if (newExpanded.has(index)) {
                                            newExpanded.delete(index);
                                          } else {
                                            newExpanded.add(index);
                                          }
                                          setExpandedDocuments(newExpanded);
                                        }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">{expandedDocuments.has(index) ? 'Hide' : 'View'}</button>
                                      </div>
                                      {expandedDocuments.has(index) && (
                                        <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                                          <img src={url} alt={`Business Document ${index + 1}`} className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-center space-x-2">
                                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Verification Complete</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">All documents have been reviewed and approved</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
