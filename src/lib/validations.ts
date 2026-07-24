import { z } from "zod";

const emailOrEmpty = z
  .string()
  .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email");

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
    amount: z
      .number({ invalid_type_error: "Enter a valid amount" })
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

export const sellSchema = z.object({
  brand: z.string().min(1, "Choose a brand"),
  model: z.string().min(1, "Enter the model"),
  variant: z.string(),
  bodyType: z.string().min(1),
  year: z.number().int().min(1990).max(MAX_YEAR),
  registrationYear: z.number().int().min(1990).max(MAX_YEAR),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  kmDriven: z.number().int().min(0, "Enter valid kilometers"),
  ownership: z.string().min(1),
  registrationState: z.string().min(1),
  registrationCity: z.string().min(1, "Enter the registration city"),
  vin: z.string(),
  insuranceStatus: z.string().min(1),
  roadTaxStatus: z.string().min(1),
  serviceHistory: z.string().min(1),
  accidentHistory: z.string().min(1),
  keys: z.number().int().min(1).max(10),
  exteriorCondition: z.string().min(1),
  interiorCondition: z.string().min(1),
  engineCondition: z.string().min(1),
  tireCondition: z.string().min(1),
  batteryCondition: z.string().min(1),
  defects: z.string(),
  modifications: z.string(),
  description: z.string(),
  expectedPrice: z.number().positive("Enter a valid price"),
  sellerName: z.string().min(2, "Enter seller name"),
  sellerEmail: emailOrEmpty,
  sellerPhone: z.string().min(6, "Enter a valid contact number"),
  address: z.string(),
  preferredContactTime: z.string().min(1),
});
export type SellValues = z.infer<typeof sellSchema>;
