import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Shared react-hook-form field wrappers used by the sell, agent-sell and admin
 * forms, so a fix to input behaviour applies everywhere at once.
 */

export function TextField({
  name,
  label,
  placeholder,
  type = "text",
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Numeric input rendered as `type="text"`.
 *
 * Three problems with `type="number"` this avoids:
 *  - clearing the box produced `+"" === 0`, so the field snapped back to a
 *    stuck leading zero that the user then had to type around;
 *  - the browser spinner arrows are unwanted for prices and odometer readings;
 *  - a scroll wheel over a focused number input silently changes the value.
 *
 * Digits are grouped in the Indian numbering system (15,00,000) while the form
 * state stays a plain number, or undefined when empty so validation can report
 * "required" rather than accepting a zero.
 */
export function NumberField({
  name,
  label,
  placeholder,
  suffix,
  grouped = true,
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  /** Unit shown inside the right edge of the field, e.g. "km" or "cc". */
  suffix?: string;
  /** Set false for years, which should not be grouped as 2,024. */
  grouped?: boolean;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        const display =
          field.value === undefined || field.value === null || field.value === ""
            ? ""
            : grouped
              ? Number(field.value).toLocaleString("en-IN")
              : String(field.value);

        return (
          <FormItem className={className}>
            <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={placeholder}
                  value={display}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^\d]/g, "");
                    field.onChange(digits === "" ? undefined : Number(digits));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className={suffix ? "pr-12" : undefined}
                />
                {suffix && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {suffix}
                  </span>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
export function TextareaField({
  name,
  label,
  rows = 3,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  disabled,
  /** Options rendered above a separator, e.g. the most popular brands. */
  pinned,
  emptyHint,
  className,
}: {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  pinned?: readonly string[];
  emptyHint?: string;
  className?: string;
}) {
  const pinnedPresent = (pinned ?? []).filter((p) => options.includes(p));
  const rest = options.filter((o) => !pinnedPresent.includes(o));

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="mb-1.5 inline-block">{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || undefined}
            disabled={disabled || options.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    options.length === 0 ? (emptyHint ?? placeholder) : placeholder
                  }
                />
              </SelectTrigger>
            </FormControl>
            {/* Scrollable list — long option sets stay usable by scrolling. */}
            <SelectContent className="max-h-72">
              {pinnedPresent.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
              {pinnedPresent.length > 0 && rest.length > 0 && <SelectSeparator />}
              {rest.map((o) => (
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

/**
 * Grouped checkbox picker for the feature highlights shown on the listing.
 * Replaces the fixed tag list the detail page used to render for every car.
 */
export function HighlightPicker({
  name,
  groups,
}: {
  name: string;
  groups: Record<string, string[]>;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(
    Object.keys(groups)[0] ?? null,
  );

  return (
    <FormField
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];
        const toggle = (option: string) =>
          field.onChange(
            selected.includes(option)
              ? selected.filter((x) => x !== option)
              : [...selected, option],
          );

        return (
          <FormItem>
            <FormLabel className="mb-1.5 inline-block">
              Feature highlights{" "}
              <span className="font-normal text-muted-foreground">
                — tick only what this car actually has ({selected.length} selected)
              </span>
            </FormLabel>
            <div className="space-y-2">
              {Object.entries(groups).map(([group, options]) => {
                const open = openGroup === group;
                const count = options.filter((o) => selected.includes(o)).length;
                return (
                  <div
                    key={group}
                    className="rounded-xl border border-border/60 bg-secondary/20"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenGroup(open ? null : group)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
                    >
                      <span>{group}</span>
                      <span className="text-xs text-muted-foreground">
                        {count > 0 ? `${count} selected` : "none"}
                      </span>
                    </button>
                    {open && (
                      <div className="grid gap-2 border-t border-border/60 px-3 py-3 sm:grid-cols-2">
                        {options.map((o) => (
                          <label
                            key={o}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <Checkbox
                              checked={selected.includes(o)}
                              onCheckedChange={() => toggle(o)}
                            />
                            <span>{o}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

