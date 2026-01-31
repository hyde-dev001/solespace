import { Head } from "@inertiajs/react";
import AppLayoutShopOwner from "../../layout/AppLayout_shopOwner";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";

interface Props {
  // Add props from Laravel controller later
}

export default function Ecommerce() {
  return (
    <AppLayoutShopOwner>
      <Head title="Ecommerce Dashboard - Shop Owner" />
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Ecommerce Dashboard
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Overview of your shop's ecommerce performance
          </p>
        </div>

        <EcommerceMetrics />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <MonthlySalesChart />
          <MonthlyTarget />
        </div>

        <StatisticsChart />

        <RecentOrders />
      </div>
    </AppLayoutShopOwner>
  );
}
