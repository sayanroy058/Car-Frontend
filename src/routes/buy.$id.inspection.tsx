import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The standalone inspection report used to render a fixed 200-point checklist,
 * a fabricated score derived from the listing id, and a fixed defect tracker —
 * identical for every car and presented as if verified. There is no inspection
 * programme wired up yet, so rather than keep publishing invented results this
 * route redirects to the seller-declared vehicle summary.
 *
 * Kept as a redirect (rather than deleted) so existing links and bookmarks land
 * somewhere useful instead of a 404. Replace this with the real report once a
 * PDI programme exists.
 */
export const Route = createFileRoute("/buy/$id/inspection")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/buy/$id/report",
      params: { id: params.id },
      replace: true,
    });
  },
});
