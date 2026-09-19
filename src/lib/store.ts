import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { MAIN_GATE } from "@/data/places";
import { type Lang } from "@/lib/i18n";
import { alongPath, walkRoute, walkTour, type WalkRoute } from "@/lib/geo";

export type Tab = "map" | "feedings" | "tours" | "plan";
export type GpsMode = "demo" | "live" | "pin";
export type MapStyle = "streets" | "satellite";

type NavState = {
  lang: Lang;
  tab: Tab;
  query: string;
  selectedId: string | null;
  favorites: string[];
  visited: string[];
  pos: [number, number];
  accuracy: number | null;
  gpsMode: GpsMode;
  follow: boolean;
  mapStyle: MapStyle;
  simulating: boolean;
  simMeters: number;
  route: (WalkRoute & { toId: string; fromGate: boolean }) | null;
  toast: string | null;
  setLang: (lang: Lang) => void;
  setTab: (tab: Tab) => void;
  setQuery: (q: string) => void;
  select: (id: string | null) => void;
  toggleFav: (id: string) => void;
  toggleVisited: (id: string) => void;
  setPos: (pos: [number, number], accuracy?: number | null, mode?: GpsMode) => void;
  setFollow: (v: boolean) => void;
  setMapStyle: (s: MapStyle) => void;
  setToast: (msg: string | null) => void;
  startRoute: (toId: string, to: [number, number], fromGate?: boolean) => void;
  startMulti: (ids: string[], points: [number, number][]) => void;
  stopRoute: () => void;
  setSimulating: (v: boolean) => void;
  tickSim: (stepM: number) => void;
};

export const useZoo = create<NavState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        lang: "pl",
        tab: "map",
        query: "",
        selectedId: null,
        favorites: [],
        visited: [],
        pos: MAIN_GATE,
        accuracy: null,
        gpsMode: "demo",
        follow: true,
        mapStyle: "streets",
        simulating: false,
        simMeters: 0,
        route: null,
        toast: null,
        setLang: (lang) => set({ lang }),
        setTab: (tab) => set({ tab }),
        setQuery: (query) => set({ query }),
        select: (selectedId) => set({ selectedId }),
        toggleFav: (id) =>
          set((s) => ({
            favorites: s.favorites.includes(id)
              ? s.favorites.filter((x) => x !== id)
              : [...s.favorites, id],
          })),
        toggleVisited: (id) =>
          set((s) => ({
            visited: s.visited.includes(id)
              ? s.visited.filter((x) => x !== id)
              : [...s.visited, id],
          })),
        setPos: (pos, accuracy = null, mode) =>
          set((s) => ({
            pos,
            accuracy: accuracy ?? s.accuracy,
            gpsMode: mode ?? s.gpsMode,
          })),
        setFollow: (follow) => set({ follow }),
        setMapStyle: (mapStyle) => set({ mapStyle }),
        setToast: (toast) => set({ toast }),
        startRoute: (toId, to, fromGate = false) => {
          const from = fromGate ? MAIN_GATE : get().pos;
          const r = walkRoute(from, to);
          set({
            route: { ...r, toId, fromGate },
            selectedId: toId,
            tab: "map",
            follow: true,
            simulating: false,
            simMeters: 0,
          });
        },
        startMulti: (ids, points) => {
          const from = get().pos;
          const r = walkTour([from, ...points]);
          set({
            route: { ...r, toId: ids[ids.length - 1] ?? "tour", fromGate: false },
            selectedId: ids[0] ?? null,
            tab: "map",
            follow: true,
            simulating: false,
            simMeters: 0,
          });
        },
        stopRoute: () => set({ route: null, simulating: false, simMeters: 0 }),
        setSimulating: (simulating) =>
          set({ simulating, simMeters: simulating ? 0 : get().simMeters }),
        tickSim: (stepM) => {
          const { route, simMeters } = get();
          if (!route) {
            set({ simulating: false });
            return;
          }
          const next = Math.min(simMeters + stepM, route.distance);
          const pos = alongPath(route.path, next);
          set({
            simMeters: next,
            pos,
            accuracy: 8,
            gpsMode: "demo",
            follow: true,
            simulating: next < route.distance,
          });
        },
      }),
      {
        name: "zoo-wroclaw-nav",
        partialize: (s) => ({
          lang: s.lang,
          favorites: s.favorites,
          visited: s.visited,
          mapStyle: s.mapStyle,
        }),
      },
    ),
  ),
);
