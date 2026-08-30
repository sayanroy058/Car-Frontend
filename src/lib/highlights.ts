// ---------------------------------------------------------------------------
// Feature highlights a seller can declare on a listing.
//
// Previously the detail page rendered a fixed 9-tag array for every car. These
// are the selectable options; the chosen subset is stored on the listing as a
// JSON array in `highlights`.
// ---------------------------------------------------------------------------

export const HIGHLIGHT_OPTIONS: Record<string, string[]> = {
  Safety: [
    "ABS with EBD",
    "Electronic Stability Program",
    "Hill-hold assist",
    "ISOFIX child seat mounts",
    "Tyre pressure monitor",
    "360° surround camera",
    "Reverse parking camera",
    "Blind-spot monitor",
    "Lane-keep assist",
    "Forward collision warning",
    "ADAS Level 2",
  ],
  "Comfort & convenience": [
    "Automatic climate control",
    "Dual-zone climate control",
    "Ventilated front seats",
    "Electric driver seat",
    "Auto-dimming IRVM",
    "Rain-sensing wipers",
    "Auto LED headlamps",
    "Push-button start",
    "Cruise control",
    "Adaptive cruise control",
    "Wireless phone charger",
    "Hands-free tailgate",
  ],
  Infotainment: [
    "Touchscreen infotainment",
    "Apple CarPlay",
    "Android Auto",
    "Wireless Apple CarPlay",
    "Wireless Android Auto",
    "Premium branded audio",
    "Voice assistant",
    "Connected car tech",
    "Digital instrument cluster",
  ],
  Exterior: [
    "LED headlamps",
    "LED DRLs",
    "Sunroof",
    "Panoramic sunroof",
    "Alloy wheels",
    "Roof rails",
    "Auto-folding ORVMs",
    "Rear spoiler",
  ],
  Interior: [
    "Leatherette upholstery",
    "Leather upholstery",
    "Ambient lighting",
    "Cooled glovebox",
    "60:40 split rear seat",
    "Rear AC vents",
    "USB-C charging ports",
    "Paddle shifters",
  ],
};

/** Flat list of every valid highlight, for validation. */
export const ALL_HIGHLIGHTS: string[] = Object.values(HIGHLIGHT_OPTIONS).flat();
