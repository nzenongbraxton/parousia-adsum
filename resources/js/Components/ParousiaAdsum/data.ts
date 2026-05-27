import type { CheckinMethod } from "./StatusBadge";

export type Checkin = {
  id: string;
  name: string;
  initials: string;
  role: string;
  time: string;
  location: string;
  method: CheckinMethod;
};

export const recentCheckins: Checkin[] = [
  { id: "1", name: "Amelia Okafor", initials: "AO", role: "Senior Nurse", time: "08:02", location: "Lagos HQ • Wing B", method: "GPS-Verified" },
  { id: "2", name: "Marcus Lee", initials: "ML", role: "Floor Engineer", time: "08:11", location: "Plant 4 • Bay 12", method: "IP-Verified" },
  { id: "3", name: "Priya Raman", initials: "PR", role: "Field Auditor", time: "08:17", location: "Remote • Pune", method: "SMS-Entry" },
  { id: "4", name: "Diego Alvarez", initials: "DA", role: "Logistics Lead", time: "08:24", location: "Warehouse 2", method: "GPS-Verified" },
  { id: "5", name: "Sara Kobayashi", initials: "SK", role: "Reception", time: "08:31", location: "Tokyo Office", method: "IP-Verified" },
  { id: "6", name: "Noah Bennett", initials: "NB", role: "Driver", time: "08:35", location: "Off-site", method: "Flagged" },
  { id: "7", name: "Layla Haddad", initials: "LH", role: "Pharmacist", time: "08:40", location: "Clinic East", method: "GPS-Verified" },
];
