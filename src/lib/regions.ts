// ---------------------------------------------------------------------------
// Indian states and union territories, with their major RTO cities and the
// registration-plate prefixes used to derive a state from a vehicle number.
//
// Replaces the previous fixed list of 8 states / 10 cities.
// ---------------------------------------------------------------------------

export interface StateInfo {
  name: string;
  /** Registration-number prefixes, e.g. "MH" for Maharashtra. */
  codes: string[];
  cities: string[];
}

export const STATES_INFO: StateInfo[] = [
  { name: "Andhra Pradesh", codes: ["AP"], cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool"] },
  { name: "Arunachal Pradesh", codes: ["AR"], cities: ["Itanagar", "Naharlagun", "Pasighat"] },
  { name: "Assam", codes: ["AS"], cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"] },
  { name: "Bihar", codes: ["BR"], cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"] },
  { name: "Chhattisgarh", codes: ["CG"], cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"] },
  { name: "Goa", codes: ["GA"], cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"] },
  { name: "Gujarat", codes: ["GJ"], cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar"] },
  { name: "Haryana", codes: ["HR"], cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak"] },
  { name: "Himachal Pradesh", codes: ["HP"], cities: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"] },
  { name: "Jharkhand", codes: ["JH"], cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"] },
  { name: "Karnataka", codes: ["KA"], cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Davanagere"] },
  { name: "Kerala", codes: ["KL"], cities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Kannur"] },
  { name: "Madhya Pradesh", codes: ["MP"], cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar"] },
  { name: "Maharashtra", codes: ["MH"], cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Navi Mumbai", "Kolhapur"] },
  { name: "Manipur", codes: ["MN"], cities: ["Imphal", "Thoubal"] },
  { name: "Meghalaya", codes: ["ML"], cities: ["Shillong", "Tura"] },
  { name: "Mizoram", codes: ["MZ"], cities: ["Aizawl", "Lunglei"] },
  { name: "Nagaland", codes: ["NL"], cities: ["Kohima", "Dimapur"] },
  { name: "Odisha", codes: ["OD", "OR"], cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"] },
  { name: "Punjab", codes: ["PB"], cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali", "Bathinda"] },
  { name: "Rajasthan", codes: ["RJ"], cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"] },
  { name: "Sikkim", codes: ["SK"], cities: ["Gangtok", "Namchi"] },
  { name: "Tamil Nadu", codes: ["TN"], cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode"] },
  { name: "Telangana", codes: ["TS", "TG"], cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Secunderabad"] },
  { name: "Tripura", codes: ["TR"], cities: ["Agartala", "Udaipur"] },
  { name: "Uttar Pradesh", codes: ["UP"], cities: ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj", "Meerut"] },
  { name: "Uttarakhand", codes: ["UK", "UA"], cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"] },
  { name: "West Bengal", codes: ["WB"], cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"] },
  // ── Union territories ──
  { name: "Andaman & Nicobar Islands", codes: ["AN"], cities: ["Port Blair"] },
  { name: "Chandigarh", codes: ["CH"], cities: ["Chandigarh"] },
  { name: "Dadra & Nagar Haveli and Daman & Diu", codes: ["DD", "DN"], cities: ["Silvassa", "Daman", "Diu"] },
  { name: "Delhi", codes: ["DL"], cities: ["New Delhi", "Dwarka", "Rohini", "Saket", "Pitampura"] },
  { name: "Jammu & Kashmir", codes: ["JK"], cities: ["Srinagar", "Jammu", "Anantnag"] },
  { name: "Ladakh", codes: ["LA"], cities: ["Leh", "Kargil"] },
  { name: "Lakshadweep", codes: ["LD"], cities: ["Kavaratti"] },
  { name: "Puducherry", codes: ["PY"], cities: ["Puducherry", "Karaikal"] },
];

export const STATES: string[] = STATES_INFO.map((s) => s.name);

/** Cities for a given state; empty when the state is unknown. */
export function citiesFor(state?: string): string[] {
  if (!state) return [];
  return STATES_INFO.find((s) => s.name === state)?.cities ?? [];
}

/** Every city, for filters and free-form fallbacks. */
export const ALL_CITIES: string[] = [
  ...new Set(STATES_INFO.flatMap((s) => s.cities)),
].sort((a, b) => a.localeCompare(b));

const CODE_TO_STATE = new Map<string, string>(
  STATES_INFO.flatMap((s) => s.codes.map((c) => [c, s.name] as const)),
);

/**
 * Derives the registering state from an Indian registration number.
 * Handles the standard format (MH12AB1234) and the Bharat series (22BH1234A),
 * which is not tied to a state and therefore returns undefined.
 */
export function stateFromRegistrationNumber(reg?: string): string | undefined {
  if (!reg) return undefined;
  const cleaned = reg.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (/^\d{2}BH/.test(cleaned)) return undefined;
  return CODE_TO_STATE.get(cleaned.slice(0, 2));
}

/**
 * Masks a registration number for public display: keeps the RTO prefix and the
 * final four digits, hides the series letters. MH12AB1234 → "MH12 ** 1234".
 */
export function maskRegistrationNumber(reg?: string): string {
  if (!reg) return "";
  const cleaned = reg.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleaned.length < 6) return "••••";
  return `${cleaned.slice(0, 4)} •• ${cleaned.slice(-4)}`;
}
