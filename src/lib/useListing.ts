import { useQuery } from "@tanstack/react-query";
import { getListing } from "./api";
import { qk } from "./queries";
import { useApp } from "./store";
import type { Listing } from "./types";

/**
 * Resolves a single listing by id.
 *
 * The store's `listings` array is populated by an async effect, so reading it
 * directly meant a hard refresh or a shared link rendered "not found" before the
 * data arrived. This falls back to fetching the listing on its own, and reports
 * a genuine 404 only once that request has actually failed.
 */
export function useListing(id: string): {
  listing: Listing | undefined;
  isLoading: boolean;
  notFound: boolean;
} {
  const { listings } = useApp();
  const fromStore = listings.find((l) => l.id === id);

  const query = useQuery({
    queryKey: qk.listing(id),
    queryFn: () => getListing(id),
    // Skip the request when the store already has it.
    enabled: !fromStore,
    retry: false,
  });

  return {
    listing: fromStore ?? query.data,
    isLoading: !fromStore && query.isLoading,
    notFound: !fromStore && query.isError,
  };
}
