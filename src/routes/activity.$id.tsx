import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ACTIVITIES } from "@/lib/activities";
import { generateActivity, getCachedActivity, cacheActivity, getRecentTitles, addRecentTitle, getLastInputs } from "@/lib/generate-activity";
import { useProfile } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

// ── Spark design tokens ───────────────────────────────────────────────
const T = {
  cream:     '#F7EFDF',
  creamDeep: '#ECDFC6',
  paper:     '#FCF8EE',
  ink:       '#3A332C',
  ink2:      '#756758',
  ink3:      '#A89E91',
  terra:     '#C84A3A',
  terraDeep: '#A33828',
  mustard:   '#F5E0AB',
  sage:      '#8FAEC4',
  plum:      '#8FAEC4',
  border:    'rgba(58,51,44,0.10)',
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  body:    '"Geist", "Inter Tight", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
} as const;

function SparkGlyph({ size = 24, color = T.ink, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d="M50 0 C52 32 68 48 100 50 C68 52 52 68 50 100 C48 68 32 52 0 50 C32 48 48 32 50 0 Z" fill={color} />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22">
      <path
        d="M11 19 C3 13 1 9 4 6 C6 4 9 5 11 8 C13 5 16 4 18 6 C21 9 19 13 11 19Z"
        fill={filled ? T.terra : 'none'}
        stroke={filled ? T.terra : T.ink3}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 4L6 9L11 14" stroke={T.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CircleBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 999,
      background: 'rgba(58,51,44,0.06)', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {children}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────
function ActivityDetail() {
  const { id } = Route.useParams();
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const activity = ACTIVITIES.find((a) => a.id === id) ?? getCachedActivity(id);
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
      <main style={{ minHeight: '100svh', background: T.cream, padding: '64px 24px 24px' }}>
        <p style={{ fontFamily: T.body, color: T.ink3 }}>Couldn't find that one.</p>
        <a href="/" style={{ color: T.terra, fontFamily: T.body, marginTop: 16, display: 'inline-block' }}>Back home</a>
      </main>
    );
  }

  const isSaved = (profile.saved ?? []).includes(activity.id);

  const toggleSave = () => {
    update((p) => ({
      ...p,
      saved: isSaved
        ? (p.saved ?? []).filter((sid) => sid !== activity.id)
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

  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 128 }}>
      {/* Header */}
      <header style={{ padding: '48px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CircleBtn onClick={() => navigate({ to: "/" })}>
          <BackArrow />
        </CircleBtn>
        <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3 }}>
          your spark
        </span>
        <div style={{ width: 36 }} />
      </header>

      {/* Hero block */}
      <div style={{ margin: '16px 22px 0', position: 'relative', height: 220, borderRadius: 28, overflow: 'hidden', background: T.terra }}>
        {/* Mustard sun */}
        <div style={{ position: 'absolute', top: -40, left: -50, width: 160, height: 160, borderRadius: '50%', background: T.mustard }}/>
        {/* Plum bottom-right */}
        <div style={{ position: 'absolute', bottom: -60, right: -30, width: 180, height: 180, borderRadius: '50%', background: T.plum }}/>
        {/* Spark glyph */}
        <SparkGlyph size={52} color="rgba(255,251,243,0.85)" style={{ position: 'absolute', top: 22, right: 22 }}/>
        {/* Wavy line decoration */}
        <svg width="220" height="50" viewBox="0 0 220 50" style={{ position: 'absolute', top: 120, left: 22 }}>
          <path d="M0 25 Q 27 0, 55 25 T 110 25 T 165 25 T 220 25" stroke="rgba(255,251,243,0.4)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
        {/* Meta strip */}
        <div style={{
          position: 'absolute', bottom: 18, left: 24, right: 24,
          fontFamily: T.mono, fontSize: 10, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(255,251,243,0.75)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{activity.time} min</span>
          <span>{activity.energy} energy</span>
          <span>{activity.location}</span>
        </div>
      </div>

      {/* Activity title */}
      <div style={{ padding: '20px 24px 0' }}>
        <h1 style={{
          fontFamily: T.display, fontSize: 36, lineHeight: 0.92,
          fontWeight: 700, letterSpacing: '-0.04em', color: T.ink, margin: 0,
        }}>
          {activity.title}.
        </h1>
        <p style={{ fontFamily: T.body, fontSize: 15, color: T.ink2, marginTop: 12, lineHeight: 1.5 }}>
          {activity.blurb}
        </p>
      </div>

      {/* Materials */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3, marginBottom: 10 }}>
          You'll need
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {activity.needs.map((n, i) => (
            <span key={n} style={{
              padding: '6px 12px', borderRadius: 999,
              background: i === 0 ? 'rgba(200,74,58,0.12)' : i === 1 ? 'rgba(58,51,44,0.06)' : 'transparent',
              border: i >= 2 ? `1px solid ${T.border}` : 'none',
              color: i === 0 ? T.terraDeep : T.ink2,
              fontFamily: T.body, fontSize: 13, fontWeight: 500,
            }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3, marginBottom: 20 }}>
          How to do it
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activity.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                fontFamily: T.display, fontSize: 32, fontWeight: 700,
                color: T.terra, lineHeight: 1, letterSpacing: '-0.03em',
                flexShrink: 0, minWidth: 28,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, paddingTop: 5 }}>
                <div style={{
                  fontFamily: T.display, fontSize: 17, fontWeight: 600,
                  color: T.ink, letterSpacing: '-0.015em', lineHeight: 1.2,
                }}>
                  {s}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sibling tip */}
      {profile.children.length >= 2 && activity.siblingTip && (
        <div style={{ margin: '28px 24px 0', padding: 18, borderRadius: 22, background: 'rgba(143,174,196,0.18)', border: '1px solid rgba(143,174,196,0.3)' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink2, marginBottom: 6 }}>
            Sibling mode
          </div>
          <p style={{ fontFamily: T.body, fontSize: 14, color: T.ink, lineHeight: 1.5, margin: 0 }}>
            {activity.siblingTip}
          </p>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        padding: '16px 22px 48px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <button
          onClick={markDone}
          style={{
            width: '100%', padding: '18px 22px', borderRadius: 999,
            background: doneFlash ? T.sage : T.ink,
            color: T.paper,
            fontFamily: T.display, fontWeight: 600, fontSize: 18,
            letterSpacing: '-0.01em', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background 0.3s',
            boxShadow: '0 8px 20px rgba(58,51,44,0.25)',
          }}
        >
          <span>{doneFlash ? "Logged ✓" : "Got it"}</span>
          {!doneFlash && <span style={{ fontSize: 22 }}>→</span>}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={tryAnother}
            disabled={regenerating}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 999,
              background: T.paper, color: T.ink,
              border: `1px solid ${T.border}`,
              fontFamily: T.body, fontWeight: 500, fontSize: 14,
              cursor: 'pointer', opacity: regenerating ? 0.5 : 1,
            }}
          >
            {regenerating ? 'Finding…' : '↻ Spin again'}
          </button>
        </div>
      </footer>
    </main>
  );
}
