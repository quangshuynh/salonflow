import { CustomersView } from "@/components/customers/customers-view";
import { getCustomers } from "@/features/customers/queries";

export default function CustomersPage() {
  const customers = getCustomers();

  return <CustomersView initialCustomers={customers} />;
}
