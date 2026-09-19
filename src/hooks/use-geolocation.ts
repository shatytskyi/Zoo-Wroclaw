import { useEffect } from "react";
import { isInsideZoo } from "@/lib/geo";
import { copy } from "@/lib/i18n";
import { useZoo } from "@/lib/store";

export function useGeolocation() {
  const simulating = useZoo((s) => s.simulating);

  useEffect(() => {
    if (simulating) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    let last = 0;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - last < 900) return;
        last = now;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        const s = useZoo.getState();
        if (!isInsideZoo(lat, lon)) {
          if (s.gpsMode !== "pin") s.setToast(copy[s.lang].outside);
          return;
        }
        s.setPos([lat, lon], acc, "live");
      },
      () => {
        const s = useZoo.getState();
        if (s.gpsMode === "demo") s.setToast(copy[s.lang].gpsDenied);
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [simulating]);

  useEffect(() => {
    if (!simulating) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      const s = useZoo.getState();
      if (!s.simulating) return;
      s.tickSim(18 * dt);
      if (useZoo.getState().simulating) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [simulating]);
}
