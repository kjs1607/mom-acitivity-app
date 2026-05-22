export type Activity = {
  id: string;
  title: string;
  blurb: string;
  energy: "low" | "medium" | "high";
  time: 10 | 30 | 60;
  location: "inside" | "outside" | "both";
  ageMin: number;
  ageMax: number;
  needs: string[];
  steps: string[];
  siblingTip: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "cloud-dough",
    title: "Two-Ingredient Cloud Dough",
    blurb: "Soft, moldable, and weirdly satisfying. Big sibling builds, little sibling squishes.",
    energy: "low", time: 30, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Flour", "Baby oil or vegetable oil", "Large bowl or tray"],
    steps: [
      "Pour 4 cups of flour into a tray.",
      "Slowly drizzle in 1/2 cup oil, mixing with hands.",
      "Squeeze a fistful — if it holds shape, it's ready.",
      "Add cups, spoons, small toys. Let them dig.",
    ],
    siblingTip: "4yo: shape castles & cookies. 1yo: just lets them feel and scoop — it's taste-safe-ish but supervise.",
  },
  {
    id: "color-mix",
    title: "Ice Cube Color Lab",
    blurb: "Drop food coloring on ice and watch it bloom. Looks like magic, takes 5 minutes to set up.",
    energy: "low", time: 10, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Ice cube tray", "Food coloring", "Droppers or spoons", "White plate"],
    steps: [
      "Pile ice cubes onto a white plate or tray.",
      "Drip food coloring (2-3 colors) onto cubes.",
      "Watch colors swirl and pool as ice melts.",
    ],
    siblingTip: "4yo: predict what happens when colors mix. 1yo: hand them an ice cube and let them push it around.",
  },
  {
    id: "obstacle-course",
    title: "Living Room Obstacle Course",
    blurb: "Couch cushions, painters tape, pillows. Burn that energy without leaving the rug.",
    energy: "high", time: 30, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Couch cushions", "Pillows", "Tape (optional)"],
    steps: [
      "Lay cushions as stepping stones — the floor is lava.",
      "Tape a 'balance line' across the floor.",
      "Crawl tunnel under a chair, hop over a pillow, spin twice.",
      "Time them. Beat the time. Repeat.",
    ],
    siblingTip: "4yo: races the clock. 1yo: gets a slow-mo solo lap with help. Both win a high five.",
  },
  {
    id: "nature-hunt",
    title: "Backyard Scavenger Hunt",
    blurb: "5 things to find: something smooth, something yellow, something tiny, something loud, something soft.",
    energy: "medium", time: 30, location: "outside",
    ageMin: 1, ageMax: 8,
    needs: ["A small bag or bucket", "Outdoor space"],
    steps: [
      "Give each kid a bucket.",
      "Call out one 'find' at a time.",
      "Inspect each treasure together. Make up a story for one.",
    ],
    siblingTip: "4yo: reads the list. 1yo: copies sibling — surprisingly effective.",
  },
  {
    id: "pasta-necklace",
    title: "Pasta Necklaces",
    blurb: "Threading practice that doubles as jewelry. Quiet activity, big payoff.",
    energy: "low", time: 30, location: "inside",
    ageMin: 2, ageMax: 8,
    needs: ["Pasta (tube shapes)", "String/yarn", "Food coloring (optional)"],
    steps: [
      "Optional: dye pasta with a few drops of food coloring + a splash of vinegar, let dry.",
      "Tie a knot at one end of the yarn.",
      "Thread pasta until necklace is the right length.",
    ],
    siblingTip: "4yo: threads pasta. 1yo: sorts pasta by color into cups. Keep raw pasta away from tiny mouths.",
  },
  {
    id: "sponge-bombs",
    title: "Sponge Water Bombs",
    blurb: "Outside-only chaos that requires zero cleanup. Soak, throw, repeat.",
    energy: "high", time: 30, location: "outside",
    ageMin: 1, ageMax: 8,
    needs: ["Sponges", "Bucket of water"],
    steps: [
      "Cut sponges into strips and tie in the middle with string (or just use whole sponges).",
      "Fill a bucket with water.",
      "Soak. Toss. Dodge.",
    ],
    siblingTip: "4yo: aim practice. 1yo: just enjoys splashing the bucket. Both get changed after.",
  },
  {
    id: "tape-roads",
    title: "Painters Tape Roads",
    blurb: "Stick tape on the floor in a giant road map. Cars, dolls, dinosaurs — they all commute.",
    energy: "medium", time: 60, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Painters tape", "Toy cars or small figures"],
    steps: [
      "Lay tape on hard floor in roads, intersections, parking lots.",
      "Add a 'house' and a 'store'.",
      "Drive. Narrate. Add a tunnel under the coffee table.",
    ],
    siblingTip: "4yo: designs the city. 1yo: drives one car back and forth — joyfully.",
  },
  {
    id: "kitchen-band",
    title: "Pots & Pans Band",
    blurb: "Loud. Brief. Cathartic. 10 minutes and everyone feels better.",
    energy: "high", time: 10, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Pots", "Wooden spoons"],
    steps: [
      "Pull out 3-4 pots and lids.",
      "Hand out wooden spoons.",
      "Play a song. March around the kitchen.",
    ],
    siblingTip: "4yo: keeps a beat. 1yo: bangs joyfully. Everyone wins (well, mostly).",
  },
  {
    id: "salt-painting",
    title: "Salt & Watercolor Painting",
    blurb: "Glue + salt + watercolor = textures that look like fireworks. Quiet and absorbing.",
    energy: "low", time: 60, location: "inside",
    ageMin: 2, ageMax: 8,
    needs: ["Glue", "Salt", "Paint", "Paper"],
    steps: [
      "Draw shapes with glue on paper.",
      "Sprinkle salt over the glue, shake off extras.",
      "Touch watery paint to the salt and watch it travel.",
    ],
    siblingTip: "4yo: draws specific shapes. 1yo: free-glue scribble + dump salt. Both get masterpieces.",
  },
  {
    id: "bubble-stomp",
    title: "Bubble Wrap Stomp",
    blurb: "Tape bubble wrap to the floor. Run. Pop. Done.",
    energy: "high", time: 10, location: "inside",
    ageMin: 1, ageMax: 8,
    needs: ["Bubble wrap", "Tape"],
    steps: [
      "Tape a strip of bubble wrap across a hallway.",
      "Take off shoes. Run, jump, stomp.",
    ],
    siblingTip: "Both ages = same activity, same delight. Rare.",
  },
];

export function pickActivity(opts: {
  energy: "low" | "medium" | "high";
  time: 10 | 30 | 60;
  location: "inside" | "outside";
  ages: number[];
  pantry: string[];
}): Activity | null {
  const minAge = Math.min(...(opts.ages.length ? opts.ages : [0]));
  const maxAge = Math.max(...(opts.ages.length ? opts.ages : [8]));
  const pantrySet = new Set(opts.pantry.map((p) => p.toLowerCase()));

  const scored = ACTIVITIES.map((a) => {
    let score = 0;
    if (a.energy === opts.energy) score += 3;
    if (a.time === opts.time) score += 3;
    else if (Math.abs(a.time - opts.time) <= 20) score += 1;
    if (a.location === opts.location || a.location === "both") score += 3;
    if (minAge >= a.ageMin && maxAge <= a.ageMax) score += 2;
    else if (minAge <= a.ageMax && maxAge >= a.ageMin) score += 1;

    const haveCount = a.needs.filter((n) =>
      [...pantrySet].some((p) => n.toLowerCase().includes(p))
    ).length;
    score += haveCount;
    return { a, score };
  }).sort((x, y) => y.score - x.score);

  return scored[0]?.a ?? null;
}

export function missingItems(a: Activity, pantry: string[]): string[] {
  const pantrySet = pantry.map((p) => p.toLowerCase());
  return a.needs.filter(
    (n) => !pantrySet.some((p) => n.toLowerCase().includes(p))
  );
}
