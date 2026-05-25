import { useEffect, useState } from "react";

export type Child = { id: string; name: string; age: number };
export type CompletedActivity = { id: string; date: string };

export type Profile = {
  children: Child[];
  pantry: string[];
  weekend: { saturday: string[]; sunday: string[] };
  saved: string[];
  completed: CompletedActivity[];
  onboarded: boolean;
};

const KEY = "sprout_profile_v1";

const DEFAULT: Profile = {
  children: [],
  pantry: [],
  weekend: { saturday: [], sunday: [] },
  saved: [],
  completed: [],
  onboarded: false,
};

function read(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(read());
    setReady(true);
  }, []);

  const update = (patch: Partial<Profile> | ((p: Profile) => Profile)) => {
    setProfile((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return { profile, update, ready };
}

export const PANTRY_OPTIONS = [
  "Flour", "Eggs", "Sugar", "Salt", "Baking soda", "Food coloring",
  "Paint", "Crayons", "Markers", "Paper", "Cardboard", "Glue",
  "Tape", "Scissors", "Pasta", "Rice", "Beans (dry)", "Cotton balls",
  "Ice cube tray", "Balloons", "String/yarn", "Sidewalk chalk",
  "Empty boxes", "Plastic cups", "Sponges", "Bubble wrap",
];
