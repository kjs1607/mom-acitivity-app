import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, type Child } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

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
  border:    'rgba(58,51,44,0.10)',
  borderStrong: 'rgba(58,51,44,0.18)',
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

  const finish = (list: Child[]) => {
    update({ children: list, onboarded: true });
    navigate({ to: "/right-now" });
  };

  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 120 }}>
      {/* Progress bars — step 1 only */}
      {step >= 1 && (
        <div style={{ padding: '52px 24px 0', display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 999, background: T.terra }}/>
          <div style={{ flex: 1, height: 5, borderRadius: 999, background: T.terra }}/>
        </div>
      )}

      {/* Step 0 — Welcome hero */}
      {step === 0 && (
        <section style={{ padding: '56px 20px 0' }}>
          {/* Terra hero card */}
          <div style={{
            position: 'relative', height: 340, borderRadius: 28,
            background: T.terra, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', top: -90, right: -80, width: 220, height: 220, borderRadius: '50%', background: T.mustard }}/>
            <div style={{ position: 'absolute', bottom: -60, left: -50, width: 180, height: 180, borderRadius: '50%', background: T.sage }}/>
            <SparkGlyph size={170} color={T.paper} style={{ position: 'relative', filter: 'drop-shadow(0 6px 0 rgba(43,24,16,0.18))' }}/>
            <span style={{ position: 'absolute', top: 18, left: 18, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,251,243,0.7)' }}>v.1 · est. '26</span>
            <span style={{ position: 'absolute', bottom: 18, right: 20, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,251,243,0.7)' }}>four taps to playtime</span>
          </div>
          {/* Wordmark + pitch */}
          <div style={{ padding: '28px 8px 0' }}>
            <h1 style={{ fontFamily: T.display, fontSize: 72, lineHeight: 0.88, margin: 0, fontWeight: 700, letterSpacing: '-0.045em', color: T.ink }}>Spark.</h1>
            <p style={{ fontFamily: T.body, fontSize: 16, lineHeight: 1.35, color: T.ink2, margin: '16px 0 0', maxWidth: 320 }}>
              Real activity ideas that fit your{' '}
              <span style={{ color: T.terra, fontWeight: 600 }}>kid</span>, your{' '}
              <span style={{ color: T.terra, fontWeight: 600 }}>hour</span>, and your stuff.
            </p>
          </div>
        </section>
      )}

      {/* Step 1 — Kids */}
      {step === 1 && (
        <section style={{ padding: '32px 24px 0' }}>
          <h1 style={{ fontFamily: T.display, fontSize: 38, lineHeight: 0.95, fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, margin: 0 }}>
            Who are we planning for?
          </h1>
          <p style={{ fontFamily: T.body, fontSize: 14.5, color: T.ink2, margin: '10px 0 0' }}>
            Add each kid. We use ages to match activities.
          </p>

          {/* Added kids */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {children.map((c) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: 6, borderRadius: 999,
                background: T.paper, border: `1px solid ${T.border}`,
              }}>
                <div style={{ flex: 1, padding: '10px 16px', fontFamily: T.display, fontSize: 17, fontWeight: 500, color: T.ink }}>
                  {c.name}
                </div>
                <div style={{
                  minWidth: 72, padding: '10px 14px', borderRadius: 999,
                  background: T.cream, border: `1px solid ${T.border}`,
                  fontFamily: T.display, fontSize: 15, fontWeight: 600, color: T.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {c.age}
                </div>
                <button
                  onClick={() => setChildren((cs) => cs.filter((x) => x.id !== c.id))}
                  style={{
                    width: 36, height: 36, borderRadius: 999, border: 'none',
                    background: 'rgba(58,51,44,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.ink3, fontSize: 16, marginRight: 2,
                  }}
                >×</button>
              </div>
            ))}

            {/* New kid input row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: 6, borderRadius: 999,
              background: T.paper, border: `1px solid ${T.terra}`,
            }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChild()}
                placeholder="Name"
                style={{
                  flex: 1, padding: '10px 16px', border: 'none', outline: 'none',
                  background: 'transparent',
                  fontFamily: T.display, fontSize: 17, fontWeight: 500, color: T.ink,
                }}
              />
              <div style={{
                minWidth: 72, padding: '4px 10px', borderRadius: 999,
                background: T.cream, border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(0, Math.min(12, Number(e.target.value))))}
                  placeholder="Age"
                  type="number"
                  inputMode="numeric"
                  min={0} max={12}
                  style={{
                    width: 32, border: 'none', outline: 'none',
                    background: 'transparent', textAlign: 'center',
                    fontFamily: T.display, fontSize: 15, fontWeight: 600, color: T.ink,
                  }}
                />
                <svg width="10" height="12" viewBox="0 0 10 12" style={{ opacity: 0.45, flexShrink: 0 }}>
                  <path d="M5 1 L1 5 H9 Z M5 11 L1 7 H9 Z" fill={T.ink2}/>
                </svg>
              </div>
            </div>

            {/* Add child dashed button */}
            <button
              onClick={addChild}
              disabled={!name.trim() || age === ""}
              style={{
                appearance: 'none', cursor: name.trim() && age !== "" ? 'pointer' : 'default',
                width: '100%', padding: '14px 18px', borderRadius: 16,
                background: 'transparent', border: `1.5px dashed ${T.borderStrong}`,
                fontFamily: T.body, fontSize: 14, fontWeight: 500, color: T.ink2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: name.trim() && age !== "" ? 1 : 0.45,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add child
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(251,244,234,0.95)', backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${T.border}`,
        padding: '12px 22px 32px',
        display: 'flex', gap: 10,
      }}>
        {step > 0 && (
          <button
            onClick={() => setStep(0)}
            style={{
              padding: '14px 22px', borderRadius: 999,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: T.body, fontSize: 15, fontWeight: 600, color: T.ink2,
            }}
          >Back</button>
        )}

        {step === 0 ? (
          <button
            onClick={() => setStep(1)}
            style={{
              flex: 1, padding: '18px 22px', borderRadius: 999,
              background: T.terra, color: T.paper, border: 'none', cursor: 'pointer',
              fontFamily: T.display, fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(159,74,48,0.35)',
            }}
          >
            <span>Light it up</span>
            <span style={{ fontSize: 22 }}>→</span>
          </button>
        ) : (
          <button
            onClick={() => {
              let list = children;
              if (name.trim() && age !== "") {
                list = [...children, { id: crypto.randomUUID(), name: name.trim(), age: Number(age) }];
              }
              if (list.length === 0) return;
              finish(list);
            }}
            disabled={children.length === 0 && (!name.trim() || age === "")}
            style={{
              flex: 1, padding: '18px 22px', borderRadius: 999,
              background: T.terra, color: T.paper, border: 'none', cursor: 'pointer',
              fontFamily: T.display, fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(159,74,48,0.35)',
              opacity: children.length === 0 && (!name.trim() || age === "") ? 0.4 : 1,
            }}
          >
            <span>Done — let's go</span>
            <span style={{ fontSize: 22 }}>→</span>
          </button>
        )}
      </footer>
    </main>
  );
}
