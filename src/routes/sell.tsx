import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";
import { BRANDS, BODY_TYPES, FUEL_TYPES, OWNERSHIP, STATES, TRANSMISSIONS } from "@/lib/constants";
import { sellSchema, type SellValues } from "@/lib/validations";
import { uploadImages, createListing } from "@/lib/api";
import type { Listing } from "@/lib/types";

export const Route = createFileRoute("/sell")({
  component: Sell,
});

const STEPS = [
  "Vehicle basics",
  "Specifications",
  "Condition",
  "Media & docs",
  "Seller details",
] as const;

const STEP_FIELDS: string[][] = [
  ["brand", "model", "bodyType", "year", "registrationYear", "expectedPrice"],
  [
    "fuelType",
    "transmission",
    "kmDriven",
    "ownership",
    "registrationState",
    "registrationCity",
    "vin",
    "insuranceStatus",
    "roadTaxStatus",
    "keys",
  ],
  [
    "serviceHistory",
    "accidentHistory",
    "exteriorCondition",
    "interiorCondition",
    "engineCondition",
    "tireCondition",
    "batteryCondition",
    "modifications",
    "defects",
    "description",
  ],
  [],
  ["sellerName", "sellerEmail", "sellerPhone", "preferredContactTime", "address"],
];

function Sell() {
  const { user, addListing } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const form = useForm<SellValues>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      brand: "",
      model: "",
      variant: "",
      bodyType: "Sedan",
      year: 2022,
      registrationYear: 2022,
      fuelType: "Petrol",
      transmission: "Automatic",
      kmDriven: 25000,
      ownership: "1st Owner",
      registrationState: "Maharashtra",
      registrationCity: "Mumbai",
      vin: "",
      insuranceStatus: "Active",
      roadTaxStatus: "Paid",
      serviceHistory: "Complete dealer history",
      accidentHistory: "No accidents",
      keys: 2,
      exteriorCondition: "Excellent",
      interiorCondition: "Excellent",
      engineCondition: "Excellent",
      tireCondition: "Good (70%+)",
      batteryCondition: "Good",
      defects: "",
      modifications: "None",
      description: "",
      expectedPrice: 1500000,
      sellerName: user?.name ?? "",
      sellerEmail: user?.email ?? "",
      sellerPhone: "",
      address: "",
      preferredContactTime: "Afternoon (12-5)",
    },
  });

  if (!user)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Seo
          title="Sell your car — DriveHub"
          description="List your car for a free inspection and valuation. Get the best price with DriveHub."
          canonical="/sell"
        />
        <h1 className="text-3xl font-bold tracking-tight">Sign in to sell your car</h1>
        <p className="mt-2 text-muted-foreground">Create an account to submit your vehicle.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    );

  async function next() {
    const fields = STEP_FIELDS[step];
    if (fields.length) {
      const ok = await form.trigger(fields as (keyof SellValues)[]);
      if (!ok) return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submit(values: SellValues) {
    setUploading(true);
    try {
      let imageUrls: string[];
      if (files.length > 0) {
        imageUrls = await uploadImages(files);
      } else {
        imageUrls = [
          "/uploads/fallback-0.jpg",
          "/uploads/fallback-1.jpg",
          "/uploads/fallback-2.jpg",
        ];
      }

      const listingData = {
        sellerId: user!.id,
        sellerName: values.sellerName,
        sellerEmail: values.sellerEmail,
        sellerPhone: values.sellerPhone,
        brand: values.brand,
        model: values.model,
        variant: values.variant ?? "",
        year: values.year,
        registrationYear: values.registrationYear,
        fuelType: values.fuelType,
        transmission: values.transmission,
        kmDriven: values.kmDriven,
        ownership: values.ownership,
        registrationState: values.registrationState,
        registrationCity: values.registrationCity,
        vin: values.vin ?? "",
        insuranceStatus: values.insuranceStatus,
        roadTaxStatus: values.roadTaxStatus,
        serviceHistory: values.serviceHistory,
        accidentHistory: values.accidentHistory,
        keys: values.keys,
        exteriorCondition: values.exteriorCondition,
        interiorCondition: values.interiorCondition,
        engineCondition: values.engineCondition,
        tireCondition: values.tireCondition,
        batteryCondition: values.batteryCondition,
        defects: values.defects ?? "",
        modifications: values.modifications ?? "None",
        description: values.description ?? "",
        expectedPrice: values.expectedPrice,
        address: values.address ?? "",
        preferredContactTime: values.preferredContactTime,
        bodyType: values.bodyType,
        images: imageUrls,
        status: "pending_review" as const,
      };
      const created = await createListing(listingData);
      addListing(created);
      toast.success("Submission received! Our team will review within 24 hours.");
      nav({ to: "/dashboard" });
    } catch {
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Seo
        title="Sell your car — DriveHub"
        description="List your car for a free inspection and valuation. Get the best price with DriveHub."
        canonical="/sell"
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Sell your car</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
        <Progress value={progress} className="mt-4 h-2" />
        <div className="mt-4 hidden flex-wrap gap-2 md:flex">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${i < step ? "bg-success/10 text-success" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {i < step && <Check className="h-3 w-3" />} {i + 1}. {s}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8"
        >
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                name="brand"
                label="Brand *"
                options={BRANDS}
                placeholder="Choose brand"
              />
              <TextField name="model" label="Model *" placeholder="e.g. Model 3" />
              <TextField name="variant" label="Variant" placeholder="e.g. Long Range AWD" />
              <SelectField name="bodyType" label="Body type" options={BODY_TYPES} />
              <NumberField name="year" label="Manufacturing year" />
              <NumberField name="registrationYear" label="Registration year" />
              <NumberField name="expectedPrice" label="Expected selling price (₹ INR)" />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField name="fuelType" label="Fuel type" options={FUEL_TYPES} />
              <SelectField name="transmission" label="Transmission" options={TRANSMISSIONS} />
              <NumberField name="kmDriven" label="Kilometers driven" />
              <SelectField name="ownership" label="Ownership" options={OWNERSHIP} />
              <SelectField name="registrationState" label="Registration state" options={STATES} />
              <TextField name="registrationCity" label="Registration city" />
              <TextField name="vin" label="VIN / Chassis number" />
              <SelectField
                name="insuranceStatus"
                label="Insurance status"
                options={["Active", "Expired", "Expires soon", "None"]}
              />
              <SelectField
                name="roadTaxStatus"
                label="Road tax status"
                options={["Paid", "Pending", "Expired"]}
              />
              <NumberField name="keys" label="Keys available" />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                name="serviceHistory"
                label="Service history"
                options={[
                  "Complete dealer history",
                  "Partial records",
                  "Owner serviced",
                  "Not available",
                ]}
              />
              <SelectField
                name="accidentHistory"
                label="Accident history"
                options={["No accidents", "Minor — repaired", "Major — repaired"]}
              />
              <SelectField
                name="exteriorCondition"
                label="Exterior condition"
                options={["Excellent", "Very Good", "Good", "Fair"]}
              />
              <SelectField
                name="interiorCondition"
                label="Interior condition"
                options={["Excellent", "Very Good", "Good", "Fair"]}
              />
              <SelectField
                name="engineCondition"
                label="Engine condition"
                options={["Excellent", "Very Good", "Good", "Needs work"]}
              />
              <SelectField
                name="tireCondition"
                label="Tire condition"
                options={["New (90%+)", "Good (70%+)", "Fair (50%+)", "Worn"]}
              />
              <SelectField
                name="batteryCondition"
                label="Battery condition"
                options={["Excellent", "Good", "Fair", "Needs replacement"]}
              />
              <TextField name="modifications" label="Modifications" />
              <div className="md:col-span-2">
                <TextareaField name="defects" label="Known defects or damages" rows={3} />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  name="description"
                  label="Description"
                  rows={4}
                  placeholder="Tell buyers about your car..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5">
              <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-5">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files ?? []);
                    if (selected.length === 0) return;
                    setFiles((prev) => [...prev, ...selected]);
                    const newPreviews = selected.map((f) => URL.createObjectURL(f));
                    setPreviews((prev) => [...prev, ...newPreviews]);
                  }}
                  className="hidden"
                  id="sell-images"
                />
                <label htmlFor="sell-images" className="flex cursor-pointer items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-background">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {files.length > 0 ? `${files.length} image(s) selected` : "Vehicle images"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Upload exterior, interior, dashboard, engine, tires, damages. Click to browse.
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-success">
                    {files.length > 0 ? `${files.length} files` : "Click to add"}
                  </div>
                </label>
              </div>
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        className="h-24 w-32 rounded-lg object-cover"
                        alt={`Preview ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(url);
                          setFiles((prev) => prev.filter((_, j) => j !== i));
                          setPreviews((prev) => prev.filter((_, j) => j !== i));
                        }}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <Upload className="mr-2 inline h-4 w-4 text-primary" />
                Images are stored locally. You can upload up to 20 images (max 10 MB each).
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="sellerName" label="Seller name *" />
              <TextField
                name="sellerPhone"
                label="Contact number *"
                placeholder="+91 98765 43210"
              />
              <TextField name="sellerEmail" label="Email" type="email" />
              <SelectField
                name="preferredContactTime"
                label="Preferred contact time"
                options={["Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)"]}
              />
              <div className="md:col-span-2">
                <TextareaField name="address" label="Complete address" rows={3} />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading images...
                  </>
                ) : (
                  "Submit for review"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

function TextField({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: keyof SellValues;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberField({ name, label }: { name: keyof SellValues; label: string }) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(+e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextareaField({
  name,
  label,
  rows = 3,
  placeholder,
}: {
  name: keyof SellValues;
  label: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <FormControl>
            <Textarea rows={rows} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  name,
  label,
  options,
  placeholder,
}: {
  name: keyof SellValues;
  label: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
