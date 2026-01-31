import { Head } from "@inertiajs/react";
import AppLayoutERP from "../../../layout/AppLayout_ERP";

export default function ERPPricingAndServices() {
  return (
    <AppLayoutERP>
      <Head title="Pricing & Services - Solespace" />
      <div className="p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Pricing & Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Placeholder for pricing, services and packages.</p>
        </div>
      </div>
    </AppLayoutERP>
  );
}
