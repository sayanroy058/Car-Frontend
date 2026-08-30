import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Briefcase, Camera, Check, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { BRANDS, BODY_TYPES, FUEL_TYPES, OWNERSHIP, STATES, TRANSMISSIONS } from "@/lib/constants";
import { POPULAR_BRANDS, modelNamesFor, resolveSpecs, variantNamesFor } from "@/lib/catalogue";
import { HIGHLIGHT_OPTIONS } from "@/lib/highlights";
import { citiesFor, stateFromRegistrationNumber } from "@/lib/regions";
import { sellSchema, type SellValues } from "@/lib/validations";
import { uploadImages, createListing, assetUrl } from "@/lib/api";

export const Route = createFileRoute("/agent/sell")({
  component: AgentSell,
});

const STEPS = [
  "Seller details",
  "Vehicle basics",
  "Specifications",
  "Condition & defects",
  "Features",
  "Pricing & submit",
] as const;

const STEP_FIELDS: string[][] = [
  ["sellerName", "sellerEmail", "sellerPhone", "preferredContactTime", "address"],
  [
    "brand",
    "model",
    "variant",
    "bodyType",
    "year",
    "registrationYear",
    "registrationNumber",
    "registrationState",
    "registrationCity",
  ],
  [
    "fuelType",
    "transmission",
    "kmDriven",
    "ownership",
    "vin",
    "keys",
    "insuranceStatus",
    "roadTaxStatus",
  ],
  [
    "exteriorCondition",
    "interiorCondition",
    "engineCondition",
    "tireCondition",
    "batteryCondition",
    "serviceHistory",
    "accidentHistory",
    "defects",
    "modifications",
  ],
  ["highlights"],
  ["expectedPrice", "description"],
];

/** Keys are a short pick list rather than a free number field. */
const KEY_OPTIONS = ["1", "2", "3", "4"];

const CAR_IMAGES: string[] = [
  assetUrl("/uploads/fallback-0.jpg"),
  assetUrl("/uploads/fallback-1.jpg"),
  assetUrl("/uploads/fallback-2.jpg"),
];

function AgentSell() {
  const { user, addListing } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [agentNotes, setAgentNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const form = useForm<SellValues>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      sellerName: "",
      sellerEmail: "",
      sellerPhone: "",
      address: "",
      preferredContactTime: "Afternoon (12-5)",
      brand: "",
      model: "",
      variant: "",
      bodyType: "",
      // Left empty so the agent enters the seller's actual figures.
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
    },
  });

  // ── Dependent catalogue selects (same behaviour as the seller-facing form) ──
  const brand = form.watch("brand");
  const model = form.watch("model");
  const variant = form.watch("variant");
  const registrationNumber = form.watch("registrationNumber");
  const registrationState = form.watch("registrationState");

  const models = modelNamesFor(brand);
  const variants = variantNamesFor(brand, model);
  const cities = citiesFor(registrationState);
  const specs = resolveSpecs(brand, model, variant);

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

  useEffect(() => {
    if (!specs) return;
    form.setValue("bodyType", specs.bodyType, { shouldValidate: false });
    form.setValue("fuelType", specs.fuelType, { shouldValidate: false });
    form.setValue("transmission", specs.transmission, { shouldValidate: false });
  }, [brand, model, variant]);

  useEffect(() => {
    const derived = stateFromRegistrationNumber(registrationNumber);
    if (derived && derived !== registrationState) {
      form.setValue("registrationState", derived, { shouldValidate: false });
      form.setValue("registrationCity", "", { shouldValidate: false });
    }
  }, [registrationNumber]);

  useEffect(() => {
    const city = form.getValues("registrationCity");
    if (city && !citiesFor(registrationState).includes(city)) {
      form.setValue("registrationCity", "", { shouldValidate: false });
    }
  }, [registrationState]);

  if (!user || user.role !== "agent") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Seo
          title="Agent onboarding — DriveHub"
          description="Onboard a car for a walk-in seller."
          canonical="/agent/sell"
        />
        <h1 className="font-display text-3xl font-bold">Agent access required</h1>
        <p className="mt-2 text-muted-foreground">
          Only agents can onboard cars from this workflow.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

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
        imageUrls = CAR_IMAGES;
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
        description: `[Agent: ${user!.name}] ${values.description ?? ""}\n\nAgent notes: ${agentNotes}`,
        highlights: values.highlights ?? [],
        expectedPrice: values.expectedPrice,
        address: values.address ?? "",
        preferredContactTime: values.preferredContactTime,
        bodyType: values.bodyType,
        images: imageUrls,
        status: "pending_review" as const,
        // Specs come from the catalogue, not from typed input.
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
      toast.success("Car onboarded — submitted for inspection & pricing");
      nav({ to: "/agent" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const v = form.watch();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Seo
        title="Agent onboarding — DriveHub"
        description="Onboard a car for a walk-in seller."
        canonical="/agent/sell"
      />
      <div className="mb-6 flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Briefcase className="h-3.5 w-3.5" />
          Agent onboarding
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold">Onboard a car for a walk-in seller</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You'll capture every detail on the seller's behalf. The car goes into our inspection &
        approval pipeline.
      </p>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {step + 1} of {STEPS.length}: <b className="text-foreground">{STEPS[step]}</b>
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="mt-2" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
        >
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="sellerName" label="Seller name *" />
              <TextField name="sellerPhone" label="Seller phone *" placeholder="+91 ..." />
              <TextField name="sellerEmail" label="Seller email" type="email" />
              <SelectField
                name="preferredContactTime"
                label="Preferred contact time"
                options={["Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)"]}
              />
              <div className="md:col-span-2">
                <TextareaField name="address" label="Pickup address" rows={2} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                name="brand"
                label="Brand *"
                options={BRANDS}
                pinned={POPULAR_BRANDS}
                placeholder="Select brand"
              />
              <SelectField
                name="model"
                label="Model *"
                options={models}
                placeholder="Select model"
                disabled={!brand}
                emptyHint="Select a brand first"
              />
              <SelectField
                name="variant"
                label="Variant *"
                options={variants}
                placeholder="Select variant"
                disabled={!model}
                emptyHint="Select a model first"
              />
              <SelectField name="bodyType" label="Body type" options={BODY_TYPES} />
              <NumberField
                name="year"
                label="Mfg. year *"
                placeholder="e.g. 2022"
                grouped={false}
              />
              <NumberField
                name="registrationYear"
                label="Registration year *"
                placeholder="e.g. 2022"
                grouped={false}
              />
              <TextField
                name="registrationNumber"
                label="Vehicle registration number"
                placeholder="e.g. MH12AB1234"
              />
              <SelectField
                name="registrationState"
                label="Registration state *"
                options={STATES}
                placeholder="Select state"
              />
              <SelectField
                name="registrationCity"
                label="Registration city *"
                options={cities}
                placeholder="Select city"
                disabled={!registrationState}
                emptyHint="Select a state first"
              />
              {specs && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs md:col-span-2">
                  <Info className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                  Specs auto-filled from the catalogue: {specs.displacementCc || "EV"}
                  {specs.displacementCc ? " cc" : ""}, {specs.maxPowerBhp} bhp,{" "}
                  {specs.maxTorqueNm} Nm, {specs.driveTrain}, {specs.airbags} airbags,{" "}
                  {specs.bootSpaceL ?? "—"} L boot.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField name="fuelType" label="Fuel type" options={FUEL_TYPES} />
              <SelectField name="transmission" label="Transmission" options={TRANSMISSIONS} />
              <NumberField
                name="kmDriven"
                label="KM driven *"
                placeholder="e.g. 35,000"
                suffix="km"
              />
              <SelectField name="ownership" label="Ownership" options={OWNERSHIP} />
              <TextField name="vin" label="VIN / Chassis" />
              <SelectField
                name="keys"
                label="Number of keys *"
                options={KEY_OPTIONS}
                placeholder="Choose"
              />
              <SelectField
                name="insuranceStatus"
                label="Insurance"
                options={["Active", "Expired", "Third-party only"]}
              />
              <SelectField
                name="roadTaxStatus"
                label="Road tax"
                options={["Paid", "Pending", "Lifetime"]}
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="exteriorCondition" label="Exterior" />
              <TextField name="interiorCondition" label="Interior" />
              <TextField name="engineCondition" label="Engine" />
              <TextField name="tireCondition" label="Tires" />
              <TextField name="batteryCondition" label="Battery" />
              <TextField name="serviceHistory" label="Service history" />
              <div className="md:col-span-2">
                <TextField name="accidentHistory" label="Accident history" />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  name="defects"
                  label="Known defects (be transparent)"
                  rows={3}
                  placeholder="Minor dent on rear bumper, AC compressor to be inspected..."
                />
              </div>
              <div className="md:col-span-2">
                <TextField name="modifications" label="Modifications" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-5">
              <HighlightPicker name="highlights" groups={HIGHLIGHT_OPTIONS} />
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <Info className="mr-2 inline h-4 w-4 text-primary" />
                Tick only what you have verified on the car. Anything unconfirmed is
                removed at inspection.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-4">
              <NumberField
                name="expectedPrice"
                label="Seller's expected price *"
                placeholder="e.g. 8,50,000"
                suffix="₹"
              />
              <TextareaField
                name="description"
                label="Description for buyers"
                rows={3}
                placeholder="Well-maintained single-owner car with full service history..."
              />
              <div>
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Internal agent notes (not visible to buyers)
                </span>
                <Textarea
                  rows={3}
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Seller is negotiable up to 5%. Pickup Saturday. Suggest refurb budget ₹40k."
                />
              </div>
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
                  id="agent-sell-images"
                />
                <label htmlFor="agent-sell-images" className="flex cursor-pointer items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-background">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {files.length > 0 ? `${files.length} image(s) selected` : "Vehicle images"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Upload car images. Click to browse.
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
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4 text-sm">
                <div className="mb-2 font-display font-semibold">Review summary</div>
                <ul className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                  <li>
                    Seller: <b className="text-foreground">{v.sellerName || "—"}</b>
                  </li>
                  <li>
                    Phone: <b className="text-foreground">{v.sellerPhone || "—"}</b>
                  </li>
                  <li>
                    Car:{" "}
                    <b className="text-foreground">
                      {v.year} {v.brand} {v.model}
                    </b>
                  </li>
                  <li>
                    KM: <b className="text-foreground">{v.kmDriven.toLocaleString()}</b>
                  </li>
                  <li>
                    Ask:{" "}
                    <b className="text-foreground">₹{v.expectedPrice.toLocaleString("en-IN")}</b>
                  </li>
                  <li>
                    Location: <b className="text-foreground">{v.registrationCity}</b>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading images...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Submit for inspection
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
