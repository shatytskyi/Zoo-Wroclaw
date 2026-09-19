import {
  Clock,
  Footprints,
  MapPin,
  Navigation,
  Star,
  Check,
  CloudSun,
  DoorClosed,
  Info,
} from "lucide-react";
import { PLACE_BY_ID, PLACES, placeName, searchPlaces, type Place } from "@/data/places";
import { TOURS } from "@/data/tours";
import {
  formatClock,
  formatCountdown,
  happensOn,
  isZooOpen,
  japanGateOpen,
  todaysFeedings,
  upcomingFeedings,
  type Feeding,
} from "@/data/feedings";
import { formatDistance, formatWalk, haversine } from "@/lib/geo";
import { copy, type Lang } from "@/lib/i18n";
import { useZoo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";

function daysLabel(f: Feeding, lang: Lang): string {
  const t = copy[lang];
  if (f.days === "daily") return t.daily;
  return f.days.map((d) => t.week[d]).join(", ");
}

function SmokeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M17 8c.7.4 1.2 1.1 1.2 2M19.2 6.5c1 .6 1.6 1.6 1.6 2.8M4 14.2h11.2c.5 0 .8.4.8.8v1.8c0 .5-.3.8-.8.8H4c-.5 0-.8-.3-.8-.8v-1.8c0-.4.3-.8.8-.8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M15.2 14.2h2.2v3.4h-2.2z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function PlaceRow({ place, lang, right }: { place: Place; lang: Lang; right?: string }) {
  const selected = useZoo((s) => s.selectedId === place.id);
  const fav = useZoo((s) => s.favorites.includes(place.id));
  return (
    <button
      type="button"
      onClick={() => useZoo.getState().select(place.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        selected ? "bg-surface-2" : "hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md text-xs font-semibold",
          place.kind === "food" && "bg-accent text-accent-fg",
          place.kind === "smoke" && "bg-[#6b5344] text-bg",
          place.kind === "toilet" && "bg-sage text-bg",
          place.kind === "closed" && "bg-danger text-bg",
          (place.kind === "animal" || place.kind === "pavilion" || place.kind === "farm") &&
            "bg-forest text-bg",
          (place.kind === "gate" || place.kind === "service" || place.kind === "play") &&
            "bg-sage text-bg",
        )}
      >
        {place.kind === "smoke" ? (
          <SmokeGlyph className="size-4" />
        ) : (
          placeName(place, lang).slice(0, 1)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium">{placeName(place, lang)}</span>
          {fav ? <Star className="size-3 fill-accent text-accent" /> : null}
        </span>
        {place.hint?.[lang] ? (
          <span className="block truncate text-xs text-muted">{place.hint[lang]}</span>
        ) : null}
      </span>
      {right ? <span className="shrink-0 font-medium tabular-nums text-sm">{right}</span> : null}
    </button>
  );
}

export function PlaceDetail({ place }: { place: Place }) {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const fav = useZoo((s) => s.favorites.includes(place.id));
  const visited = useZoo((s) => s.visited.includes(place.id));
  const pos = useZoo((s) => s.pos);
  const now = useNow();
  const dist = haversine(pos, [place.lat, place.lon]);
  const feeds = todaysFeedings(now).filter((f) => f.placeId === place.id);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {placeName(place, lang)}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {place.hint?.[lang]}
            {place.indoor ? ` · ${t.indoor}` : ""}
            {place.seasonal ? ` · ${t.seasonal}` : ""}
            {place.closed ? ` · ${t.closed}` : ""}
          </p>
          <p className="mt-1 text-sm tabular-nums text-fg">
            {formatDistance(dist, lang)} · {formatWalk(dist, lang)}
          </p>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-md hover:bg-surface-2"
          onClick={() => useZoo.getState().toggleFav(place.id)}
          aria-label={t.favorites}
        >
          <Star className={cn("size-5", fav ? "fill-accent text-accent" : "text-muted")} />
        </button>
      </div>
      {feeds.length ? (
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
          {feeds.map((f) => (
            <div key={f.id} className="flex items-center gap-2 py-0.5">
              <Clock className="size-3.5 text-accent" />
              <span className="tabular-nums font-medium">{formatClock(f.hour, f.minute)}</span>
              <span className="text-muted">{daysLabel(f, lang)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {place.id === "gate-japan" ? (
        <p className="text-sm text-muted">{japanGateOpen(now) ? t.japanOpen : t.japanShut}</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          variant="accent"
          className="flex-1"
          disabled={!!place.closed}
          onClick={() => useZoo.getState().startRoute(place.id, [place.lat, place.lon])}
        >
          <Navigation className="size-4" />
          {t.navigate}
        </Button>
        <Button variant="outline" onClick={() => useZoo.getState().toggleVisited(place.id)}>
          <Check className={cn("size-4", visited && "text-ok")} />
          {t.markVisited}
        </Button>
      </div>
    </div>
  );
}

export function SearchPanel() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const query = useZoo((s) => s.query);
  const favs = useZoo((s) => s.favorites);
  const results = searchPlaces(query, lang)
    .filter((p) => p.kind !== "closed")
    .slice()
    .sort((a, b) => {
      const pos = useZoo.getState().pos;
      return haversine(pos, [a.lat, a.lon]) - haversine(pos, [b.lat, b.lon]);
    });
  const favPlaces = PLACES.filter((p) => favs.includes(p.id));

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2">
        <input
          value={query}
          onChange={(e) => useZoo.getState().setQuery(e.target.value)}
          placeholder={t.search}
          className="h-11 w-full rounded-lg bg-surface-2 px-3 text-sm outline-none ring-accent/40 focus:ring-2"
        />
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {(() => {
            const q = lang === "ru" ? "курилки" : lang === "pl" ? "palarnie" : "smoking";
            const on = query.toLowerCase() === q;
            return (
              <button
                type="button"
                onClick={() => useZoo.getState().setQuery(on ? "" : q)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
                  on ? "bg-[#6b5344] text-bg" : "bg-surface-2 text-muted",
                )}
              >
                {t.smoking}
              </button>
            );
          })()}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
        {!query && favPlaces.length ? (
          <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-subtle">
            {t.favorites}
          </div>
        ) : null}
        {!query &&
          favPlaces.map((p) => <PlaceRow key={`f-${p.id}`} place={p} lang={lang} />)}
        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">{t.emptySearch}</p>
        ) : (
          results.slice(0, 30).map((p) => <PlaceRow key={p.id} place={p} lang={lang} />)
        )}
      </div>
    </div>
  );
}

export function FeedingsPanel() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const now = useNow();
  const upcoming = upcomingFeedings(now, 12);
  const today = todaysFeedings(now);

  return (
    <div className="flex h-full flex-col">
      <p className="px-4 pb-2 text-xs text-muted">{t.disclaimer}</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
        {upcoming.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">{t.noMoreToday}</p>
        ) : (
          upcoming.map((f) => {
            const place = PLACE_BY_ID[f.placeId];
            if (!place) return null;
            const sameDay =
              f.at.getDate() === now.getDate() && f.at.getMonth() === now.getMonth();
            const right = sameDay
              ? `${formatClock(f.hour, f.minute)} · ${formatCountdown(f.at.getTime() - now.getTime(), lang)}`
              : `${t.tomorrow} ${formatClock(f.hour, f.minute)}`;
            return (
              <div key={f.id} className="px-1">
                <PlaceRow place={place} lang={lang} right={formatClock(f.hour, f.minute)} />
                <div className="mb-1 ml-14 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{right}</span>
                  {f.weather ? (
                    <span className="inline-flex items-center gap-1">
                      <CloudSun className="size-3" />
                      {t.weather}
                    </span>
                  ) : null}
                  {f.note ? <span>{f.note[lang]}</span> : null}
                </div>
              </div>
            );
          })
        )}
        <div className="px-4 pt-2">
          <Button
            variant="accent"
            className="w-full"
            onClick={() => {
              const next = upcoming.slice(0, 5);
              const ids = next.map((f) => f.placeId);
              const pts = ids
                .map((id) => PLACE_BY_ID[id])
                .filter(Boolean)
                .map((p) => [p.lat, p.lon] as [number, number]);
              if (pts.length) useZoo.getState().startMulti(ids, pts);
            }}
          >
            <Footprints className="size-4" />
            {t.feedingHop}
          </Button>
        </div>
        <p className="px-4 pt-3 text-xs text-subtle">
          {t.today}: {today.filter((f) => happensOn(f, now.getDay(), now)).length}
        </p>
      </div>
    </div>
  );
}

export function ToursPanel() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {TOURS.map((tour) => (
        <article key={tour.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-lg font-semibold">{tour.names[lang]}</h3>
          <p className="mt-1 text-sm text-muted">{tour.blurb[lang]}</p>
          <p className="mt-2 text-xs tabular-nums text-subtle">
            ~{tour.durationMin} min · {tour.placeIds.length} {t.stops}
          </p>
          <Button
            variant="accent"
            size="sm"
            className="mt-3"
            onClick={() => {
              const pts = tour.placeIds
                .map((id) => PLACE_BY_ID[id])
                .filter(Boolean)
                .map((p) => [p.lat, p.lon] as [number, number]);
              useZoo.getState().startMulti(tour.placeIds, pts);
            }}
          >
            <Navigation className="size-4" />
            {t.startTour}
          </Button>
        </article>
      ))}
    </div>
  );
}

export function NavBanner() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const route = useZoo((s) => s.route);
  const pos = useZoo((s) => s.pos);
  const simulating = useZoo((s) => s.simulating);
  if (!route) return null;
  const dest = PLACE_BY_ID[route.toId];
  const remain = dest ? haversine(pos, [dest.lat, dest.lon]) : route.distance;
  const arrived = remain < 28;
  return (
    <div className="pointer-events-auto mx-3 mt-3 rounded-xl bg-forest px-3 py-2.5 text-bg shadow-[var(--shadow-panel)]">
      <div className="flex items-center gap-3">
        <MapPin className="size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {arrived ? t.arrived : dest ? placeName(dest, lang) : t.follow}
          </p>
          <p className="text-xs text-bg/70 tabular-nums">
            {formatDistance(remain, lang)} · {formatWalk(remain, lang)} {t.metersLeft}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 bg-surface text-fg"
          onClick={() =>
            simulating
              ? useZoo.getState().setSimulating(false)
              : useZoo.getState().setSimulating(true)
          }
        >
          {simulating ? t.simulating : t.simulate}
        </Button>
        <Button size="sm" variant="ghost" className="text-bg" onClick={() => useZoo.getState().stopRoute()}>
          {t.stop}
        </Button>
      </div>
    </div>
  );
}

export function StatusBar() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  const now = useNow(30000);
  const open = isZooOpen(now);
  const gpsMode = useZoo((s) => s.gpsMode);
  return (
    <div className="flex items-center gap-2 text-[11px] text-bg/80">
      <span className={cn("size-1.5 rounded-full", open.open ? "bg-ok" : "bg-danger")} />
      <span>
        {open.open ? t.openNow : t.closedNow} · {t.lastEntry} {open.ticketH}:00
      </span>
      {gpsMode === "demo" ? <span>· {t.demo}</span> : null}
    </div>
  );
}

export function HoursNote() {
  const lang = useZoo((s) => s.lang);
  const t = copy[lang];
  return (
    <div className="flex items-start justify-between gap-3 px-4 pb-[max(0.35rem,env(safe-area-inset-bottom))] text-xs text-muted">
      <p className="flex min-w-0 items-start gap-2">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {t.hoursNote}{" "}
          <span className="inline-flex items-center gap-1">
            <DoorClosed className="size-3" />
            {japanGateOpen() ? t.japanOpen : t.japanShut}
          </span>
        </span>
      </p>
      <a
        href="https://github.com/shatytskyi/Zoo-Wroclaw"
        target="_blank"
        rel="noreferrer"
        className="shrink-0 font-medium text-forest underline-offset-2 hover:underline"
      >
        {t.source}
      </a>
    </div>
  );
}
