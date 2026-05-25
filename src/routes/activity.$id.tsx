import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ACTIVITIES } from "@/lib/activities";
import { generateActivity, getCachedActivity, cacheActivity, getRecentTitles, addRecentTitle, getLastInputs } from "@/lib/generate-activity";
import { useProfile } from "@/lib/store";
import { ArrowLeft, ShoppingBag, Clock, Users, CalendarPlus, RefreshCw, Bookmark } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const activity = ACTIVITIES.find((a) => a.id === id) ?? getCachedActivity(id);
  const [added, setAdded] = useState<"saturday" | "sunday" | null>(null);
  const [doneFlash, setDoneFlash] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const tryAnother = async () => {
    const lastInputs = getLastInputs();
    if (!lastInputs) { navigate({ to: "/right-now" }); return; }
    setRegenerating(true);
    try {
      const recentTitles = getRecentTitles();
      const next = await generateActivity({ data: { ...lastInputs, recentTitles } });
      cacheActivity(next);
      addRecentTitle(next.title);
      navigate({ to: "/activity/$id", params: { id: next.id } });
    } catch {
      navigate({ to: "/right-now" });
    } finally {
      setRegenerating(false);
    }
  };

  if (!activity) {
    return (
      <main className="min-h-screen bg-background p-6 pt-16">
        <p className="text-muted-foreground">Couldn't find that one.</p>
        <Link to="/" className="text-primary underline mt-4 inline-block">Back home</Link>
      </main>
    );
  }

  const isSaved = (profile.saved ?? []).includes(activity.id);

  const toggleSave = () => {
    update((p) => ({
      ...p,
      saved: isSaved
        ? (p.saved ?? []).filter((id) => id !== activity.id)
        : [...(p.saved ?? []), activity.id],
    }));
  };

  const markDone = () => {
    update((p) => ({
      ...p,
      completed: [
        { id: activity.id, date: new Date().toISOString() },
        ...(p.completed ?? []),
      ],
    }));
    setDoneFlash(true);
    setTimeout(() => setDoneFlash(false), 1600);
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
    <main className="min-h-screen bg-background pb-56">
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
          <button
            onClick={tryAnother}
            disabled={regenerating}
            className="text-sm text-muted-foreground inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Finding…" : "Try another"}
          </button>
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
          {activity.needs.map((n) => (
            <li key={n} className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
              <span>{n}</span>
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
        <div className="max-w-md mx-auto space-y-2">
          <button
            onClick={markDone}
            className="w-full rounded-full py-3 text-sm font-semibold bg-sage text-sage-foreground transition-colors"
          >
            {doneFlash ? "Logged ✓" : "We did this! ✅"}
          </button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
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
