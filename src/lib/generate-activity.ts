import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import type { Activity } from "./activities";

// ---- Types ----

export type GenerateInput = {
  energy: "low" | "medium" | "high";
  time: 10 | 30 | 60;
  location: "inside" | "outside";
  ages: number[];
  categories: string[];
  recentTitles: string[];
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  kitchen:   "kitchen supplies (flour, eggs, food coloring, basic ingredients)",
  art:       "art supplies (paint, crayons, markers, paper, glue)",
  building:  "building materials (cardboard, tape, scissors, boxes)",
  outdoor:   "outdoor access (yard, park, balcony, sidewalk)",
  toys:      "toys (blocks, balls, stuffed animals, puzzles)",
  water:     "water play items (buckets, cups, sponges, hose)",
  household: "random household items (pillows, blankets, furniture)",
  nothing:   "no supplies — use nothing at all",
};

// ---- Server function ----

export const generateActivity = createServerFn({ method: "POST" })
  .inputValidator((input: GenerateInput) => input)
  .handler(async ({ data }) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const ageDesc =
      data.ages.length === 0
        ? "young children"
        : data.ages.length === 1
          ? `a ${data.ages[0]}-year-old`
          : `kids aged ${data.ages.join(" and ")}`;

    const categoryLines =
      data.categories.length > 0
        ? data.categories.map((id) => `  - ${CATEGORY_DESCRIPTIONS[id] ?? id}`).join("\n")
        : "  - common household items";

    const avoidSection =
      data.recentTitles.length > 0
        ? `\nDo NOT suggest any of these recently shown activities: ${data.recentTitles.join(", ")}.`
        : "";

    const prompt = `Generate a unique, creative kids activity for ${ageDesc}.

Constraints:
- Energy level: ${data.energy}
- Duration: ~${data.time} minutes
- Location: ${data.location === "inside" ? "indoors" : "outdoors"}
- Available resources:
${categoryLines}
${avoidSection}
Be creative and suggest diverse activities — avoid repeating similar suggestions. Think beyond obvious crafts. Each suggestion should feel fresh and different from typical kids' activities.

If the activity involves making something (dough, slime, paint, sensory materials, edible crafts, mixtures), include exact measurements in the steps. Write it like a recipe: "1 cup flour + ½ cup water + 2–3 drops food coloring — mix until smooth" rather than "mix flour with water".

Return ONLY valid JSON with no markdown or explanation:
{
  "title": "Short, catchy name",
  "blurb": "1-2 sentences, warm and direct, parent-to-parent tone",
  "needs": ["item 1", "item 2"],
  "steps": ["Do this first", "Then this", "Finally this"],
  "siblingTip": "How siblings of different ages can both participate"
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(text);

    const activity: Activity = {
      id: `gen-${crypto.randomUUID()}`,
      title: parsed.title,
      blurb: parsed.blurb,
      energy: data.energy,
      time: data.time,
      location: data.location,
      ageMin: data.ages.length ? Math.min(...data.ages) : 1,
      ageMax: data.ages.length ? Math.max(...data.ages) : 8,
      needs: parsed.needs ?? [],
      steps: parsed.steps ?? [],
      siblingTip: parsed.siblingTip ?? "",
    };

    return activity;
  });

// ---- Client-side cache (localStorage) ----

const INPUTS_KEY = "spark_last_inputs_v1";

export type SavedInputs = Omit<GenerateInput, "recentTitles">;

export function saveLastInputs(inputs: SavedInputs): void {
  try {
    localStorage.setItem(INPUTS_KEY, JSON.stringify(inputs));
  } catch {}
}

export function getLastInputs(): SavedInputs | null {
  try {
    const raw = localStorage.getItem(INPUTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const CACHE_KEY = "spark_generated_activities_v1";
const RECENT_KEY = "spark_recent_titles_v1";
const MAX_RECENT = 15;

export function getCachedActivity(id: string): Activity | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    return cache[id] ?? null;
  } catch {
    return null;
  }
}

export function cacheActivity(activity: Activity): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    cache[activity.id] = activity;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getRecentTitles(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentTitle(title: string): void {
  try {
    const recent = getRecentTitles();
    const updated = [title, ...recent.filter((t) => t !== title)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}
