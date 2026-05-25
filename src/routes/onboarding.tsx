import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, type Child } from "@/lib/store";
import { Plus, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [children, setChildren] = useState<Child[]>(profile.children.length ? profile.children : []);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");

  const addChild = () => {
    if (!name.trim() || age === "") return;
    setChildren((c) => [...c, { id: crypto.randomUUID(), name: name.trim(), age: Number(age) }]);
    setName(""); setAge("");
  };

  const finish = () => {
    update({ children, onboarded: true });
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-2">
        <div className="flex gap-1.5 mb-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </header>

      {step === 0 && (
        <section className="px-6 animate-in fade-in duration-300">
          <h1 className="text-3xl font-display font-semibold leading-tight">
            Hi. Let's keep this short.
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            No account. No email. Just one quick step so we can hand you the right idea on the right day.
          </p>
          <div className="mt-10 rounded-3xl bg-cream border border-border p-6">
            <p className="font-display text-xl leading-snug">
              You bring the kids.<br/>We bring the idea.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Takes 30 seconds.</p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="px-6 animate-in fade-in duration-300">
          <h1 className="text-2xl font-display font-semibold leading-tight">
            Who are we planning for?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Add each kid. We use ages to match activities.
          </p>

          <div className="mt-6 space-y-2">
            {children.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-cream rounded-2xl px-4 py-3 border border-border">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.age} {c.age === 1 ? "year" : "years"} old</p>
                </div>
                <button
                  onClick={() => setChildren((cs) => cs.filter((x) => x.id !== c.id))}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${c.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-border p-4 bg-card">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="flex-1 bg-background rounded-xl px-4 py-3 text-base border border-border outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(0, Math.min(12, Number(e.target.value))))}
                placeholder="Age"
                type="number"
                inputMode="numeric"
                min={0} max={12}
                className="w-20 bg-background rounded-xl px-3 py-3 text-base border border-border outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={addChild}
              disabled={!name.trim() || age === ""}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-40 rounded-xl py-3 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add child
            </button>
          </div>
        </section>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t border-border px-6 py-4">
        <div className="flex gap-3 max-w-md mx-auto">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full px-5 py-3 text-sm font-medium bg-muted text-foreground"
            >
              Back
            </button>
          )}
          {step < 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-full px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground inline-flex items-center justify-center gap-2"
            >
              Let's go <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                let list = children;
                if (name.trim() && age !== "") {
                  list = [...children, { id: crypto.randomUUID(), name: name.trim(), age: Number(age) }];
                  setChildren(list);
                  setName(""); setAge("");
                }
                if (list.length === 0) return;
                update({ children: list, onboarded: true });
                navigate({ to: "/" });
              }}
              disabled={children.length === 0 && (!name.trim() || age === "")}
              className="flex-1 rounded-full px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Done — let's go <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
