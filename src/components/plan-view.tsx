import { PLACES } from "@/data/places";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";
import { useZoo } from "@/lib/store";

export function PlanView() {
  const selectedId = useZoo((s) => s.selectedId);
  const select = useZoo((s) => s.select);

  return (
    <div className="relative h-full overflow-auto bg-bg-warm">
      <div className="relative w-[min(1800px,220%)] md:w-full">
        <img
          src={asset("zoo-plan.jpg")}
          alt="Plan ZOO Wrocław"
          className="block w-full select-none"
          draggable={false}
        />
        {PLACES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={p.names.pl}
            className={cn(
              "plan-hotspot",
              selectedId === p.id && "is-selected",
              p.kind === "smoke" && "is-smoke",
            )}
            style={{ left: `${p.planX}%`, top: `${p.planY}%` }}
            onClick={() => select(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
