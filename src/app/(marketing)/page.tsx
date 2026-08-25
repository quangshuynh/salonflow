import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeaturesSection } from "@/components/marketing/features-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Button } from "@/components/ui/button";

/**
 * Headline numbers describe what the interface does, not usage claims we
 * have no data for.
 */
const HIGHLIGHTS: [stat: string, label: string][] = [
  ["2 min", "to book an appointment"],
  ["1 view", "of every chair, all day"],
  ["0 spreadsheets", "needed to close the month"],
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24 sm:pb-20">
        <p className="mx-auto w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Built for salons, barbershops, spas, and studios
        </p>
        <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Run your salon&apos;s whole day from one screen
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
          Scheduling, customers, staff, and revenue — SalonFlow keeps the
          front desk moving so your team can stay behind the chair.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Explore the demo
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/#features" />}
          >
            See features
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          The demo runs on sample data — no account needed.
        </p>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 border-t pt-8 text-left sm:mt-16 sm:grid-cols-3 sm:text-center">
          {HIGHLIGHTS.map(([stat, label]) => (
            <div
              key={label}
              className="flex items-baseline gap-3 sm:block sm:gap-0"
            >
              <dt className="text-xl font-semibold tracking-tight sm:text-2xl">
                {stat}
              </dt>
              <dd className="text-sm text-muted-foreground sm:mt-1">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <FeaturesSection />
      <PricingSection />

      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Ready to leave the paper book behind?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Walk through a full salon day — schedule, customers, staff, and
          reports — with sample data already loaded.
        </p>
        <Button
          size="lg"
          className="mt-8 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Explore the demo
          <ArrowRight data-icon="inline-end" />
        </Button>
      </section>
    </>
  );
}
