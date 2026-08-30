import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Seo } from "@/components/site/Seo";
import {
  HighlightPicker,
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/site/FormFields";
import { useApp } from "@/lib/store";
import {
  BODY_TYPES,
  BRANDS,
  FUEL_TYPES,
  OWNERSHIP,
  STATES,
  TRANSMISSIONS,
} from "@/lib/constants";
import { POPULAR_BRANDS, modelNamesFor, resolveSpecs, variantNamesFor } from "@/lib/catalogue";
import { HIGHLIGHT_OPTIONS } from "@/lib/highlights";
import { citiesFor, stateFromRegistrationNumber } from "@/lib/regions";
import { sellSchema, type SellValues } from "@/lib/validations";
import { uploadImages, createListing, assetUrl } from "@/lib/api";

export const Route = createFileRoute("/sell")({
  component: Sell,
});

const STEPS = [
  "Vehicle basics",
  "Specifications",
  "Condition",
  "Features",
  "Media & docs",
  "Seller details",
] as const;

const STEP_FIELDS: string[][] = [
  ["brand", "model", "variant", "bodyType", "year", "registrationYear", "expectedPrice"],
  [
    "fuelType",
    "transmission",
    "kmDriven",
    "ownership",
    "registrationNumber",
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
  ["highlights"],
  [],
  ["sellerName", "sellerEmail", "sellerPhone", "preferredContactTime", "address"],
];

/** Keys are a short pick list rather than a free number field. */
const KEY_OPTIONS = ["1", "2", "3", "4"];

/**
 * Read-only summary of the specifications resolved from the selected variant.
 * Shown so the seller can confirm the figures buyers will see, without being
 * able to type them by hand.
 */
function SpecPreview({ specs }: { specs: NonNullable<ReturnType<typeof resolveSpecs>> }) {
  const rows: [string, string | number][] = [
    ["Engine", specs.displacementCc ? `${specs.displacementCc} cc` : "Electric motor"],
    [
      "Max power",
      specs.maxPowerRpm
        ? `${specs.maxPowerBhp} bhp @ ${specs.maxPowerRpm.toLocaleString("en-IN")} rpm`
        : `${specs.maxPowerBhp} bhp`,
    ],
    [
      "Max torque",
      specs.maxTorqueRpm
        ? `${specs.maxTorqueNm} Nm @ ${specs.maxTorqueRpm.toLocaleString("en-IN")} rpm`
        : `${specs.maxTorqueNm} Nm`,
    ],
    ["Drivetrain", specs.driveTrain],
    ["Mileage", specs.mileageKmpl ? `${specs.mileageKmpl} kmpl` : "—"],
    ["Airbags", specs.airbags],
    ["Seating", `${specs.seating} adults`],
    ["Boot space", specs.bootSpaceL ? `${specs.bootSpaceL} L` : "—"],
    ["Fuel tank", specs.fuelTankL ? `${specs.fuelTankL} L` : "—"],
    ["Ground clearance", `${specs.groundClearanceMm} mm`],
    [
      "L × W × H",
      `${specs.lengthMm.toLocaleString("en-IN")} × ${specs.widthMm.toLocaleString("en-IN")} × ${specs.heightMm.toLocaleString("en-IN")} mm`,
    ],
    ["Wheelbase", `${specs.wheelbaseMm.toLocaleString("en-IN")} mm`],
  ];

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 md:col-span-2">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Info className="h-4 w-4 text-primary" />
        Specifications for this variant
      </div>
      <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Filled in from the manufacturer's figures so buyers see accurate numbers. Our
        team confirms them during inspection.
      </p>
    </div>
  );
}

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
      bodyType: "",
      // Numeric fields start empty so the seller types a real value instead of
      // editing around a pre-filled placeholder.
      year: undefined,
      registrationYear: undefined,
      fuelType: "",
      transmission: "",
      kmDriven: undefined,
      ownership: "1st Owner",
      registrationNumber: "",
      registrationState: "",
      registrationCity: "",
      vin: "",
      insuranceStatus: "Active",
      roadTaxStatus: "Paid",
      serviceHistory: "Complete dealer history",
      accidentHistory: "No accidents",
      keys: undefined,
      exteriorCondition: "Excellent",
      interiorCondition: "Excellent",
      engineCondition: "Excellent",
      tireCondition: "Good (70%+)",
      batteryCondition: "Good",
      defects: "",
      modifications: "None",
      description: "",
      highlights: [],
      expectedPrice: undefined,
      sellerName: user?.name ?? "",
      sellerEmail: user?.email ?? "",
      sellerPhone: user?.phone ?? "",
      address: "",
      preferredContactTime: "Afternoon (12-5)",
    },
  });

  // ── Dependent catalogue selects ──
  const brand = form.watch("brand");
  const model = form.watch("model");
  const variant = form.watch("variant");
  const registrationNumber = form.watch("registrationNumber");
  const registrationState = form.watch("registrationState");

  const models = modelNamesFor(brand);
  const variants = variantNamesFor(brand, model);
  const cities = citiesFor(registrationState);
  const specs = resolveSpecs(brand, model, variant);

  // Clear the downstream selection whenever its parent changes, so a stale
  // model/variant can never be submitted against a different brand.
  useEffect(() => {
    if (model && !modelNamesFor(brand).includes(model)) {
      form.setValue("model", "", { shouldValidate: false });
      form.setValue("variant", "", { shouldValidate: false });
    }
  }, [brand]);

  useEffect(() => {
    if (variant && !variantNamesFor(brand, model).includes(variant)) {
      form.setValue("variant", "", { shouldValidate: false });
    }
  }, [brand, model]);

  // Auto-fill body type, fuel, gearbox and every spec from the chosen variant.
  useEffect(() => {
    if (!specs) return;
    form.setValue("bodyType", specs.bodyType, { shouldValidate: false });
    form.setValue("fuelType", specs.fuelType, { shouldValidate: false });
    form.setValue("transmission", specs.transmission, { shouldValidate: false });
  }, [brand, model, variant]);

  // Derive the registering state from the plate, so the seller enters it once.
  useEffect(() => {
    const derived = stateFromRegistrationNumber(registrationNumber);
    if (derived && derived !== registrationState) {
      form.setValue("registrationState", derived, { shouldValidate: false });
      form.setValue("registrationCity", "", { shouldValidate: false });
    }
  }, [registrationNumber]);

  // Drop a city that does not belong to the selected state.
  useEffect(() => {
    const city = form.getValues("registrationCity");
    if (city && !citiesFor(registrationState).includes(city)) {
      form.setValue("registrationCity", "", { shouldValidate: false });
    }
  }, [registrationState]);

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
          assetUrl("/uploads/fallback-0.jpg"),
          assetUrl("/uploads/fallback-1.jpg"),
          assetUrl("/uploads/fallback-2.jpg"),
        ];
      }

      const resolved = resolveSpecs(values.brand, values.model, values.variant);

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
        registrationNumber: values.registrationNumber || undefined,
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
        highlights: values.highlights ?? [],
        expectedPrice: values.expectedPrice,
        address: values.address ?? "",
        preferredContactTime: values.preferredContactTime,
        bodyType: values.bodyType,
        images: imageUrls,
        status: "pending_review" as const,
        // Real specs for the chosen variant, replacing the figures the detail
        // page used to hardcode. Omitted when the car is not in the catalogue.
        ...(resolved
          ? {
              displacementCc: resolved.displacementCc,
              maxPowerBhp: resolved.maxPowerBhp,
              maxPowerRpm: resolved.maxPowerRpm,
              maxTorqueNm: resolved.maxTorqueNm,
              maxTorqueRpm: resolved.maxTorqueRpm,
              driveTrain: resolved.driveTrain,
              mileageKmpl: resolved.mileageKmpl,
              seating: resolved.seating,
              bootSpaceL: resolved.bootSpaceL,
              fuelTankL: resolved.fuelTankL,
              groundClearanceMm: resolved.groundClearanceMm,
              lengthMm: resolved.lengthMm,
              widthMm: resolved.widthMm,
              heightMm: resolved.heightMm,
              wheelbaseMm: resolved.wheelbaseMm,
              airbags: resolved.airbags,
            }
          : {}),
      };
      const created = await createListing(listingData);
      addListing(created);
      toast.success("Submission received! Our team will review within 24 hours.");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
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
                pinned={POPULAR_BRANDS}
                placeholder="Choose brand"
              />
              <SelectField
                name="model"
                label="Model *"
                options={models}
                placeholder="Choose model"
                disabled={!brand}
                emptyHint="Select a brand first"
              />
              <SelectField
                name="variant"
                label="Variant *"
                options={variants}
                placeholder="Choose variant"
                disabled={!model}
                emptyHint="Select a model first"
              />
              <SelectField name="bodyType" label="Body type" options={BODY_TYPES} />
              <NumberField
                name="year"
                label="Manufacturing year *"
                placeholder="e.g. 2022"
                grouped={false}
              />
              <NumberField
                name="registrationYear"
                label="Registration year *"
                placeholder="e.g. 2022"
                grouped={false}
              />
              <NumberField
                name="expectedPrice"
                label="Expected selling price *"
                placeholder="e.g. 8,50,000"
                suffix="₹"
              />
              {specs && <SpecPreview specs={specs} />}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField name="fuelType" label="Fuel type" options={FUEL_TYPES} />
              <SelectField name="transmission" label="Transmission" options={TRANSMISSIONS} />
              <NumberField
                name="kmDriven"
                label="Kilometers driven *"
                placeholder="e.g. 35,000"
                suffix="km"
              />
              <SelectField name="ownership" label="Ownership" options={OWNERSHIP} />
              <TextField
                name="registrationNumber"
                label="Vehicle registration number"
                placeholder="e.g. MH12AB1234"
              />
              <SelectField
                name="registrationState"
                label="Registration state *"
                options={STATES}
                placeholder="Choose state"
              />
              <SelectField
                name="registrationCity"
                label="Registration city *"
                options={cities}
                placeholder="Choose city"
                disabled={!registrationState}
                emptyHint="Select a state first"
              />
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
              {/* A short pick list, not a free number field — nobody has 47 keys. */}
              <SelectField
                name="keys"
                label="Keys available *"
                options={KEY_OPTIONS}
                placeholder="Choose"
              />
              {specs?.driveTrain && (
                <div className="flex flex-col justify-end">
                  <span className="mb-1.5 text-sm font-medium">Drivetrain</span>
                  <div className="flex h-9 items-center rounded-md border border-input bg-secondary/40 px-3 text-sm text-muted-foreground">
                    {specs.driveTrain} — from the selected variant
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground md:col-span-2">
                Your registration number is never shown publicly — buyers see a masked
                version such as MH12 •• 1234 until a booking is confirmed.
              </p>
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
              <HighlightPicker name="highlights" groups={HIGHLIGHT_OPTIONS} />
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <Info className="mr-2 inline h-4 w-4 text-primary" />
                Only tick features this car genuinely has. Our inspection team verifies
                them, and unverifiable claims are removed before the listing goes live.
              </div>
            </div>
          )}

          {step === 4 && (
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

          {step === 5 && (
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

