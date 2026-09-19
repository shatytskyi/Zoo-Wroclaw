import { lazy, Suspense, useEffect, useState } from "react";
import {
  Footprints,
  Layers,
  LocateFixed,
  Map as MapIcon,
  MapPinned,
  Navigation,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { PLACE_BY_ID, placeName } from "@/data/places";
import { upcomingFeedings, formatClock, formatCountdown } from "@/data/feedings";
import { copy, detectLang, LANGS } from "@/lib/i18n";
import { useZoo, type Tab } from "@/lib/store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useNow } from "@/hooks/use-now";
import { Button } from "@/components/ui/button";
import { PlanView } from "@/components/plan-view";
import {
  FeedingsPanel,
  HoursNote,
  NavBanner,
  PlaceDetail,
  SearchPanel,
  StatusBar,
  ToursPanel,
} from "@/components/panels";
import { cn } from "@/lib/utils";

const ZooMap = lazy(async () => {
  const m = await import("@/components/zoo-map");
  return { default: m.ZooMap };
});

const TABS: { id: Tab; icon: typeof MapIcon; label: keyof typeof copy.pl }[] = [
  { id: "map", icon: Search, label: "showList" },
  { id: "feedings", icon: UtensilsCrossed, label: "feedings" },
  { id: "tours", icon: Footprints, label: "tours" },
  { id: "plan", icon: MapPinned, label: "plan" },
];

export function AppShell() {
  useGeolocation();
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const tab = useZoo((s) => s.tab);
  const selectedId = useZoo((s) => s.selectedId);
  const selected = selectedId ? PLACE_BY_ID[selectedId] : undefined;
  const route = useZoo((s) => s.route);
  const toast = useZoo((s) => s.toast);
  const mapStyle = useZoo((s) => s.mapStyle);
  const now = useNow();
  const next = upcomingFeedings(now, 1)[0];
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
    const apply = () => {
      try {
        if (!window.localStorage.getItem("zoo-wroclaw-nav")) {
          useZoo.getState().setLang(detectLang());
        }
      } catch {
        useZoo.getState().setLang(detectLang());
      }
    };
    const persist = useZoo.persist;
    if (persist.hasHydrated()) apply();
    else persist.onFinishHydration(apply);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => useZoo.getState().setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const nextPlace = next ? PLACE_BY_ID[next.placeId] : undefined;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg md:flex-row">
      <section className="relative min-h-0 flex-1">
        {tab === "plan" ? (
          <div className="absolute inset-0 z-[5]">
            <PlanView />
          </div>
        ) : null}
        <div className={cn("absolute inset-0", tab === "plan" && "invisible")}>
          {mapReady ? (
            <Suspense fallback={<div className="h-full bg-map-bg" />}>
              <ZooMap />
            </Suspense>
          ) : (
            <div className="h-full bg-map-bg" />
          )}
        </div>

        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="pointer-events-auto mx-3 flex items-center gap-2 rounded-xl bg-forest px-3 py-2 text-bg shadow-[var(--shadow-panel)]">
            <MapIcon className="size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold leading-tight">{t.app}</p>
              <StatusBar />
            </div>
            <div className="flex rounded-md bg-forest-2 p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => useZoo.getState().setLang(l.id)}
                  className={cn(
                    "h-8 min-w-8 rounded px-2 text-xs font-semibold",
                    lang === l.id ? "bg-bg text-forest" : "text-bg/70",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          {route ? <NavBanner /> : null}
        </header>

        <div className="pointer-events-none absolute right-3 top-24 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            className="pointer-events-auto shadow-[var(--shadow-card)]"
            onClick={() => {
              useZoo.getState().setFollow(true);
              if (useZoo.getState().gpsMode === "demo") {
                navigator.geolocation?.getCurrentPosition(
                  (p) =>
                    useZoo.getState().setPos([p.coords.latitude, p.coords.longitude], p.coords.accuracy, "live"),
                  () => useZoo.getState().setToast(t.gpsDenied),
                );
              }
            }}
            aria-label={t.recenter}
          >
            <LocateFixed className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="pointer-events-auto shadow-[var(--shadow-card)]"
            onClick={() => useZoo.getState().setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
            aria-label={t.satellite}
          >
            <Layers className="size-5" />
          </Button>
        </div>

        {toast ? (
          <div className="absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-forest px-3 py-2 text-sm text-bg md:left-auto md:w-80">
            {toast}
          </div>
        ) : null}
      </section>

      <aside className="relative z-20 flex max-h-[52%] flex-col rounded-t-2xl bg-surface shadow-[var(--shadow-panel)] md:max-h-none md:h-full md:w-[400px] md:rounded-none md:border-l md:border-border">
        {next && nextPlace && !route ? (
          <button
            type="button"
            onClick={() => useZoo.getState().startRoute(nextPlace.id, [nextPlace.lat, nextPlace.lon])}
            className="flex items-center gap-3 border-b border-border px-4 py-3 text-left hover:bg-surface-2"
          >
            <UtensilsCrossed className="size-4 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-subtle">
                {t.nextFeeding} · {formatClock(next.hour, next.minute)}
              </span>
              <span className="block truncate text-sm font-medium text-fg">
                {placeName(nextPlace, lang)}
              </span>
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {formatCountdown(next.at.getTime() - now.getTime(), lang)}
            </span>
            <Navigation className="size-4 text-accent" />
          </button>
        ) : null}

        <nav className="flex gap-1 px-3 pt-3">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  useZoo.getState().setTab(item.id);
                  if (item.id !== "map") useZoo.getState().select(null);
                }}
                className={cn(
                  "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium",
                  active ? "bg-forest text-bg" : "text-muted hover:bg-surface-2",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{t[item.label]}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-hidden">
          {selected && tab !== "plan" ? (
            <PlaceDetail place={selected} />
          ) : tab === "feedings" ? (
            <FeedingsPanel />
          ) : tab === "tours" ? (
            <ToursPanel />
          ) : (
            <SearchPanel />
          )}
        </div>
        <HoursNote />
      </aside>
    </div>
  );
}
