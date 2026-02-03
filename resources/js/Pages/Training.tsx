import { Head } from "@inertiajs/react";
import AppLayout_ERP from "../layout/AppLayout_ERP";
import TrainingComponent from "../components/ERP/HR/Training";

interface Props {
  // Add props from Laravel controller later
}

export default function TrainingPage(props: Props) {
  return (
    <AppLayout_ERP>
      <Head title="Training" />
      <TrainingComponent />
    </AppLayout_ERP>
  );
}
