import { CustomersView } from "@/components/customers/customers-view";
import { getCustomers } from "@/features/customers/queries";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomersView customers={customers} />;
}
