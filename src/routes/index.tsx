import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { Sparkles, CalendarDays, Settings } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { profile, ready } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !profile.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [ready, profile.onboarded, navigate]);

  if (!ready || !profile.onboarded) {
    return <div className="min-h-screen bg-background" />;
  }

  const firstName = profile.children[0]?.name?.split(" ")[0] || "friend";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-12 pb-6 flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{greet},</p>
          <h1 className="text-3xl font-display font-semibold text-foreground mt-1">
            {profile.children.map((c) => c.name.split(" ")[0]).join(" & ") || firstName}.
          </h1>
        </div>
        <Link to="/settings" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="Settings">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      <section className="px-6 space-y-4">
        <Link
          to="/right-now"
          className="block rounded-3xl bg-primary text-primary-foreground p-6 shadow-sm active:scale-[0.99] transition-transform"
        >
          <Sparkles className="w-7 h-7 mb-4 opacity-90" />
          <h2 className="font-display text-2xl font-semibold leading-tight">Right Now</h2>
          <p className="text-sm opacity-90 mt-2 leading-snug">
            Three taps. One idea you can start in the next 5 minutes.
          </p>
          <div className="mt-5 inline-flex items-center text-sm font-medium bg-white/15 rounded-full px-4 py-2">
            I need something now →
          </div>
        </Link>

        <Link
          to="/weekend"
          className="block rounded-3xl bg-sage text-sage-foreground p-6 shadow-sm active:scale-[0.99] transition-transform"
        >
          <CalendarDays className="w-7 h-7 mb-4 opacity-80" />
          <h2 className="font-display text-2xl font-semibold leading-tight">Plan My Weekend</h2>
          <p className="text-sm opacity-80 mt-2 leading-snug">
            Slot a few ideas for Saturday & Sunday. We'll bundle the grocery list.
          </p>
          <div className="mt-5 inline-flex items-center text-sm font-medium bg-white/40 rounded-full px-4 py-2">
            Let's plan ahead →
          </div>
        </Link>
      </section>

      <section className="px-6 mt-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Today's vibe
        </p>
        <div className="mt-3 rounded-2xl bg-cream border border-border p-5">
          <p className="font-display text-lg text-foreground leading-snug">
            "You're already a great parent. You're just looking for one good idea."
          </p>
        </div>
      </section>
    </main>
  );
}
