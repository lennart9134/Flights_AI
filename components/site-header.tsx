"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleAlert, Heart, Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Flights",
    icon: Search
  },
  {
    href: "/saved-searches",
    label: "Saved searches",
    icon: Heart
  },
  {
    href: "/price-alerts",
    label: "Price alerts",
    icon: CircleAlert
  },
  {
    href: "/regional-comparison",
    label: "Regional compare",
    icon: Sparkles
  }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/55 bg-white/70 backdrop-blur-xl">
      <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Flights AI</p>
              <p className="text-xs text-muted-foreground">
                Search-first total-cost flight comparison
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
