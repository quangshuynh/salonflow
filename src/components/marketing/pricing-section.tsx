import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tier = {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: 29,
    description: "For independent stylists and single chairs.",
    features: [
      "1 location",
      "Up to 3 staff members",
      "Scheduling & calendar",
      "Customer directory",
    ],
  },
  {
    name: "Pro",
    price: 59,
    description: "For growing salons that live by the book.",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Unlimited staff",
      "Revenue reports",
      "Service menu management",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: 99,
    description: "For multi-location studios and franchises.",
    features: [
      "Everything in Pro",
      "Multiple locations",
      "Staff permissions",
      "Data export",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Simple pricing that scales with your chairs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every plan starts with a 14-day free trial. No card required.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-xl border bg-background p-6",
                tier.highlighted && "border-primary shadow-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{tier.name}</h3>
                {tier.highlighted && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-4">
                <span className="text-3xl font-semibold tracking-tight">
                  ${tier.price}
                </span>
                <span className="text-sm text-muted-foreground"> /month</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {tier.description}
              </p>
              <ul className="mt-6 flex flex-col gap-2.5 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8"
                variant={tier.highlighted ? "default" : "outline"}
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Start free trial
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
