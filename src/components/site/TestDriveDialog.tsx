import { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useApp } from "@/lib/store";
import { CITIES } from "@/lib/constants";
import type { BookingType, Listing } from "@/lib/types";

const TIME_SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"];

export function TestDriveDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, addBooking } = useApp();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [city, setCity] = useState(listing.registrationCity);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  function confirm() {
    if (!user) {
      toast.error("Sign in to book a test drive");
      return;
    }
    if (!date || !time || !name || !phone) {
      toast.error("Please pick a date, time, and fill your details");
      return;
    }
    const type: BookingType = "test_drive";
    addBooking({
      listingId: listing.id,
      userId: user.id,
      buyerName: name,
      buyerEmail: user.email,
      buyerPhone: phone,
      type,
      amount: 0,
      scheduledDate: date.toISOString(),
      city,
    });
    toast.success("Test drive booked! Check your dashboard for details.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Book a test drive
          </DialogTitle>
          <DialogDescription>
            {listing.year} {listing.brand} {listing.model} · {listing.variant}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 inline-block">Pick a date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              className="rounded-lg border"
            />
          </div>

          <div>
            <Label className="mb-1.5 inline-block">Preferred time slot</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 inline-block">Branch / city</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Nearest DriveHub branch
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 inline-block">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 inline-block">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 ..."
              />
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            Free, no-obligation test drive. Bring your driving license. Our advisor will call to
            confirm.
          </div>

          <Button onClick={confirm} size="lg" className="w-full" disabled={!user}>
            {user ? "Confirm test drive" : "Sign in to book"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
