// Constants and utilities extracted from mock-data.ts
// These are used by the frontend for dropdowns, filters, and calculations.

export const BRANDS = [
  "Tesla", "BMW", "Mercedes-Benz", "Audi", "Porsche",
  "Toyota", "Honda", "Hyundai", "Kia", "Volkswagen",
  "Volvo", "Lexus", "Ford", "Mazda", "Nissan", "Polestar",
];

export const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Wagon", "Truck"];
export const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
export const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "DCT"];
export const OWNERSHIP = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"];

export const STATES = [
  "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu",
  "Telangana", "Gujarat", "West Bengal", "Haryana",
];

export const CITIES = [
  "Mumbai", "Bengaluru", "New Delhi", "Chennai", "Hyderabad",
  "Ahmedabad", "Kolkata", "Gurugram", "Pune", "Noida",
];

// Fixed identity used for all buyer conversations — buyers chat with the
// company, not individual sellers.
export const ADMIN_ID = "admin";
export const ADMIN_NAME = "DriveHub Team";

// EMI estimate for INR with typical Indian car loan rate (~9.5%)
export function emiEstimate(price: number, years = 5, rate = 0.095) {
  const n = years * 12;
  const r = rate / 12;
  return Math.round((price * r) / (1 - Math.pow(1 + r, -n)));
}

export function calculateFinalPrice(p: {
  basePrice: number;
  refurbishment: number;
  repair: number;
  transportation: number;
  inspection: number;
  documentation: number;
  commission: number;
  margin: number;
}) {
  return (
    p.basePrice + p.refurbishment + p.repair + p.transportation +
    p.inspection + p.documentation + p.commission + p.margin
  );
}
