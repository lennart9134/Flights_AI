import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children
}: PageHeroProps) {
  return (
    <section className="relative overflow-visible rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(7,39,84,0.96),rgba(18,95,120,0.88)_52%,rgba(237,180,76,0.72))] px-5 py-10 text-white shadow-panel sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="relative z-10 space-y-6">
        <div className="max-w-4xl space-y-4">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-4xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-white/82 sm:text-lg">{description}</p>
        </div>

        {children ? (
          <div className="w-full max-w-[1280px]">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
