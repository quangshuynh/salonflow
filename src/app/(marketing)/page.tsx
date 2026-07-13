import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeaturesSection } from "@/components/marketing/features-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-6 pt-24 pb-20 text-center">
        <p className="mx-auto w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Built for salons, barbershops, spas, and studios
        </p>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Run your salon&apos;s whole day from one screen
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Scheduling, customers, staff, and revenue — SalonFlow keeps the
          front desk moving so your team can stay behind the chair.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
            Start free trial
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/#features" />}
          >
            See features
          </Button>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t pt-8">
          {[
            ["2 min", "to book an appointment"],
            ["1 view", "of every chair, all day"],
            ["0 spreadsheets", "needed to close the month"],
          ].map(([stat, label]) => (
            <div key={label}>
              <dt className="text-2xl font-semibold tracking-tight">{stat}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <FeaturesSection />
      <PricingSection />

      <section className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Ready to leave the paper book behind?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Try SalonFlow with your real schedule. Setup takes minutes, not
          days.
        </p>
        <Button
          size="lg"
          className="mt-8"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Start free trial
          <ArrowRight data-icon="inline-end" />
        </Button>
      </section>
    </>
  );
}
