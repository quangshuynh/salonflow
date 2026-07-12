import { StaffView } from "@/components/staff/staff-view";
import { getStaffWithTodaysLoad } from "@/features/staff/queries";

export default function StaffPage() {
  const staff = getStaffWithTodaysLoad();

  return <StaffView initialStaff={staff} />;
}
