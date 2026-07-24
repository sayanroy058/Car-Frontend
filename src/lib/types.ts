export type ListingStatus =
  "pending_review" | "under_inspection" | "approved" | "rejected" | "listed" | "sold";

export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved";

export interface PricingBreakdown {
  basePrice: number;
  refurbishment: number;
  repair: number;
  transportation: number;
  inspection: number;
  documentation: number;
  commission: number;
  margin: number;
  finalPrice: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  registrationYear: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  ownership: string;
  registrationState: string;
  registrationCity: string;
  vin: string;
  insuranceStatus: string;
  roadTaxStatus: string;
  serviceHistory: string;
  accidentHistory: string;
  keys: number;
  exteriorCondition: string;
  interiorCondition: string;
  engineCondition: string;
  tireCondition: string;
  batteryCondition: string;
  defects: string;
  modifications: string;
  description: string;
  expectedPrice: number;
  address: string;
  preferredContactTime: string;
  bodyType: string;
  images: string[];
  status: ListingStatus;
  pricing?: PricingBreakdown;
  createdAt: number;
  views?: number;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "agent";
}

export interface Ticket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: TicketStatus;
  createdAt: number;
}

export type OfferState = "pending" | "accepted" | "declined" | "countered";

export interface Offer {
  id: string;
  listingId: string;
  buyerId?: string;
  buyerName: string;
  amount: number;
  message: string;
  state?: OfferState;
  counterAmount?: number;
  createdAt: number;
}

export type BookingType = "reserve" | "purchase" | "test_drive";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  type: BookingType;
  amount: number;
  reserveFee?: number;
  tenure?: number;
  downPayment?: number;
  status: BookingStatus;
  createdAt: number;
  scheduledDate?: string;
  city?: string;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  mine: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
  messages: Message[];
  createdAt: number;
  lastReadAt?: Record<string, number>;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: number;
}
