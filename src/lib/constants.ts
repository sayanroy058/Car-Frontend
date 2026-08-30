// Constants and utilities shared across the frontend.
// Dropdown/filter option lists now come from the vehicle catalogue and the
// state/city registry so that a single source feeds forms, filters and specs.

import { BRANDS_ORDERED, CATALOGUE_BODY_TYPES } from "./catalogue";
import { ALL_CITIES, STATES } from "./regions";

/** Popular Indian brands first, then the rest alphabetically. */
export const BRANDS = BRANDS_ORDERED;

/**
 * Body types, ordered with the mainstream Indian segments first. Derived from
 * the catalogue so a new segment appears automatically once a car uses it.
 */
const BODY_TYPE_ORDER = [
  "Hatchback",
  "Sedan",
  "Compact SUV",
  "SUV",
  "MUV/MPV",
  "Coupe",
  "Convertible",
  "Wagon",
  "Truck",
];

export const BODY_TYPES = [
  ...BODY_TYPE_ORDER.filter((b) => CATALOGUE_BODY_TYPES.includes(b)),
  ...CATALOGUE_BODY_TYPES.filter((b) => !BODY_TYPE_ORDER.includes(b)),
  // Retained for older listings created before the catalogue existed.
  ...BODY_TYPE_ORDER.filter((b) => !CATALOGUE_BODY_TYPES.includes(b)),
];

export const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
export const TRANSMISSIONS = ["Manual", "Automatic", "AMT", "CVT", "DCT"];
export const OWNERSHIP = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"];
export const DRIVE_TRAINS = ["FWD", "RWD", "AWD", "4WD"];

export { STATES };
export const CITIES = ALL_CITIES;

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
