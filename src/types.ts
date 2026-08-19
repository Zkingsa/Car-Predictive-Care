export type VehicleSubsystem = "braking" | "powertrain" | "tpms" | "telematics";

export interface Alert {
  id: string;
  level: "danger" | "warn" | "good";
  title: string;
  msg: string;
  subsystem: VehicleSubsystem;
  timeHorizon?: string;
  relatedPartId?: string;
  dtcCode?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  modelCode: string;
  year: number;
  vin: string;
  type: "ev" | "ice" | "hybrid";
  mileage: number;
  health: number;
  battery: number | null; // null for ICE
  batteryTemp?: number;
  brakeWear: number; // percentage
  brakeRotorHealth?: number;
  tirePressure: number; // average PSI
  tirePressures: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  engineTemp: number; // °C
  oilLevel?: number; // %
  nextService: string;
  serviceCode: string;
  lastConnected: string;
  alerts: Alert[];
  image: string;
}

export interface Product {
  id: string;
  name: string;
  partNumber?: string;
  cat: "OEM Parts" | "EV & Hybrid" | "Performance" | "Accessories";
  price: number;
  rating: number;
  reviewsCount: number;
  color: string;
  description: string;
  inStock: boolean;
  stockCount: number;
  compatibleModels: string[];
  features: string[];
  imageType: "brake" | "mats" | "wiper" | "cable" | "cap" | "filter" | "keychain" | "liner" | "flask" | "oil";
}

export interface CartItem extends Product {
  qty: number;
  installAtDealer?: boolean;
}

export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus = "Queued" | "Diagnostic Assigned" | "In Progress" | "Master Tech Review" | "Parts Allocated" | "Resolved";

export interface TicketTimelineEvent {
  title: string;
  timestamp: string;
  note: string;
  author: string;
}

export interface Ticket {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vin: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  eta: string;
  createdAt: string;
  telemetrySnapshot?: {
    mileage: number;
    brakeWear?: number;
    tirePressure?: number;
    batteryOrTemp?: string;
    dtcCode?: string;
  };
  assignedTech?: string;
  timeline: TicketTimelineEvent[];
}

export interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  phone: string;
  emergencyPhone: string;
  isOpen: boolean;
  hours: string;
  rating: number;
  reviewsCount: number;
  certifiedFor: ("EV" | "Performance" | "All" | "Luxury")[];
  availableBays: number;
  specialties: string[];
  servicesOffered: string[];
  nextAvailableSlot: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  isCustom?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  role: "Fleet Owner" | "Vehicle Master" | "Technician";
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
  suggestedPriority?: TicketPriority;
  suggestedParts?: string[];
  suggestedWorkshop?: Workshop;
  canEscalate?: boolean;
  vehicleContext?: string;
  audioPlayed?: boolean;
}
