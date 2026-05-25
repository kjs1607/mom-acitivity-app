import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import type { Activity } from "./activities";

// ---- Types ----

export type GenerateInput = {
  energy: "low" | "medium" | "high";
  time: 10 | 30 | 60;
  location: "inside" | "outside";
  ages: number[];
  pantry: string[];
  recentTitles: string[];
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

    const avoidSection =
      data.recentTitles.length > 0
        ? `\n\nDo NOT suggest any of these recently shown activities: ${data.recentTitles.join(", ")}.`
        : "";

    const prompt = `Generate a unique, creative kids activity for ${ageDesc}.

Constraints:
- Energy level: ${data.energy}
- Duration: ~${data.time} minutes
- Location: ${data.location === "inside" ? "indoors" : "outdoors"}
${data.pantry.length > 0 ? `- Available supplies: ${data.pantry.join(", ")}` : "- Use common household items"}${avoidSection}

Generate a unique activity — be creative and avoid suggesting the same activities repeatedly. Each suggestion should feel fresh and different.

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

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
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
