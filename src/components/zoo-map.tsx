import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, PLACE_BY_ID, type Place } from "@/data/places";
import { upcomingFeedings } from "@/data/feedings";
import { ZOO_BOUNDS, ZOO_CENTER } from "@/lib/geo";
import { asset } from "@/lib/asset";
import { useZoo } from "@/lib/store";

const SAT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function hasLocalTile(z: number, x: number, y: number) {
  return (
    (z === 16 && x >= 35874 && x <= 35877 && y >= 21908 && y <= 21911) ||
    (z === 17 && x >= 71749 && x <= 71755 && y >= 43816 && y <= 43822) ||
    (z === 18 && x >= 143500 && x <= 143510 && y >= 87634 && y <= 87644)
  );
}

const LocalFirst = L.TileLayer.extend({
  getTileUrl(coords: L.Coords) {
    const z = coords.z;
    const x = coords.x;
    const y = coords.y;
    if (hasLocalTile(z, x, y)) return asset(`tiles/${z}/${x}/${y}.png`);
    const r = L.Browser.retina ? "@2x" : "";
    const s = ["a", "b", "c", "d"][(x + y) & 3];
    return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}${r}.png`;
  },
});

function pinFill(place: Place, selected: boolean, feeding: boolean) {
  if (selected || feeding) return "#c45c26";
  if (place.kind === "food") return "#c45c26";
  if (place.kind === "smoke") return "#6b5344";
  if (place.kind === "closed") return "#9b2f2f";
  if (
    place.kind === "toilet" ||
    place.kind === "service" ||
    place.kind === "gate" ||
    place.kind === "play"
  ) {
    return "#66755a";
  }
  return "#243126";
}

function showPlace(place: Place, zoom: number, selectedId: string | null, feedingIds: Set<string>) {
  if (place.id === selectedId || feedingIds.has(place.id)) return true;
  if (place.kind === "closed" || place.kind === "gate" || place.kind === "pavilion" || place.kind === "smoke") return true;
  if (place.kind === "food" || place.kind === "toilet" || place.kind === "service" || place.kind === "play") {
    return zoom >= 18;
  }
  return zoom >= 16;
}

const userIcon = (demo: boolean) =>
  L.divIcon({
    className: "leaflet-div-icon-transparent",
    html: `<div class="user-dot${demo ? " is-demo" : ""}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const smokeIcon = L.divIcon({
  className: "leaflet-div-icon-transparent",
  html: `<div class="smoke-pin"><svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M17 8c.7.4 1.2 1.1 1.2 2M19.2 6.5c1 .6 1.6 1.6 1.6 2.8M4 14.2h11.2c.5 0 .8.4.8.8v1.8c0 .5-.3.8-.8.8H4c-.5 0-.8-.3-.8-.8v-1.8c0-.4.3-.8.8-.8Z" fill="#fffcf6" stroke="#fffcf6" stroke-width="1.6" stroke-linejoin="round"/><path d="M15.2 14.2h2.2v3.4h-2.2z" fill="#c45c26"/></svg></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export function ZooMap() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: ZOO_CENTER,
      zoom: 16,
      minZoom: 16,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
      maxBounds: L.latLngBounds(ZOO_BOUNDS[0], ZOO_BOUNDS[1]),
      maxBoundsViscosity: 0.6,
      preferCanvas: true,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
    mapRef.current = map;
    map.attributionControl.setPrefix("");

    const canvas = L.canvas({ padding: 0.4 });
    const placesLayer = L.layerGroup().addTo(map);
    const placeMarks = new Map<string, L.CircleMarker | L.Marker>();
    let streets: L.TileLayer | null = null;
    let satellite: L.TileLayer | null = null;
    let routeLine: L.Polyline | null = null;
    let accCircle: L.Circle | null = null;
    const start = useZoo.getState();
    const me = L.marker(start.pos, {
      icon: userIcon(start.gpsMode !== "live"),
      zIndexOffset: 1000,
      interactive: false,
      keyboard: false,
    }).addTo(map);

    const feedingIds = () => new Set(upcomingFeedings().slice(0, 4).map((f) => f.placeId));

    const paintPlaces = () => {
      const zoom = map.getZoom();
      const selectedId = useZoo.getState().selectedId;
      const feeds = feedingIds();
      for (const p of PLACES) {
        const show = showPlace(p, zoom, selectedId, feeds);
        let m = placeMarks.get(p.id);
        if (!show) {
          if (m) {
            placesLayer.removeLayer(m);
            placeMarks.delete(p.id);
          }
          continue;
        }
        const selected = p.id === selectedId;
        const feeding = feeds.has(p.id);
        if (!m) {
          if (p.kind === "smoke") {
            m = L.marker([p.lat, p.lon], {
              icon: smokeIcon,
              zIndexOffset: 250,
              keyboard: false,
            });
          } else {
            m = L.circleMarker([p.lat, p.lon], {
              radius: selected ? 9 : 6,
              color: "#fffcf6",
              weight: 2,
              fillColor: pinFill(p, selected, feeding),
              fillOpacity: 1,
              renderer: canvas,
              bubblingMouseEvents: false,
            });
          }
          m.on("click", () => useZoo.getState().select(p.id));
          m.addTo(placesLayer);
          placeMarks.set(p.id, m);
        } else if (m instanceof L.CircleMarker) {
          m.setStyle({
            radius: selected ? 9 : 6,
            fillColor: pinFill(p, selected, feeding),
          });
          if (!placesLayer.hasLayer(m)) m.addTo(placesLayer);
        } else if (!placesLayer.hasLayer(m)) {
          m.addTo(placesLayer);
        }
      }
    };

    const setTiles = (style: "streets" | "satellite") => {
      if (style === "satellite") {
        if (streets) {
          map.removeLayer(streets);
          streets = null;
        }
        if (!satellite) {
          satellite = L.tileLayer(SAT, {
            attribution: "Tiles &copy; Esri",
            maxNativeZoom: 19,
            keepBuffer: 4,
            updateWhenZooming: false,
            updateWhenIdle: true,
          }).addTo(map);
        } else if (!map.hasLayer(satellite)) {
          satellite.addTo(map);
        }
        map.setMaxZoom(19);
      } else {
        if (satellite) {
          map.removeLayer(satellite);
          satellite = null;
        }
        if (!streets) {
          streets = new (LocalFirst as unknown as typeof L.TileLayer)("", {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            maxNativeZoom: 19,
            keepBuffer: 4,
            updateWhenZooming: false,
            updateWhenIdle: true,
          }).addTo(map);
        } else if (!map.hasLayer(streets)) {
          streets.addTo(map);
        }
        map.setMaxZoom(18);
      }
    };

    const setRoute = (path: [number, number][] | null) => {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }
      if (path && path.length > 1) {
        routeLine = L.polyline(path, {
          color: "#c45c26",
          weight: 5,
          opacity: 0.92,
          lineJoin: "round",
          renderer: canvas,
          interactive: false,
        }).addTo(map);
      }
    };

    setTiles(start.mapStyle);
    setRoute(start.route?.path ?? null);
    paintPlaces();

    map.on("zoomend", paintPlaces);
    map.on("dragstart", () => useZoo.getState().setFollow(false));
    map.on("click", (e: L.LeafletMouseEvent) => {
      const s = useZoo.getState();
      if (s.gpsMode === "pin" || s.gpsMode === "demo") {
        s.setPos([e.latlng.lat, e.latlng.lng], 12, "pin");
      }
    });

    const bump = () => map.invalidateSize({ animate: false });
    const t1 = window.setTimeout(bump, 50);
    const t2 = window.setTimeout(bump, 320);
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(bump);
    });
    ro.observe(el);

    const unsubPos = useZoo.subscribe(
      (s) => s.pos,
      (pos) => {
        me.setLatLng(pos);
        const s = useZoo.getState();
        if (s.follow) map.panTo(pos, { animate: false, duration: 0 });
        if (accCircle) {
          if (s.accuracy && s.accuracy < 80) accCircle.setLatLng(pos).setRadius(s.accuracy);
          else {
            map.removeLayer(accCircle);
            accCircle = null;
          }
        } else if (s.accuracy && s.accuracy < 80) {
          accCircle = L.circle(pos, {
            radius: s.accuracy,
            color: "#c45c26",
            weight: 1,
            fillOpacity: 0.08,
            opacity: 0.25,
            renderer: canvas,
            interactive: false,
          }).addTo(map);
        }
      },
    );
    const unsubGps = useZoo.subscribe(
      (s) => s.gpsMode,
      (mode) => me.setIcon(userIcon(mode !== "live")),
    );
    const unsubSel = useZoo.subscribe(
      (s) => s.selectedId,
      (id) => {
        paintPlaces();
        const s = useZoo.getState();
        if (!id || s.follow) return;
        const p = PLACE_BY_ID[id];
        if (p) map.panTo([p.lat, p.lon], { animate: true });
      },
    );
    const unsubRoute = useZoo.subscribe(
      (s) => s.route,
      (route) => {
        setRoute(route?.path ?? null);
        if (route && route.path.length > 1) {
          map.fitBounds(L.latLngBounds(route.path).pad(0.18), { animate: true, maxZoom: 18 });
        }
      },
    );
    const unsubStyle = useZoo.subscribe(
      (s) => s.mapStyle,
      (style) => setTiles(style),
    );

    setReady(true);

    return () => {
      unsubPos();
      unsubGps();
      unsubSel();
      unsubRoute();
      unsubStyle();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="h-full w-full" />
      {ready ? (
        <div className="absolute bottom-4 left-3 z-[500] flex flex-col gap-2">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md bg-surface text-lg font-semibold shadow-card"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md bg-surface text-lg font-semibold shadow-card"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      ) : null}
    </div>
  );
}
