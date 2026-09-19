import { useEffect, useState } from "react";
import { warsawNow } from "@/data/feedings";

export function useNow(ms = 20000) {
  const [now, setNow] = useState(() => warsawNow());
  useEffect(() => {
    const id = window.setInterval(() => setNow(warsawNow()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
