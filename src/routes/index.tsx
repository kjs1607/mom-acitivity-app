import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { ACTIVITIES } from "@/lib/activities";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

// ── Spark design tokens ───────────────────────────────────────────────
const T = {
  cream:   '#FBF4EA',
  paper:   '#FFFBF3',
  ink:     '#2B1810',
  ink2:    '#5C463A',
  ink3:    '#8B7567',
  terra:   '#C4654A',
  mustard: '#E8A33A',
  sage:    '#7A8E6D',
  border:  'rgba(43,24,16,0.10)',
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  body:    '"Inter Tight", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
} as const;

function SparkGlyph({ size = 24, color = T.ink, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d="M50 0 C52 32 68 48 100 50 C68 52 52 68 50 100 C48 68 32 52 0 50 C32 48 48 32 50 0 Z" fill={color} />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke={T.ink3} strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" stroke={T.ink3} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────
function Index() {
  const { profile, ready } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !profile.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [ready, profile.onboarded, navigate]);

  if (!ready || !profile.onboarded) {
    return <div style={{ minHeight: '100svh', background: T.cream }} />;
  }

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const firstName = profile.children[0]?.name ?? null;

  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 80 }}>
      {/* Header */}
      <header style={{ padding: '52px 24px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3 }}>
            {greet}
          </div>
          <h1 style={{
            fontFamily: T.display, fontSize: 34, lineHeight: 0.95,
            fontWeight: 700, letterSpacing: '-0.035em', color: T.ink,
            margin: '8px 0 0', maxWidth: 280,
          }}>
            {firstName ? `What's ${firstName} up for?` : "What are they up for?"}
          </h1>
        </div>
        <Link to="/settings" style={{ display: 'flex' }}>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(43,24,16,0.06)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 4,
          }}>
            <SettingsIcon />
          </button>
        </Link>
      </header>

      {/* Right Now hero card */}
      <section style={{ padding: '0 22px' }}>
        <Link
          to="/right-now"
          style={{
            display: 'block', borderRadius: 28,
            background: T.terra, overflow: 'hidden',
            position: 'relative', padding: '28px 26px 28px',
            textDecoration: 'none',
            minHeight: 200,
          }}
        >
          {/* Mustard sun disk */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: T.mustard, opacity: 0.9 }}/>
          {/* Sage half-moon bottom-left */}
          <div style={{ position: 'absolute', bottom: -50, left: -40, width: 140, height: 140, borderRadius: '50%', background: T.sage, opacity: 0.7 }}/>
          {/* Spark glyph bottom-right */}
          <SparkGlyph size={56} color="rgba(255,251,243,0.2)" style={{ position: 'absolute', bottom: 22, right: 24 }}/>

          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,251,243,0.7)', marginBottom: 14 }}>
              right now
            </div>
            <h2 style={{
              fontFamily: T.display, fontSize: 40, fontWeight: 700,
              color: '#FFFBF3', margin: 0, lineHeight: 0.92, letterSpacing: '-0.04em',
            }}>
              Find something<br/>to do now.
            </h2>
            <p style={{ fontFamily: T.body, fontSize: 14, color: 'rgba(255,251,243,0.8)', marginTop: 14, lineHeight: 1.4 }}>
              Four taps. One activity you can start<br/>in the next 5 minutes.
            </p>
            <div style={{
              marginTop: 22,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 22px', borderRadius: 999,
              background: 'rgba(255,251,243,0.15)',
              color: '#FFFBF3',
              fontFamily: T.display, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
            }}>
              Let's go <span style={{ fontSize: 20 }}>→</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Saved activities */}
      {(profile.saved ?? []).length > 0 && (
        <section style={{ padding: '36px 24px 0' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3, marginBottom: 12 }}>
            Saved
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(profile.saved ?? []).map((id) => {
              const activity = ACTIVITIES.find((a) => a.id === id);
              if (!activity) return null;
              return (
                <Link
                  key={id}
                  to="/activity/$id"
                  params={{ id }}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '12px 14px', borderRadius: 16,
                    background: T.paper, border: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F2E4CB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SparkGlyph size={16} color={T.terra}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.display, fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>{activity.title}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                        {activity.time} min · {activity.energy} energy
                      </div>
                    </div>
                    <span style={{ color: T.ink3, fontSize: 18 }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* History */}
      {(profile.completed ?? []).length > 0 && (
        <section style={{ padding: '32px 24px 0' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3, marginBottom: 12 }}>
            Done before
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(profile.completed ?? []).slice(0, 5).map((entry, i) => {
              const activity = ACTIVITIES.find((a) => a.id === entry.id);
              if (!activity) return null;
              const label = new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <Link
                  key={i}
                  to="/activity/$id"
                  params={{ id: entry.id }}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '12px 14px', borderRadius: 16,
                    background: T.paper, border: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(122,142,109,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SparkGlyph size={16} color={T.sage}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.display, fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>{activity.title}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
                    </div>
                    <span style={{ color: T.ink3, fontSize: 18 }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
