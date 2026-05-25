import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ENERGIES = ["low", "medium", "high"];
const TIMES = [10, 30, 60];
const LOCATIONS = ["inside", "outside"];
const CATEGORIES = [
  { id: "kitchen",  label: "Kitchen stuff",     description: "flour, eggs, food coloring, basic ingredients" },
  { id: "art",      label: "Art supplies",       description: "paint, crayons, markers, paper, glue" },
  { id: "building", label: "Building materials", description: "cardboard, tape, scissors, boxes" },
  { id: "outdoor",  label: "Outdoor access",     description: "yard, park, balcony, sidewalk" },
  { id: "toys",     label: "Toys",               description: "blocks, balls, stuffed animals, puzzles" },
  { id: "water",    label: "Water play",         description: "buckets, cups, sponges, hose" },
  { id: "household",label: "Random household",   description: "pillows, blankets, furniture" },
  { id: "nothing",  label: "Nothing needed",     description: "no supplies required" },
];

const AGE_COMBOS = [
  [2], [4], [6], [8], [3, 6], [2, 5], [4, 8], [1, 4],
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildPrompt(input) {
  const { energy, time, location, ages, cats } = input;
  const ageDesc = ages.length === 1 ? `a ${ages[0]}-year-old` : `kids aged ${ages.join(" and ")}`;
  const catLines = cats.map(c => `  - ${c.label}: ${c.description}`).join("\n");

  return `Generate a unique, creative kids activity for ${ageDesc}.

Constraints:
- Energy level: ${energy}
- Duration: ~${time} minutes
- Location: ${location === "inside" ? "indoors" : "outdoors"}
- Available resources:
${catLines}

Be creative and suggest diverse activities — avoid repeating similar suggestions. Think beyond obvious crafts. Each suggestion should feel fresh and different.

If the activity involves making something, include exact measurements in the steps.

Return ONLY valid JSON, no markdown:
{
  "title": "Short catchy name",
  "blurb": "1-2 sentences, warm and direct"
}`;
}

async function generate(input, index) {
  const prompt = buildPrompt(input);
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    const match = raw.match(/\{[^{}]*\}/);
    const text = match ? match[0] : raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(text);
    return { index, input, title: parsed.title, blurb: parsed.blurb, ok: true };
  } catch (e) {
    return { index, input, title: "ERROR", blurb: String(e), ok: false };
  }
}

// Build 50 varied inputs
const inputs = Array.from({ length: 50 }, (_, i) => {
  const numCats = Math.random() < 0.3 ? 1 : Math.random() < 0.6 ? 2 : 3;
  return {
    energy: ENERGIES[i % 3],
    time: TIMES[i % 3],
    location: LOCATIONS[i % 2],
    ages: pick(AGE_COMBOS),
    cats: pickN(CATEGORIES, numCats),
  };
});

console.log("Generating 50 activities in batches of 10...\n");

const results = [];
const BATCH = 10;
for (let i = 0; i < inputs.length; i += BATCH) {
  const batch = inputs.slice(i, i + BATCH);
  const batchResults = await Promise.all(batch.map((inp, j) => generate(inp, i + j)));
  results.push(...batchResults);
  console.log(`  ✓ ${Math.min(i + BATCH, 50)}/50`);
}

// Format output
const lines = results.map((r) => {
  const cats = r.input.cats.map(c => c.label).join(", ");
  const ages = r.input.ages.length === 1 ? `age ${r.input.ages[0]}` : `ages ${r.input.ages.join("&")}`;
  const tag = `[${r.input.energy} · ${r.input.time}min · ${r.input.location} · ${ages} · ${cats}]`;
  return `${String(r.index + 1).padStart(2, "0")}. ${r.title}\n    ${tag}\n    ${r.blurb}\n`;
});

const output = `SPARK — 50 Generated Activity Ideas\nGenerated: ${new Date().toLocaleString()}\n${"─".repeat(60)}\n\n${lines.join("\n")}`;

const outPath = join(__dirname, "../activity-review.txt");
writeFileSync(outPath, output, "utf8");
console.log(`\nSaved to activity-review.txt`);
