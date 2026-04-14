"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, MapPin, PlaneTakeoff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  findLocationSuggestions,
  type LocationSuggestion
} from "@/lib/flights/airports";

interface LocationComboboxProps {
  id: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function LocationCombobox({
  id,
  value,
  placeholder,
  onChange
}: LocationComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestions = useMemo(() => findLocationSuggestions(value), [value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function selectSuggestion(suggestion: LocationSuggestion) {
    onChange(suggestion.value);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (suggestions.length === 0) {
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) => (current + 1) % suggestions.length);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) =>
              current === 0 ? suggestions.length - 1 : current - 1
            );
          }

          if (event.key === "Enter" && isOpen && suggestions[activeIndex]) {
            event.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      />

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,238,0.98))] shadow-panel backdrop-blur-xl">
          <div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Suggested places
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                  activeIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary/80"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                    activeIndex === index ? "bg-white/16" : "bg-secondary"
                  )}
                >
                  {suggestion.type === "city" ? (
                    <MapPin
                      className={cn(
                        "h-4 w-4",
                        activeIndex === index ? "text-white" : "text-accent"
                      )}
                    />
                  ) : (
                    <PlaneTakeoff
                      className={cn(
                        "h-4 w-4",
                        activeIndex === index ? "text-white" : "text-accent"
                      )}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{suggestion.primaryLabel}</p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        activeIndex === index
                          ? "bg-white/16 text-white/90"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <Building2 className="h-3 w-3" />
                      {suggestion.code}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 truncate text-sm",
                      activeIndex === index ? "text-white/84" : "text-muted-foreground"
                    )}
                  >
                    {suggestion.secondaryLabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
