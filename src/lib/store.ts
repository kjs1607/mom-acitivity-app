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

export type PantryCategory = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

export const PANTRY_CATEGORIES: PantryCategory[] = [
  { id: "kitchen",  emoji: "🍳", label: "Kitchen stuff",       description: "flour, eggs, food coloring, basic ingredients" },
  { id: "art",      emoji: "🎨", label: "Art supplies",         description: "paint, crayons, markers, paper, glue" },
  { id: "building", emoji: "🏗️", label: "Building materials",   description: "cardboard, tape, scissors, boxes" },
  { id: "outdoor",  emoji: "🌿", label: "Outdoor access",       description: "yard, park, balcony, sidewalk" },
  { id: "toys",     emoji: "🧸", label: "Toys",                 description: "blocks, balls, stuffed animals, puzzles" },
  { id: "water",    emoji: "💧", label: "Water play",           description: "buckets, cups, sponges, hose" },
  { id: "household",emoji: "📦", label: "Random household",     description: "pillows, blankets, furniture" },
  { id: "nothing",  emoji: "✨", label: "Nothing needed",       description: "no supplies required" },
];
