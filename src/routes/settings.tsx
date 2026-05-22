import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useProfile, PANTRY_OPTIONS } from "@/lib/store";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();

  const togglePantry = (item: string) =>
    update((p) => ({
      ...p,
      pantry: p.pantry.includes(item) ? p.pantry.filter((i) => i !== item) : [...p.pantry, item],
    }));

  const reset = () => {
    if (confirm("Clear everything and start over?")) {
      localStorage.removeItem("sprout_profile_v1");
      navigate({ to: "/onboarding" });
      setTimeout(() => location.reload(), 50);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-12 flex items-center">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      <section className="px-6 pt-4">
        <h1 className="text-3xl font-display font-semibold">Settings</h1>
      </section>

      <section className="px-6 mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Your kids</h2>
        <div className="space-y-2">
          {profile.children.map((c) => (
            <div key={c.id} className="rounded-2xl bg-cream border border-border px-4 py-3">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.age} {c.age === 1 ? "year" : "years"} old</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Pantry</h2>
        <div className="flex flex-wrap gap-2">
          {PANTRY_OPTIONS.map((item) => {
            const on = profile.pantry.includes(item);
            return (
              <button
                key={item}
                onClick={() => togglePantry(item)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {on && <Check className="w-3.5 h-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-6 mt-10">
        <button
          onClick={reset}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive"
        >
          <RotateCcw className="w-4 h-4" /> Reset everything
        </button>
      </section>
    </main>
  );
}
