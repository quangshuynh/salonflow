import type {
  Appointment,
  Customer,
  Service,
  StaffMember,
} from "@/types";

// Dates are generated relative to "now" so the dashboard always shows a
// realistic day, regardless of when the app is run.
function dayAt(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return dayAt(-days, 12);
}

export const MOCK_SERVICES: Service[] = [
  { id: "srv-1", name: "Women's Haircut", category: "hair", durationMin: 45, price: 55 },
  { id: "srv-2", name: "Full Color", category: "hair", durationMin: 90, price: 120 },
  { id: "srv-3", name: "Blowout & Style", category: "hair", durationMin: 30, price: 40 },
  { id: "srv-4", name: "Gel Manicure", category: "nails", durationMin: 45, price: 50 },
  { id: "srv-5", name: "Spa Pedicure", category: "nails", durationMin: 60, price: 65 },
  { id: "srv-6", name: "Classic Lash Set", category: "lashes", durationMin: 90, price: 130 },
  { id: "srv-7", name: "Men's Cut & Beard Trim", category: "barber", durationMin: 40, price: 45 },
  { id: "srv-8", name: "Signature Facial", category: "spa", durationMin: 60, price: 95 },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: "stf-1", name: "Mai Tran", role: "nail-tech", initials: "MT" },
  { id: "stf-2", name: "Jessica Alvarez", role: "stylist", initials: "JA" },
  { id: "stf-3", name: "Marcus Lee", role: "barber", initials: "ML" },
  { id: "stf-4", name: "Linh Pham", role: "esthetician", initials: "LP" },
  { id: "stf-5", name: "Sofia Rossi", role: "manager", initials: "SR" },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cus-1", name: "Emily Chen", email: "emily.chen@example.com", phone: "(555) 201-4478", createdAt: daysAgo(210), lastVisit: daysAgo(12), totalVisits: 14, totalSpent: 1240 },
  { id: "cus-2", name: "Sarah Kim", email: "sarah.kim@example.com", phone: "(555) 342-9910", createdAt: daysAgo(98), lastVisit: daysAgo(7), totalVisits: 6, totalSpent: 480 },
  { id: "cus-3", name: "David Nguyen", email: "d.nguyen@example.com", phone: "(555) 887-2301", createdAt: daysAgo(365), lastVisit: daysAgo(21), totalVisits: 22, totalSpent: 990 },
  { id: "cus-4", name: "Rachel Torres", email: "rachel.t@example.com", phone: "(555) 456-7823", createdAt: daysAgo(45), lastVisit: daysAgo(14), totalVisits: 3, totalSpent: 285 },
  { id: "cus-5", name: "Amanda Foster", email: "afoster@example.com", phone: "(555) 990-1122", createdAt: daysAgo(3), lastVisit: null, totalVisits: 0, totalSpent: 0 },
  { id: "cus-6", name: "James Park", email: "jpark@example.com", phone: "(555) 234-5566", createdAt: daysAgo(150), lastVisit: daysAgo(30), totalVisits: 9, totalSpent: 405 },
  { id: "cus-7", name: "Olivia Bennett", email: "olivia.b@example.com", phone: "(555) 678-3344", createdAt: daysAgo(5), lastVisit: daysAgo(2), totalVisits: 1, totalSpent: 130 },
  { id: "cus-8", name: "Nina Patel", email: "nina.patel@example.com", phone: "(555) 112-8899", createdAt: daysAgo(280), lastVisit: daysAgo(9), totalVisits: 18, totalSpent: 1710 },
  { id: "cus-9", name: "Grace Liu", email: "grace.liu@example.com", phone: "(555) 445-6677", createdAt: daysAgo(60), lastVisit: daysAgo(28), totalVisits: 2, totalSpent: 110 },
  { id: "cus-10", name: "Hannah Wright", email: "h.wright@example.com", phone: "(555) 778-9900", createdAt: daysAgo(1), lastVisit: null, totalVisits: 0, totalSpent: 0 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Today — completed earlier in the day
  { id: "apt-1", customerId: "cus-1", staffId: "stf-2", serviceId: "srv-2", startsAt: dayAt(0, 9, 0), endsAt: dayAt(0, 10, 30), status: "completed" },
  { id: "apt-2", customerId: "cus-3", staffId: "stf-3", serviceId: "srv-7", startsAt: dayAt(0, 9, 30), endsAt: dayAt(0, 10, 10), status: "completed" },
  { id: "apt-3", customerId: "cus-8", staffId: "stf-1", serviceId: "srv-4", startsAt: dayAt(0, 10, 0), endsAt: dayAt(0, 10, 45), status: "completed" },
  // Today — later in the day
  { id: "apt-4", customerId: "cus-2", staffId: "stf-1", serviceId: "srv-5", startsAt: dayAt(0, 13, 0), endsAt: dayAt(0, 14, 0), status: "confirmed" },
  { id: "apt-5", customerId: "cus-7", staffId: "stf-4", serviceId: "srv-6", startsAt: dayAt(0, 14, 0), endsAt: dayAt(0, 15, 30), status: "confirmed" },
  { id: "apt-6", customerId: "cus-4", staffId: "stf-2", serviceId: "srv-1", startsAt: dayAt(0, 15, 30), endsAt: dayAt(0, 16, 15), status: "confirmed" },
  { id: "apt-7", customerId: "cus-5", staffId: "stf-4", serviceId: "srv-8", startsAt: dayAt(0, 16, 0), endsAt: dayAt(0, 17, 0), status: "pending" },
  { id: "apt-8", customerId: "cus-6", staffId: "stf-3", serviceId: "srv-7", startsAt: dayAt(0, 11, 0), endsAt: dayAt(0, 11, 40), status: "cancelled" },
  // Yesterday
  { id: "apt-9", customerId: "cus-9", staffId: "stf-2", serviceId: "srv-3", startsAt: dayAt(-1, 11, 0), endsAt: dayAt(-1, 11, 30), status: "completed" },
  { id: "apt-10", customerId: "cus-6", staffId: "stf-1", serviceId: "srv-4", startsAt: dayAt(-1, 15, 0), endsAt: dayAt(-1, 15, 45), status: "no-show" },
  // Tomorrow
  { id: "apt-11", customerId: "cus-10", staffId: "stf-2", serviceId: "srv-1", startsAt: dayAt(1, 10, 0), endsAt: dayAt(1, 10, 45), status: "confirmed" },
  { id: "apt-12", customerId: "cus-1", staffId: "stf-4", serviceId: "srv-8", startsAt: dayAt(1, 14, 0), endsAt: dayAt(1, 15, 0), status: "pending" },
];
