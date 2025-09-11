import React, { useMemo, useRef } from "react";
import Button from "../ui/Button";
import {
  Droplets,
  Flame,
  Filter as FilterIcon,
  Beaker,
  TriangleAlert,
  ShieldCheck,
  ThermometerSun,
  Info
} from "lucide-react";

// Simple utility to concatenate class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Simple Card components to match your project style
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-lg shadow border border-gray-200 dark:border-transparent", className)}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-4", className)}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn("font-semibold", className)}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-4", className)}>
    {children}
  </div>
);

// --- Types ---
export type WaterSnapshot = {
  ph?: number; // typical potable 6.5 - 8.5
  ntu?: number; // turbidity (NTU)
  tds?: number; // total dissolved solids (mg/L)
};

export type Tip = {
  id: string;
  title: string;
  body: string;
  level?: "info" | "warn" | "critical";
  icon?: React.ReactNode;
  actions?: { label: string; href?: string; onClick?: () => void }[];
};

interface WaterTipsRailProps {
  snapshot?: WaterSnapshot; // optional live metrics to tailor suggestions
  tips?: Tip[]; // provide your own tips; otherwise we derive from snapshot
  className?: string;
  title?: string;
  subtitle?: string;
}

// --- Helper: default/canned tips (also used as fallbacks) ---
function getBaseTips(): Tip[] {
  return [
    {
      id: "boil",
      title: "Boil if unsure",
      body:
        "Bring water to a rolling boil for at least 1 minute (3 minutes at high altitudes). Let it cool naturally.",
      level: "warn",
      icon: <Flame className="h-5 w-5" />,
    },
    
    {
      id: "chlorinate",
      title: "Disinfect with chlorine",
      body:
        "Use unscented household bleach (5–6% sodium hypochlorite): add ~2 drops per liter (8 drops/gal), mix, wait 30 minutes.",
      level: "info",
      icon: <Beaker className="h-5 w-5" />,
    },
    {
      id: "filter",
      title: "Filter particulates",
      body:
        "Pass through a 0.2–1.0 μm filter or clean cloth to remove sediments before any disinfection.",
      level: "info",
      icon: <FilterIcon className="h-5 w-5" />,
    },
    {
      id: "storage",
      title: "Safe storage",
      body:
        "Use clean, covered containers. Avoid re‑contamination by dipping hands or cups directly.",
      level: "info",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: "uv-treatment",
      title: "UV disinfection",
      body:
        "UV-C light (254nm) effectively kills bacteria and viruses. Ensure water is clear first, as particles can shield microorganisms.",
      level: "info",
      icon: <ThermometerSun className="h-5 w-5" />,
    },
    {
      id: "test-regularly",
      title: "Test water quality",
      body:
        "Test pH, chlorine residual, and turbidity weekly. Professional bacterial testing recommended monthly for private sources.",
      level: "info",
      icon: <Beaker className="h-5 w-5" />,
    },
    {
      id: "source-protection",
      title: "Protect water source",
      body:
        "Keep potential contaminants (chemicals, waste, fuel) at least 100 feet from wells or water intake points.",
      level: "warn",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: "emergency-storage",
      title: "Emergency water prep",
      body:
        "Store 1 gallon per person per day for at least 3 days. Rotate stored water every 6 months to maintain freshness.",
      level: "info",
      icon: <Droplets className="h-5 w-5" />,
    },
    {
      id: "equipment-maintenance",
      title: "Maintain equipment",
      body:
        "Replace filters according to manufacturer schedule. Clean and sanitize storage tanks annually to prevent biofilm growth.",
      level: "info",
      icon: <FilterIcon className="h-5 w-5" />,
    },
    {
      id: "temperature-safety",
      title: "Hot water safety",
      body:
        "Set water heater to 120°F (49°C) to prevent scalding while inhibiting bacterial growth. Flush rarely-used taps regularly.",
      level: "warn",
      icon: <ThermometerSun className="h-5 w-5" />,
    },
    {
      id: "conservation",
      title: "Water conservation",
      body:
        "Fix leaks promptly, install low-flow fixtures, and collect rainwater for non-potable uses to preserve clean water resources.",
      level: "info",
      icon: <Droplets className="h-5 w-5" />,
    },
    {
      id: "quality-indicators",
      title: "Watch for warning signs",
      body:
        "Monitor for unusual taste, odor, color, or cloudiness. These may indicate contamination requiring immediate attention.",
      level: "critical",
      icon: <TriangleAlert className="h-5 w-5" />,
    },
  ];
}

// --- Helper: derive dynamic tips from snapshot ---
function tipsFromSnapshot(s?: WaterSnapshot): Tip[] {
  const out: Tip[] = [];
  if (!s) return out;

  if (typeof s.ntu === "number" && s.ntu > 5) {
    out.push({
      id: "high-turbidity",
      title: `High turbidity (${s.ntu.toFixed(1)} NTU)`,
      body:
        "Let water settle, then filter (cloth or cartridge) before boiling or chlorination—particles can shield microbes.",
      level: "warn",
      icon: <Droplets className="h-5 w-5" />,
    });
  }

  if (typeof s.tds === "number" && s.tds > 1000) {
    out.push({
      id: "tds",
      title: `Elevated TDS (${Math.round(s.tds)} mg/L)`,
      body:
        "Taste/mineral load likely high. Consider reverse osmosis or blended dilution. Standard boiling/disinfection won't reduce salts.",
      level: "info",
      icon: <Beaker className="h-5 w-5" />,
    });
  }

  if (typeof s.ph === "number" && (s.ph < 6.5 || s.ph > 8.5)) {
    out.push({
      id: "ph",
      title: `pH out of range (${s.ph.toFixed(2)})`,
      body:
        "Water may be corrosive (<6.5) or scale‑forming (>8.5). Use neutralization media (calcite/Corosex) or consult local guidance.",
      level: "info",
      icon: <ThermometerSun className="h-5 w-5" />,
    });
  }

  if (out.length === 0) {
    out.push({
      id: "good-range",
      title: "Parameters look typical",
      body:
        "Maintain routine filtration and safe storage. Periodically test for microbes if the source is uncertain.",
      level: "info",
      icon: <ShieldCheck className="h-5 w-5" />,
    });
  }

  return out;
}

// --- Badge ---
function LevelBadge({ level }: { level?: Tip["level"] }) {
  const map: Record<string, string> = {
    info: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
    warn: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
    critical: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20",
  };
  if (!level) return null;
  return (
    <span className={cn("px-2 py-0.5 text-[11px] rounded-full font-medium", map[level])}>
      {level.toUpperCase()}
    </span>
  );
}

// --- Main Component ---
export default function WaterTipsRail({
  snapshot,
  tips,
  className,
  title = "Water treatment suggestions",
  subtitle = "Auto‑tailored from your latest readings",
}: WaterTipsRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const base = tips ?? [...tipsFromSnapshot(snapshot), ...getBaseTips()];
    // de‑duplicate by id while preserving order
    const seen = new Set<string>();
    return base.filter(t => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  }, [snapshot, tips]);

  const scrollBy = (dx: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> {subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => scrollBy(-360)} className="p-2">
            {/* Left */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => scrollBy(360)} className="p-2">
            {/* Right */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Horizontal rail that stretches full width */}
      <div
        ref={railRef}
        className="group relative w-full overflow-x-auto overscroll-x-contain [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent] dark:[scrollbar-color:theme(colors.slate.500)_transparent]"
        role="region"
        aria-label="Water tips horizontal list"
      >
        <div className="flex gap-3 min-w-max pr-4">
          {items.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "w-[320px] shrink-0 transition-colors",
                "dark:backdrop-blur-md dark:border-white/10",
                "bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10",
                "dark:ring-1 dark:ring-inset dark:ring-white/10"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-inset ring-gray-200 text-gray-700 dark:bg-white/10 dark:ring-white/10 dark:text-white">
                      {t.icon ?? <Droplets className="h-5 w-5" />}
                    </span>
                    <CardTitle className="text-sm leading-tight text-gray-900 dark:text-white">{t.title}</CardTitle>
                  </div>
                  <LevelBadge level={t.level} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
                  {t.body}
                </p>
                {t.actions && t.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.actions.map((a, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="secondary"
                        onClick={a.onClick}
                        className="rounded-xl"
                      >
                        {a.href ? (
                          <a href={a.href} target="_blank" rel="noreferrer">
                            {a.label}
                          </a>
                        ) : (
                          <span>{a.label}</span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* tiny disclaimer */}
      <p className="mt-3 text-[11px] text-gray-500 dark:text-muted-foreground">
        Guidance here is general and for informational purposes only. For confirmed contamination events, follow local public health or utility advisories.
      </p>
    </section>
  );
}
