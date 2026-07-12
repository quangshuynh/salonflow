export type ServiceCategory = "hair" | "nails" | "spa" | "lashes" | "barber";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
};

export type StaffRole =
  | "stylist"
  | "barber"
  | "nail-tech"
  | "esthetician"
  | "manager";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  initials: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lastVisit: string | null;
  totalVisits: number;
  totalSpent: number;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export type Appointment = {
  id: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
};

export type AppointmentWithRelations = Appointment & {
  customer: Customer;
  staff: StaffMember;
  service: Service;
};
