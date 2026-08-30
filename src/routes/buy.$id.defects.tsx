import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The standalone defects report used to render a fixed six-item defect list with
 * invented repair costs, identical for every car. The seller's actual declared
 * defects are shown on the listing and in the vehicle summary, so this route
 * redirects there rather than continuing to publish fabricated findings.
 */
export const Route = createFileRoute("/buy/$id/defects")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/buy/$id/report",
      params: { id: params.id },
      replace: true,
    });
  },
});
