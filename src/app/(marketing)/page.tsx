import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        The management platform for salons, barber shops, spas, and beauty
        studios.
      </p>
      <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
        Open dashboard
      </Button>
    </div>
  );
}
