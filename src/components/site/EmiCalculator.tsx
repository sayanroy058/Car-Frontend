import { useMemo, useState } from "react";
import { Banknote, CalendarClock, Percent, Wallet } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatPriceShort } from "@/components/site/CarCard";

export function emiFor(
  price: number,
  downPayment: number,
  tenureYears: number,
  annualRate: number,
) {
  const principal = Math.max(0, price - downPayment);
  const n = tenureYears * 12;
  const r = annualRate / 12;
  if (principal <= 0 || n <= 0) return 0;
  const emi = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(emi);
}

export function EmiCalculator({ price, compact = false }: { price: number; compact?: boolean }) {
  const [downPct, setDownPct] = useState(20);
  const [tenure, setTenure] = useState(5);
  const [rate, setRate] = useState(9.5);

  const downPayment = useMemo(() => Math.round((price * downPct) / 100), [price, downPct]);
  const monthly = useMemo(
    () => emiFor(price, downPayment, tenure, rate),
    [price, downPayment, tenure, rate],
  );
  const totalPayable = monthly * tenure * 12 + downPayment;
  const principal = price - downPayment;
  const totalInterest = monthly * tenure * 12 - principal;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Monthly EMI</div>
          <div className="text-3xl font-bold tracking-tight gradient-text">
            {formatPrice(monthly)}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          On-road price <b className="text-foreground">{formatPriceShort(price)}</b>
        </div>
      </div>

      <Separator />

      <Control
        icon={Wallet}
        label="Down payment"
        value={`${downPct}% · ${formatPriceShort(downPayment)}`}
      >
        <Slider
          min={0}
          max={60}
          step={5}
          value={[downPct]}
          onValueChange={(v) => setDownPct(v[0])}
        />
      </Control>

      <Control icon={CalendarClock} label="Loan tenure" value={`${tenure} years`}>
        <Slider min={1} max={7} step={1} value={[tenure]} onValueChange={(v) => setTenure(v[0])} />
      </Control>

      <Control icon={Percent} label="Interest rate" value={`${rate.toFixed(1)}% p.a.`}>
        <Slider min={7} max={15} step={0.1} value={[rate]} onValueChange={(v) => setRate(v[0])} />
      </Control>

      <Separator />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Row label="Loan amount" value={formatPrice(principal)} />
        <Row label="Total interest" value={formatPrice(Math.round(totalInterest))} />
        <Row label="Down payment" value={formatPrice(downPayment)} />
        <Row label="Total payable" value={formatPrice(Math.round(totalPayable))} bold />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Banknote className="h-4 w-4 text-primary" />
        Indicative only. Final rate depends on credit profile &amp; lender. DriveHub partners with
        12+ lenders.
      </div>
    </div>
  );
}

function Control({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
