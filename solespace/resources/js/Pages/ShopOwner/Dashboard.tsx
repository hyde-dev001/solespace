import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayoutShopOwner from '../../layout/AppLayout_shopOwner';

interface ShopOwner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  business_address: string;
  business_type: string;
  phone: string;
}

interface Props {
  shop_owner?: ShopOwner;
}

export default function ShopOwnerDashboard() {
  const { shop_owner } = usePage<Props>().props;

  const handleLogout = () => {
    router.post('/shop-owner/logout', {}, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  return (
    <AppLayoutShopOwner>
      <Head title="Shop Owner Dashboard" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {shop_owner?.business_name || 'Shop Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {shop_owner?.first_name} {shop_owner?.last_name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Shop Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Shop Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Business Name</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{shop_owner?.business_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Owner</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{shop_owner?.first_name} {shop_owner?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Email</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{shop_owner?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Business Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Business Type</p>
                <p className="text-lg text-gray-900 dark:text-gray-100 capitalize">{shop_owner?.business_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Address</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{shop_owner?.business_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Contact</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{shop_owner?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Products</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your listings</p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700">View →</a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Services</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage offerings</p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700">View →</a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">View insights</p>
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700">View →</a>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Getting Started</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">✓</span>
              <span>Complete your shop profile</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">✓</span>
              <span>Add your first product or service</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">✓</span>
              <span>Set your operating hours</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">✓</span>
              <span>Start receiving customer inquiries</span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayoutShopOwner>
  );
}
