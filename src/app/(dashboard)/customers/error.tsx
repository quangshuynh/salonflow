"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

/**
 * Query-failure state for /customers and /customers/[id]. Reads go straight
 * to Supabase and throw on failure rather than falling back to mock data, so
 * this boundary is what a signed-in user sees when the database is
 * unreachable or a policy rejects the read. The underlying message is left in
 * the server logs — it can name schema internals.
 */
export default function CustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Something went wrong loading your directory."
      />
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load customers"
        description="The request to the database didn't complete. Your data is untouched — try again, and check your connection if this keeps happening."
      >
        <div className="mt-3 flex flex-col items-center gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCw data-icon="inline-start" />
            Try again
          </Button>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </EmptyState>
    </div>
  );
}
