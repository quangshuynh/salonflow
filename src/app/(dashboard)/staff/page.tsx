import { StaffView } from "@/components/staff/staff-view";
import { getStaffWithTodaysLoad } from "@/features/staff/queries";

export default async function StaffPage() {
  const staff = await getStaffWithTodaysLoad();

  return <StaffView staff={staff} />;
}
