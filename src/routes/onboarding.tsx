import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, type Child } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const T = {
  cream:   '#FBF4EA',
  paper:   '#FFFBF3',
  ink:     '#2B1810',
  ink2:    '#5C463A',
  ink3:    '#8B7567',
  terra:   '#C4654A',
  border:  'rgba(43,24,16,0.10)',
  borderStrong: 'rgba(43,24,16,0.18)',
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  body:    '"Inter Tight", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
} as const;

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
    navigate({ to: "/" });
  };

  return (
    <main style={{ minHeight: '100svh', background: T.cream, paddingBottom: 120 }}>
      {/* Progress bars */}
      <div style={{ padding: '52px 24px 0', display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: step >= 0 ? T.terra : 'rgba(43,24,16,0.12)' }}/>
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: step >= 1 ? T.terra : 'rgba(43,24,16,0.12)' }}/>
      </div>

      {/* Step 0 — Intro */}
      {step === 0 && (
        <section style={{ padding: '32px 24px 0' }}>
          <h1 style={{ fontFamily: T.display, fontSize: 38, lineHeight: 0.95, fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, margin: 0 }}>
            Hi. Let's keep this short.
          </h1>
          <p style={{ fontFamily: T.body, fontSize: 15, color: T.ink2, margin: '14px 0 0', lineHeight: 1.5 }}>
            No account. No email. Just a few quick steps so we can find the right idea for your family.
          </p>
          <div style={{ marginTop: 28, padding: '20px 22px', borderRadius: 22, background: T.paper, border: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: T.display, fontSize: 20, fontWeight: 600, color: T.ink, margin: 0, lineHeight: 1.2 }}>
              You bring the kids.<br/>We bring the idea.
            </p>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.ink3, margin: '8px 0 0' }}>Takes 30 seconds.</p>
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
                    background: 'rgba(43,24,16,0.06)', cursor: 'pointer',
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
            <span>Let's go</span>
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
