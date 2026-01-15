/**
 * Shop Owner Registration Approvals Page
 * 
 * Super admin interface for reviewing and approving shop owner registrations
 * Displays pending registrations with full details and document verification
 * 
 * Features:
 * - Stats overview (pending, approved, total)
 * - Expandable registration cards
 * - Document viewing
 * - Approve/reject actions
 * - Operating hours display
 * - Real-time status updates
 * 
 * Props:
 * @param {Array} registrations - Array of shop registration objects from backend
 * @param {Object} stats - Statistics object (pendingCount, approvedToday, totalCount)
 */

import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';

function ShopRegistrations({ auth, registrations = [], stats = {} }) {
  // State to track which registration card is expanded (showing full details)
  const [expandedCardId, setExpandedCardId] = useState(null);
  
  // State to track which document images are expanded (visible)
  const [expandedDocuments, setExpandedDocuments] = useState(new Set());

  /**
   * Handle approve registration action
   * Shows confirmation dialog, then sends approval request to backend
   * @param {number} id - Shop owner registration ID to approve
   */
  const handleApprove = (id) => {
    Swal.fire({
      title: 'Approve Registration?',
      text: 'This shop owner will be able to access their account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(
          `/admin/shop-registrations/${id}/approve`,
          {},
          {
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'Shop owner registration has been approved successfully.',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            onError: () => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve registration. Please try again.',
              });
            },
          }
        );
      }
    });
  };

  /**
   * Handle reject registration action
   * Prompts for rejection reason and sends to backend
   */
  const handleReject = (id) => {
    Swal.fire({
      title: 'Reject Registration?',
      text: 'Please provide a reason for rejection',
      input: 'textarea',
      inputPlaceholder: 'Enter rejection reason...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a rejection reason';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(
          `/admin/shop-registrations/${id}/reject`,
          { rejection_reason: result.value },
          {
            preserveScroll: true,
            onSuccess: () => {
              Swal.fire({
                icon: 'success',
                title: 'Rejected',
                text: 'Shop owner registration has been rejected.',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            onError: () => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to reject registration. Please try again.',
              });
            },
          }
        );
      }
    });
  };

  /**
   * Toggle document visibility
   */
  const toggleDocument = (index) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDocuments(newExpanded);
  };

  // Filter pending registrations
  const pendingRegistrations = registrations.filter((reg) => reg.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Shop Owner Registration Approvals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve pending shop owner registrations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingCount || pendingRegistrations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.approvedToday || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCount || registrations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-6">
        {pendingRegistrations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no pending shop owner registrations to review at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pending Approvals ({pendingRegistrations.length})
              </h2>
            </div>

            {pendingRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Registration Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {registration.business_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Registration #{registration.id} • Submitted {new Date(registration.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Review
                    </span>
                  </div>

                  {/* Quick Info Grid - Shows key registration details at a glance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {registration.first_name} {registration.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Registration Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {registration.registration_type || 'Individual'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Business Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {registration.business_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">

                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {registration.contact_number || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setExpandedCardId(expandedCardId === registration.id ? null : registration.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {expandedCardId === registration.id ? 'Hide Details' : 'View Full Details'}
                    </button>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleReject(registration.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(registration.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCardId === registration.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Personal Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">First Name:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.first_name}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Last Name:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.last_name}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{registration.email}</span>
                              </div>
                              <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{registration.contact_number || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Business Information */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Business Information
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Business Name</label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.business_name}</p>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Address</label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registration.business_address}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Type</label>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 capitalize">{registration.business_type}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">Business Type</label>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 capitalize">{registration.business_type}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Operating Hours */}
                          {registration.operating_hours && Array.isArray(registration.operating_hours) && registration.operating_hours.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Operating Hours
                              </h4>
                              <div className="space-y-2">
                                {registration.operating_hours.map((hours, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{hours.day}</span>
                                    <span className={`text-sm px-2 py-1 rounded ${
                                      hours.open === 'Closed'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    }`}>
                                      {hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Documents */}
                        <div>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Submitted Documents
                            </h4>
                            <div className="space-y-4">
                              {registration.documents && registration.documents.length > 0 ? (
                                registration.documents.map((doc, index) => (
                                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {doc.document_type.replace('_', ' ')}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{doc.file_name}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => toggleDocument(index)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                      >
                                        {expandedDocuments.has(index) ? 'Hide' : 'View'}
                                      </button>
                                    </div>
                                    {expandedDocuments.has(index) && (
                                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <img
                                          src={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                                          alt={doc.document_type}
                                          className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                                          }}
                                        />
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap component with layout
ShopRegistrations.layout = (page) => <SuperAdminLayout auth={page.props.auth}>{page}</SuperAdminLayout>;

export default ShopRegistrations;
