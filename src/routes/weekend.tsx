import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { ACTIVITIES, missingItems } from "@/lib/activities";
import { ArrowLeft, Plus, X, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/weekend")({
  component: Weekend,
});

function Weekend() {
  const { profile, update } = useProfile();
  const [picker, setPicker] = useState<"saturday" | "sunday" | null>(null);

  const findA = (id: string) => ACTIVITIES.find((a) => a.id === id);

  const groceries = useMemo(() => {
    const ids = [...profile.weekend.saturday, ...profile.weekend.sunday];
    const items = new Set<string>();
    ids.forEach((id) => {
      const a = findA(id);
      if (a) missingItems(a, profile.pantry).forEach((m) => items.add(m));
    });
    return [...items];
  }, [profile.weekend, profile.pantry]);

  const remove = (day: "saturday" | "sunday", id: string) => {
    update((p) => ({
      ...p,
      weekend: { ...p.weekend, [day]: p.weekend[day].filter((x) => x !== id) },
    }));
  };

  const add = (day: "saturday" | "sunday", id: string) => {
    update((p) => ({
      ...p,
      weekend: { ...p.weekend, [day]: Array.from(new Set([...p.weekend[day], id])) },
    }));
    setPicker(null);
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="px-6 pt-12 flex items-center justify-between">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      <section className="px-6 pt-6">
        <h1 className="text-3xl font-display font-semibold leading-tight">Your weekend.</h1>
        <p className="text-muted-foreground mt-2">Slot a few ideas. We'll handle the list.</p>
      </section>

      <section className="px-6 mt-8 space-y-6">
        {(["saturday", "sunday"] as const).map((day) => (
          <div key={day}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-xl font-semibold capitalize">{day}</h2>
              <span className="text-xs text-muted-foreground">{profile.weekend[day].length}/3 slotted</span>
            </div>
            <div className="space-y-2">
              {profile.weekend[day].map((id) => {
                const a = findA(id);
                if (!a) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-2xl bg-cream border border-border p-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-clay flex items-center justify-center font-display font-semibold text-sm">
                      {a.time}m
                    </div>
                    <Link to="/activity/$id" params={{ id: a.id }} className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{a.energy} energy · {a.location}</p>
                    </Link>
                    <button onClick={() => remove(day, id)} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {profile.weekend[day].length < 3 && (
                <button
                  onClick={() => setPicker(day)}
                  className="w-full rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add an activity
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {groceries.length > 0 && (
        <section className="px-6 mt-10">
          <div className="rounded-3xl bg-clay text-clay-foreground p-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Friday grocery run
            </h2>
            <p className="text-sm opacity-80 mt-1">Everything you don't already have.</p>
            <ul className="mt-4 space-y-1.5">
              {groceries.map((g) => (
                <li key={g} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {picker && (
        <div
          className="fixed inset-0 bg-foreground/40 z-50 flex items-end animate-in fade-in"
          onClick={() => setPicker(null)}
        >
          <div
            className="bg-background rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold capitalize">Add to {picker}</h3>
            <div className="mt-4 space-y-2">
              {ACTIVITIES.filter((a) => !profile.weekend[picker].includes(a.id)).map((a) => (
                <button
                  key={a.id}
                  onClick={() => add(picker, a.id)}
                  className="w-full text-left rounded-2xl border border-border bg-card hover:bg-cream p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/15 text-clay flex items-center justify-center font-display font-semibold text-sm">
                    {a.time}m
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.energy} · {a.location}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
