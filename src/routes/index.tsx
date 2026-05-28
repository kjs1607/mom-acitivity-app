import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

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

const KID_EMOJIS = ['🦄','🦖','🐬','🦊','🐼','🦁','🐸','🚀','⭐','🌈'];

function SparkGlyph({ size = 24, color = T.ink, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d="M50 0 C52 32 68 48 100 50 C68 52 52 68 50 100 C48 68 32 52 0 50 C32 48 48 32 50 0 Z" fill={color} />
    </svg>
  );
}

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
  const greet = hour < 12 ? "Good morning." : hour < 17 ? "Hi there." : "Good evening.";

  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 48, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: 36, lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, margin: 0 }}>
            {greet}
          </h1>
          <p style={{ fontFamily: T.body, fontSize: 14, color: T.ink3, margin: '4px 0 0' }}>
            What are we doing today?
          </p>
        </div>
        <Link to="/settings" style={{ textDecoration: 'none' }}>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(43,24,16,0.06)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 6,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" stroke={T.ink3} strokeWidth="1.5"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" stroke={T.ink3} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </Link>
      </div>

      {/* Primary CTA card */}
      <div style={{ padding: '0 24px' }}>
        <Link to="/right-now" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            width: '100%', textAlign: 'left', position: 'relative', overflow: 'hidden',
            padding: '26px 24px 22px', borderRadius: 26,
            background: T.terra, color: T.cream,
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: '0 8px 24px rgba(43,24,16,0.12)',
            boxSizing: 'border-box',
          }}>
            {/* Sparkle deco */}
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ position: 'absolute', right: -8, top: -8, color: 'rgba(255,251,243,0.18)' }}>
              <path d="M48 12 L52 36 L76 40 L52 44 L48 68 L44 44 L20 40 L44 36 Z" fill="currentColor"/>
              <path d="M78 56 L80 66 L90 68 L80 70 L78 80 L76 70 L66 68 L76 66 Z" fill="currentColor"/>
            </svg>
            <p style={{ fontFamily: T.display, fontSize: 28, lineHeight: 1.05, fontWeight: 600, letterSpacing: '-0.02em', margin: 0, maxWidth: 260 }}>
              Find me one good idea
            </p>
            <p style={{ fontFamily: T.body, fontSize: 13.5, opacity: 0.9, margin: 0, maxWidth: 240, lineHeight: 1.4 }}>
              Right now. Based on your energy, time, and what's in the house.
            </p>
            <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.body, fontSize: 14, fontWeight: 600 }}>
              Start <span style={{ fontSize: 16 }}>›</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's crew */}
      {profile.children.length > 0 && (
        <div style={{ padding: '28px 24px 0' }}>
          <h2 style={{ fontFamily: T.display, fontSize: 19, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>
            Today's crew
          </h2>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {profile.children.map((child, i) => (
              <div key={child.id} style={{
                padding: 12, borderRadius: 18,
                background: T.paper, border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: T.cream,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {KID_EMOJIS[i % KID_EMOJIS.length]}
                </div>
                <p style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.ink, margin: '6px 0 0' }}>{child.name}</p>
                <p style={{ fontFamily: T.body, fontSize: 11, color: T.ink3, margin: 0 }}>{child.age}y</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p style={{ textAlign: 'center', fontFamily: T.body, fontSize: 12, color: T.ink3, padding: '40px 24px 0', margin: 0 }}>
        Built for parents who'd rather play than scroll.
      </p>
    </main>
  );
}
