import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, PANTRY_CATEGORIES } from "@/lib/store";
import { pickActivity } from "@/lib/activities";
import { generateActivity, cacheActivity, getRecentTitles, addRecentTitle, saveLastInputs } from "@/lib/generate-activity";

export const Route = createFileRoute("/right-now")({
  component: RightNow,
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

// ── Types ─────────────────────────────────────────────────────────────
type Energy = "low" | "medium" | "high";
type Time = 10 | 30 | 60;
type Loc = "inside" | "outside";

const TOTAL_STEPS = 4;

// ── Main component ────────────────────────────────────────────────────
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
      saveLastInputs({ energy: energy!, time: time!, location: finalLoc, ages: profile.children.map((c) => c.age), categories });
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

  // ── Loading screen ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '100svh', background: T.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <SparkleCluster color={T.mustard} style={{ position: 'absolute', top: 110, left: 36 }}/>
        <SparkleCluster color={T.terra}   style={{ position: 'absolute', top: 80,  right: 24, transform: 'rotate(15deg)' }}/>
        <SparkleCluster color={T.sage}    style={{ position: 'absolute', bottom: 200, left: 28, transform: 'rotate(-12deg)' }}/>
        <SparkleCluster color={T.mustard} style={{ position: 'absolute', bottom: 240, right: 40 }}/>

        <SparkGlyph
          size={180}
          color={T.terra}
          style={{ filter: 'drop-shadow(0 0 40px rgba(200,74,58,0.4))', animation: 'sparkSpin 2.4s linear infinite' }}
        />

        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,251,243,0.5)' }}>
            sparking…
          </div>
          <div style={{ fontFamily: T.display, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 10, color: T.paper, lineHeight: 1.1, maxWidth: 280, padding: '0 20px' }}>
            Mixing your answers<br/>with 247 ideas
          </div>
        </div>
      </main>
    );
  }

  // ── Quiz shell ──────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ padding: '48px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CircleBtn onClick={() => navigate({ to: "/" })}>
          <BackArrow />
        </CircleBtn>
        <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ink3 }}>
          question {step + 1} of {TOTAL_STEPS}
        </span>
        <div style={{ width: 36 }} />
      </header>

      {/* Progress dots */}
      <div style={{ padding: '10px 24px 0', display: 'flex', gap: 6 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            height: 6,
            width: i <= step ? 22 : 6,
            borderRadius: 999,
            background: i <= step ? T.terra : 'rgba(58,51,44,0.15)',
            transition: 'width 0.25s ease',
          }}/>
        ))}
      </div>

      {/* Step 0 — Energy */}
      {step === 0 && (
        <section style={{ padding: '24px 24px 0' }}>
          <QuizTitle title={<>What's your<br/>energy?</>} subtitle="Be honest. There's a right idea for every mood." />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ChoiceCard
              tone={T.sage}
              icon={<EnergyGlyph level="Low" />}
              label="Low"
              hint="Couch-bound"
              onClick={() => onPick(setEnergy, "low")}
            />
            <ChoiceCard
              tone={T.mustard}
              icon={<EnergyGlyph level="Medium" />}
              label="Medium"
              hint="I'm up for setup"
              onClick={() => onPick(setEnergy, "medium")}
            />
            <ChoiceCard
              tone={T.terra}
              icon={<EnergyGlyph level="High" />}
              label="High"
              hint="Let's get loud"
              onClick={() => onPick(setEnergy, "high")}
            />
          </div>
        </section>
      )}

      {/* Step 1 — Time */}
      {step === 1 && (
        <section style={{ padding: '24px 24px 0' }}>
          <QuizTitle title={<>How much<br/>time?</>} subtitle="Counting from right now." />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ChoiceCard
              tone={T.sage}
              icon={<ClockGlyph mins={10} />}
              label="10 minutes"
              hint="A quick reset"
              onClick={() => onPick(setTime, 10)}
            />
            <ChoiceCard
              tone={T.mustard}
              icon={<ClockGlyph mins={30} />}
              label="30 minutes"
              hint="Real activity"
              onClick={() => onPick(setTime, 30)}
            />
            <ChoiceCard
              tone={T.terra}
              icon={<ClockGlyph mins={60} />}
              label="1 hour +"
              hint="Settle in"
              onClick={() => onPick(setTime, 60)}
            />
          </div>
        </section>
      )}

      {/* Step 2 — Pantry */}
      {step === 2 && (
        <section style={{ padding: '24px 24px 0', paddingBottom: 96 }}>
          <QuizTitle title={<>What do<br/>you have?</>} subtitle="Pick everything that applies." />
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PANTRY_CATEGORIES.map((cat) => {
              const selected = categories.includes(cat.id);
              const tone = PANTRY_TONES[cat.id] ?? T.sage;
              return (
                <PantryCard
                  key={cat.id}
                  emoji={cat.emoji}
                  label={cat.label}
                  desc={cat.description}
                  tone={tone}
                  selected={selected}
                  onClick={() => toggleCategory(cat.id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Step 3 — Location */}
      {step === 3 && (
        <section style={{ padding: '24px 24px 0' }}>
          <QuizTitle title={<>Inside or<br/>outside?</>} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ChoiceCard
              tone={T.mustard}
              icon={<HouseIcon />}
              label="Inside"
              hint="Keep the mess contained"
              onClick={() => { setLoc("inside"); finish("inside"); }}
            />
            <ChoiceCard
              tone={T.sage}
              icon={<TreeIcon />}
              label="Outside"
              hint="Let them go feral"
              onClick={() => { setLoc("outside"); finish("outside"); }}
            />
          </div>
        </section>
      )}

      {/* Step 2 footer — continue button */}
      {step === 2 && (
        <footer style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(251,244,234,0.95)', backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${T.border}`,
          padding: '12px 22px 32px',
        }}>
          <button
            onClick={() => setStep(3)}
            style={{
              width: '100%', padding: '18px 22px', borderRadius: 999,
              background: T.ink, color: T.paper,
              fontFamily: T.display, fontWeight: 600, fontSize: 18,
              letterSpacing: '-0.01em', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(43,24,16,0.3)',
            }}
          >
            <span>Continue</span>
            <span style={{ fontSize: 22 }}>→</span>
          </button>
        </footer>
      )}
    </main>
  );
}

// ── Design tokens for pantry categories ──────────────────────────────
const PANTRY_TONES: Record<string, string> = {
  kitchen:   '#E8A33A', // mustard
  art:       '#C4654A', // terra
  building:  '#7A8E6D', // sage
  outdoor:   '#7A8E6D', // sage
  toys:      '#E8A33A', // mustard
  water:     '#7A8E6D', // sage
  household: '#5E3A4F', // plum
  nothing:   '#C4654A', // terra
};

// ── SVG atoms ─────────────────────────────────────────────────────────

function SparkGlyph({ size = 24, color = T.ink, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d="M50 0 C52 32 68 48 100 50 C68 52 52 68 50 100 C48 68 32 52 0 50 C32 48 48 32 50 0 Z" fill={color} />
    </svg>
  );
}

function SparkleCluster({ color = T.mustard, style }: { color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={88} height={64} viewBox="0 0 88 64" style={style}>
      <path d="M16 0 C17 14 24 21 38 22 C24 23 17 30 16 44 C15 30 8 23 -6 22 C8 21 15 14 16 0 Z" fill={color}/>
      <path d="M70 22 C70.6 30 75 34 83 34.5 C75 35 70.6 39 70 47 C69.4 39 65 35 57 34.5 C65 34 69.4 30 70 22 Z" fill={color} opacity={0.85}/>
      <circle cx="52" cy="8" r="3" fill={color} opacity={0.7}/>
    </svg>
  );
}

function EnergyGlyph({ level }: { level: string }) {
  const filled = level === 'Low' ? 1 : level === 'Medium' ? 2 : 3;
  const bars = [10, 16, 22];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 6, height: h, borderRadius: 2, background: T.ink, opacity: i < filled ? 1 : 0.22 }}/>
      ))}
    </div>
  );
}

function ClockGlyph({ mins }: { mins: number }) {
  const angle = mins === 10 ? -60 : mins === 30 ? 90 : 180;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="11" fill="none" stroke={T.ink} strokeWidth="2"/>
      <line x1="13" y1="13" x2="13" y2="5" stroke={T.ink} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="13" y1="13" x2="13" y2="7" stroke={T.ink} strokeWidth="2.2" strokeLinecap="round"
        transform={`rotate(${angle} 13 13)`}/>
      <circle cx="13" cy="13" r="1.6" fill={T.ink}/>
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      <path d="M4 14 L15 4 L26 14 V25 H4 Z" fill={T.ink}/>
      <rect x="12" y="17" width="6" height="8" fill="rgba(255,251,243,0.7)"/>
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="12" r="9" fill={T.ink}/>
      <rect x="13" y="18" width="4" height="9" fill={T.ink}/>
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

// ── Shared layout atoms ───────────────────────────────────────────────

function CircleBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 999,
      background: 'rgba(58,51,44,0.06)', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  );
}

function QuizTitle({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <h2 style={{
        fontFamily: T.display, fontSize: 52, lineHeight: 0.9,
        fontWeight: 700, letterSpacing: '-0.04em', color: T.ink, margin: 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ fontFamily: T.body, fontSize: 15, color: T.ink2, marginTop: 14, lineHeight: 1.4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChoiceCard({ tone, icon, label, hint, onClick }: {
  tone: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', border: `1px solid ${T.border}`, cursor: 'pointer',
        width: '100%', padding: '18px 22px', borderRadius: 22,
        background: T.paper, textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 18,
        transition: 'transform 0.12s ease',
      }}
      onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
      onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: tone,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, color: T.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {label}
        </div>
        <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink2, marginTop: 4 }}>{hint}</div>
      </div>
      <span style={{ color: T.ink3, fontSize: 22 }}>→</span>
    </button>
  );
}

function PantryCard({ emoji, label, desc, tone, selected, onClick }: {
  emoji: string;
  label: string;
  desc: string;
  tone: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', cursor: 'pointer', textAlign: 'left',
        padding: 14, borderRadius: 20, minHeight: 140,
        background: selected ? T.ink : T.paper,
        border: `1px solid ${selected ? T.ink : T.border}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: selected ? 'rgba(255,251,243,0.15)' : tone,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {emoji}
      </div>
      <div>
        <div style={{
          fontFamily: T.display, fontWeight: 700, fontSize: 15,
          color: selected ? T.paper : T.ink, lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: T.body, fontSize: 11.5,
          color: selected ? 'rgba(255,251,243,0.65)' : T.ink3,
          lineHeight: 1.3, marginTop: 3,
        }}>
          {desc}
        </div>
      </div>
      {selected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 20, height: 20, borderRadius: '50%',
          background: T.paper, color: T.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
        }}>✓</div>
      )}
    </button>
  );
}
