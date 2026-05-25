import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, PANTRY_CATEGORIES } from "@/lib/store";
import { pickActivity } from "@/lib/activities";
import { generateActivity, cacheActivity, getRecentTitles, addRecentTitle } from "@/lib/generate-activity";
import { ArrowLeft, Battery, BatteryMedium, BatteryFull, Clock, Home, Trees, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/right-now")({
  component: RightNow,
});

type Energy = "low" | "medium" | "high";
type Time = 10 | 30 | 60;
type Loc = "inside" | "outside";

const TOTAL_STEPS = 4;

function RightNow() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [time, setTime] = useState<Time | null>(null);
  const [categories, setCategories] = useState<string[]>(profile.pantry ?? []);
  const [loc, setLoc] = useState<Loc | null>(null);
  const [loading, setLoading] = useState(false);

  const onPick = <T,>(setter: (v: T) => void, v: T) => {
    setter(v);
    setTimeout(() => setStep((s) => s + 1), 180);
  };

  const toggleCategory = (id: string) =>
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const finish = async (finalLoc: Loc) => {
    setLoading(true);
    try {
      const recentTitles = getRecentTitles();
      const activity = await generateActivity({
        data: {
          energy: energy!,
          time: time!,
          location: finalLoc,
          ages: profile.children.map((c) => c.age),
          categories,
          recentTitles,
        },
      });
      cacheActivity(activity);
      addRecentTitle(activity.title);
      navigate({ to: "/activity/$id", params: { id: activity.id } });
    } catch {
      const pick = pickActivity({
        energy: energy!,
        time: time!,
        location: finalLoc,
        ages: profile.children.map((c) => c.age),
        pantry: profile.pantry,
      });
      if (pick) navigate({ to: "/activity/$id", params: { id: pick.id } });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="font-display text-xl font-semibold text-center">Finding the perfect idea…</p>
        <p className="text-sm text-muted-foreground text-center">One moment.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="px-6 pt-12 flex items-center justify-between">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-7 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <div className="w-9" />
      </header>

      <section className="px-6 pt-10">
        {step === 0 && (
          <Question title="What's your energy?" subtitle="Be honest. There's a right idea for every mood.">
            <Choice icon={<Battery className="w-6 h-6" />} label="Low" hint="I'm folding laundry" onClick={() => onPick(setEnergy, "low")} />
            <Choice icon={<BatteryMedium className="w-6 h-6" />} label="Medium" hint="I'm up for setup" onClick={() => onPick(setEnergy, "medium")} />
            <Choice icon={<BatteryFull className="w-6 h-6" />} label="High" hint="Let's get loud" onClick={() => onPick(setEnergy, "high")} />
          </Question>
        )}

        {step === 1 && (
          <Question title="How much time?" subtitle="Counting from right now.">
            <Choice icon={<Clock className="w-6 h-6" />} label="10 minutes" hint="A quick reset" onClick={() => onPick(setTime, 10)} />
            <Choice icon={<Clock className="w-6 h-6" />} label="30 minutes" hint="Real activity" onClick={() => onPick(setTime, 30)} />
            <Choice icon={<Clock className="w-6 h-6" />} label="1 hour +" hint="Settle in" onClick={() => onPick(setTime, 60)} />
          </Question>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-28">
            <h1 className="text-3xl font-display font-semibold leading-tight">What do you have?</h1>
            <p className="text-muted-foreground mt-2">Pick everything that applies.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PANTRY_CATEGORIES.map((cat) => {
                const selected = categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex flex-col items-start gap-1.5 rounded-2xl p-3 border text-left transition-colors active:scale-[0.98] ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-foreground/20"
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <p className="font-display font-semibold text-sm leading-tight">{cat.label}</p>
                    <p className={`text-xs leading-snug ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <Question title="Inside or outside?" subtitle="">
            <Choice icon={<Home className="w-6 h-6" />} label="Inside" hint="Living room or kitchen" onClick={() => { setLoc("inside"); finish("inside"); }} />
            <Choice icon={<Trees className="w-6 h-6" />} label="Outside" hint="Yard, balcony, park" onClick={() => { setLoc("outside"); finish("outside"); }} />
          </Question>
        )}
      </section>

      {step === 2 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
          <button
            onClick={() => setStep(3)}
            className="w-full max-w-md mx-auto flex rounded-full py-3 text-sm font-semibold bg-primary text-primary-foreground items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </main>
  );
}

function Question({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-3xl font-display font-semibold leading-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      <div className="mt-8 space-y-3">{children}</div>
    </div>
  );
}

function Choice({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-2xl bg-card border border-border p-5 text-left hover:border-primary hover:bg-cream transition-colors active:scale-[0.99]"
    >
      <div className="w-12 h-12 rounded-full bg-cream text-clay flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-display text-xl font-semibold leading-none">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
