import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ACTIVITIES, missingItems } from "@/lib/activities";
import { useProfile } from "@/lib/store";
import { ArrowLeft, Check, ShoppingBag, Clock, Users, CalendarPlus, RefreshCw, Bookmark } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const activity = ACTIVITIES.find((a) => a.id === id);
  const [added, setAdded] = useState<"saturday" | "sunday" | null>(null);

  if (!activity) {
    return (
      <main className="min-h-screen bg-background p-6 pt-16">
        <p className="text-muted-foreground">Couldn't find that one.</p>
        <Link to="/" className="text-primary underline mt-4 inline-block">Back home</Link>
      </main>
    );
  }

  const missing = missingItems(activity, profile.pantry);
  const have = activity.needs.filter((n) => !missing.includes(n));
  const isSaved = (profile.saved ?? []).includes(activity.id);

  const toggleSave = () => {
    update((p) => ({
      ...p,
      saved: isSaved
        ? (p.saved ?? []).filter((id) => id !== activity.id)
        : [...(p.saved ?? []), activity.id],
    }));
  };

  const addToDay = (day: "saturday" | "sunday") => {
    update((p) => ({
      ...p,
      weekend: {
        ...p.weekend,
        [day]: Array.from(new Set([...p.weekend[day], activity.id])),
      },
    }));
    setAdded(day);
    setTimeout(() => setAdded(null), 1600);
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 flex items-center justify-between">
        <button onClick={() => navigate({ to: "/" })} className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSave}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={isSaved ? "Remove bookmark" : "Save activity"}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
          <Link to="/right-now" className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Try another
          </Link>
        </div>
      </header>

      <section className="px-6 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-sage/30 px-3 py-1 text-xs font-medium text-sage-foreground">
          <Clock className="w-3 h-3" /> {activity.time} min · {activity.energy} energy · {activity.location}
        </div>
        <h1 className="text-3xl font-display font-semibold leading-tight mt-4">
          {activity.title}
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{activity.blurb}</p>
      </section>

      <section className="px-6 mt-8">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> What you'll need
        </h2>
        <ul className="mt-3 space-y-2">
          {have.map((n) => (
            <li key={n} className="flex items-center gap-3 rounded-xl bg-cream border border-border px-4 py-3 text-sm">
              <Check className="w-4 h-4 text-sage-foreground" />
              <span className="flex-1">{n}</span>
              <span className="text-xs text-muted-foreground">in your pantry</span>
            </li>
          ))}
          {missing.map((n) => (
            <li key={n} className="flex items-center gap-3 rounded-xl bg-card border border-dashed border-primary/40 px-4 py-3 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-primary/40" />
              <span className="flex-1">{n}</span>
              <span className="text-xs text-primary font-medium">grab this</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 mt-8">
        <h2 className="font-display text-lg font-semibold">How to do it</h2>
        <ol className="mt-3 space-y-3">
          {activity.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed pt-0.5">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      {profile.children.length >= 2 && (
        <section className="px-6 mt-8">
          <div className="rounded-2xl bg-sage/25 border border-sage/40 p-5">
            <h2 className="font-display text-base font-semibold flex items-center gap-2 text-sage-foreground">
              <Users className="w-4 h-4" /> Sibling mode
            </h2>
            <p className="text-sm mt-2 leading-relaxed text-sage-foreground/90">
              {activity.siblingTip}
            </p>
          </div>
        </section>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <CalendarPlus className="w-3 h-3" /> Save for the weekend
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => addToDay("saturday")}
              className="flex-1 rounded-full py-3 text-sm font-semibold bg-primary text-primary-foreground"
            >
              {added === "saturday" ? "Added ✓" : "Saturday"}
            </button>
            <button
              onClick={() => addToDay("sunday")}
              className="flex-1 rounded-full py-3 text-sm font-semibold bg-primary text-primary-foreground"
            >
              {added === "sunday" ? "Added ✓" : "Sunday"}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
