import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile } from "@/lib/store";
import { pickActivity } from "@/lib/activities";
import { ArrowLeft, Battery, BatteryMedium, BatteryFull, Clock, Home, Trees, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/right-now")({
  component: RightNow,
});

type Energy = "low" | "medium" | "high";
type Time = 10 | 30 | 60;
type Loc = "inside" | "outside";

function RightNow() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [time, setTime] = useState<Time | null>(null);
  const [loc, setLoc] = useState<Loc | null>(null);

  const onPick = <T,>(setter: (v: T) => void, v: T) => {
    setter(v);
    setTimeout(() => {
      if (step < 2) setStep((s) => s + 1);
      else finish(v as unknown as Loc);
    }, 180);
  };

  const finish = (finalLoc: Loc) => {
    const pick = pickActivity({
      energy: energy!,
      time: time!,
      location: finalLoc,
      ages: profile.children.map((c) => c.age),
      pantry: profile.pantry,
    });
    if (pick) navigate({ to: "/activity/$id", params: { id: pick.id } });
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="px-6 pt-12 flex items-center justify-between">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
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
          <Question title="Inside or outside?" subtitle="">
            <Choice icon={<Home className="w-6 h-6" />} label="Inside" hint="Living room or kitchen" onClick={() => onPick(setLoc, "inside")} />
            <Choice icon={<Trees className="w-6 h-6" />} label="Outside" hint="Yard, balcony, park" onClick={() => onPick(setLoc, "outside")} />
          </Question>
        )}
      </section>
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
