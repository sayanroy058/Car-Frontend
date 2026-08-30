import { z } from "zod";
import { ALL_HIGHLIGHTS } from "./highlights";

const emailOrEmpty = z
  .string()
  .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email");

/**
 * Numeric field that must be filled in. Number inputs are now text-based so an
 * empty box yields undefined rather than silently coercing to 0 — this reports
 * "required" instead of accepting a zero the seller never typed.
 *
 * Returns a ZodNumber so callers can still chain .int()/.positive()/.min().
 */
function requiredNumber(message: string) {
  return z.number({ required_error: message, invalid_type_error: message });
}

export const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const supportSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Enter a subject"),
  category: z.string().min(1, "Choose a category"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type SupportValues = z.infer<typeof supportSchema>;

export function makeOfferSchema(maxPrice: number) {
  return z.object({
    amount: requiredNumber("Enter a valid amount")
      .positive("Enter a valid amount")
      .max(Math.round(maxPrice * 1.1), "Offer seems too high — check the amount"),
    message: z.string(),
  });
}
export type OfferValues = z.infer<ReturnType<typeof makeOfferSchema>>;

export const checkoutSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(6, "Enter a valid phone number"),
  email: emailOrEmpty,
  city: z.string().min(2, "Enter a delivery city"),
  tenure: z.number().min(1).max(7),
  downPct: z.number().min(0).max(60),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

const MAX_YEAR = new Date().getFullYear() + 1;

/**
 * Indian registration number. Accepts the standard state format
 * (MH12AB1234, with or without spaces/hyphens) and the Bharat series
 * (22BH1234A). Optional — a seller may not have it to hand.
 */
export const registrationNumberSchema = z
  .string()
  .transform((v) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
  .refine(
    (v) =>
      v === "" ||
      /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/.test(v) ||
      /^\d{2}BH\d{4}[A-Z]{1,2}$/.test(v),
    "Enter a valid number, e.g. MH12AB1234 or 22BH1234A",
  );

export const sellSchema = z.object({
  brand: z.string().min(1, "Choose a brand"),
  model: z.string().min(1, "Choose the model"),
  variant: z.string().min(1, "Choose the variant"),
  bodyType: z.string().min(1),
  year: requiredNumber("Enter the manufacturing year").int().min(1990).max(MAX_YEAR),
  registrationYear: requiredNumber("Enter the registration year").int().min(1990).max(MAX_YEAR),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  kmDriven: requiredNumber("Enter valid kilometers").int().min(0, "Enter valid kilometers"),
  ownership: z.string().min(1),
  registrationState: z.string().min(1, "Choose the registration state"),
  registrationCity: z.string().min(1, "Choose the registration city"),
  vin: z.string(),
  registrationNumber: registrationNumberSchema,
  insuranceStatus: z.string().min(1),
  roadTaxStatus: z.string().min(1),
  serviceHistory: z.string().min(1),
  accidentHistory: z.string().min(1),
  keys: z.coerce
    .number({ required_error: "Choose how many keys", invalid_type_error: "Choose how many keys" })
    .int()
    .min(1, "Choose how many keys")
    .max(10),
  exteriorCondition: z.string().min(1),
  interiorCondition: z.string().min(1),
  engineCondition: z.string().min(1),
  tireCondition: z.string().min(1),
  batteryCondition: z.string().min(1),
  defects: z.string(),
  modifications: z.string(),
  description: z.string(),
  /** Feature highlights the seller confirms the car actually has. */
  highlights: z.array(z.enum(ALL_HIGHLIGHTS as [string, ...string[]])),
  expectedPrice: requiredNumber("Enter a valid price").positive("Enter a valid price"),
  sellerName: z.string().min(2, "Enter seller name"),
  sellerEmail: emailOrEmpty,
  sellerPhone: z.string().min(6, "Enter a valid contact number"),
  address: z.string(),
  preferredContactTime: z.string().min(1),
});
export type SellValues = z.infer<typeof sellSchema>;
