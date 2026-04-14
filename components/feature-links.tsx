import Link from "next/link";
import { BellRing, ChevronRight, Heart, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const featureLinks = [
  {
    href: "/saved-searches",
    title: "Saved searches",
    description: "Keep favorite routes ready to rerun instead of crowding the homepage.",
    icon: Heart
  },
  {
    href: "/price-alerts",
    title: "Price alerts",
    description: "Manage alert targets on their own page once a route is worth watching.",
    icon: BellRing
  },
  {
    href: "/regional-comparison",
    title: "Regional comparison",
    description: "Check whether the same trip prices differently by market or point of sale.",
    icon: Sparkles
  }
];

export function FeatureLinks() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-primary">More tools</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Search stays in focus here. Management and comparison tools live on dedicated pages.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {featureLinks.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full border-white/70 bg-white/80 transition-colors hover:bg-white">
              <CardContent className="p-5">
                <feature.icon className="h-5 w-5 text-accent" />
                <h3 className="mt-4 text-lg font-semibold text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Open page
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
