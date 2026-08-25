"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/** Catches render errors in any dashboard route so the shell stays usable. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description="This page couldn't be loaded. Try again — if it keeps happening, reload the app."
    >
      <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
        Try again
      </Button>
    </EmptyState>
  );
}
