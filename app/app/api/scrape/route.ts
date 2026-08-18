import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead, ScrapeInput } from "@/lib/types";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";

interface CityConfig {
  lat: number;
  lng: number;
  areas: string[];
}

const CITY_PRESETS: Record<string, CityConfig> = {
  delhi: {
    lat: 28.6139,
    lng: 77.2090,
    areas: [
      "Connaught Place, New Delhi",
      "South Extension, New Delhi",
      "Hauz Khas, New Delhi",
      "Dwarka Sector 10, New Delhi",
      "Karol Bagh, New Delhi",
      "Rohini Sector 7, New Delhi",
      "Vasant Kunj, New Delhi",
      "Green Park, New Delhi",
      "Saket, New Delhi",
      "Lajpat Nagar, New Delhi",
      "Defence Colony, New Delhi",
      "Rajouri Garden, New Delhi",
    ],
  },
  mumbai: {
    lat: 19.0760,
    lng: 72.8777,
    areas: [
      "Linking Road, Bandra West, Mumbai",
      "Hill Road, Bandra West, Mumbai",
      "Pali Hill, Bandra West, Mumbai",
      "Carter Road, Bandra West, Mumbai",
      "Juhu, Mumbai",
      "Andheri West, Mumbai",
      "Powai, Mumbai",
      "Worli, Mumbai",
      "Lower Parel, Mumbai",
      "Colaba, Mumbai",
      "Versova, Mumbai",
      "Dadabai Road, Andheri, Mumbai",
    ],
  },
  bangalore: {
    lat: 12.9716,
    lng: 77.5946,
    areas: [
      "Indiranagar, Bengaluru",
      "Koramangala 5th Block, Bengaluru",
      "HSR Layout, Bengaluru",
      "Jayanagar 4th Block, Bengaluru",
      "Whitefield, Bengaluru",
      "MG Road, Bengaluru",
      "Malleshwaram, Bengaluru",
      "JP Nagar, Bengaluru",
    ],
  },
  pune: {
    lat: 18.5204,
    lng: 73.8567,
    areas: [
      "Koregaon Park, Pune",
      "Viman Nagar, Pune",
      "Kothrud, Pune",
      "Baner, Pune",
      "Aundh, Pune",
      "Deccan Gymkhana, Pune",
    ],
  },
};

function getCityConfig(cityInput: string): CityConfig {
  const normalized = cityInput.toLowerCase();
  for (const [key, cfg] of Object.entries(CITY_PRESETS)) {
    if (normalized.includes(key) || (key === "bangalore" && normalized.includes("bengaluru"))) {
      return cfg;
    }
  }
  return {
    lat: 28.6139,
    lng: 77.2090,
    areas: Array.from({ length: 12 }, (_, i) => `Main Road, Sector ${i + 1}, ${cityInput}`),
  };
}

function adaptSeedLeads(seedLeads: Lead[], input: ScrapeInput): Lead[] {
  const cityCfg = getCityConfig(input.city);
  const targetCity = input.city || "Delhi";
  const targetNiche = input.niche || "Dentist";

  const seedBaseLat = 19.06;
  const seedBaseLng = 72.83;

  return seedLeads.map((lead, i) => {
    const dLat = (lead.lat ?? 19.06) - seedBaseLat;
    const dLng = (lead.lng ?? 72.83) - seedBaseLng;
    const area = cityCfg.areas[i % cityCfg.areas.length];

    let name = lead.name;
    if (name.includes("Bandra")) {
      name = name.replace(/Bandra/g, targetCity);
    } else if (name.includes("Mumbai")) {
      name = name.replace(/Mumbai/g, targetCity);
    }

    let email = lead.email;
    if (email && email.includes("bandra")) {
      email = email.replace(/bandra/g, targetCity.toLowerCase().replace(/\s+/g, ""));
    }

    return {
      ...lead,
      name,
      category: targetNiche,
      city: targetCity,
      address: area,
      email,
      lat: Number((cityCfg.lat + dLat).toFixed(4)),
      lng: Number((cityCfg.lng + dLng).toFixed(4)),
    };
  });
}

async function loadSeed(input: ScrapeInput): Promise<{ leads: Lead[] }> {
  const p = path.join(process.cwd(), "data", "leads-seed.json");
  const raw = await fs.readFile(p, "utf-8");
  const json = JSON.parse(raw);
  const rawLeads = json.leads as Lead[];
  const adapted = adaptSeedLeads(rawLeads, input);
  return { leads: adapted };
}

export const maxDuration = 60;

export async function POST(req: Request) {
  const input = (await req.json()) as ScrapeInput;

  const token = process.env.APIFY_TOKEN;

  // No token = serve cached seed adapted to requested city/niche
  if (!token) {
    const { leads } = await loadSeed(input);
    const sliced = leads.slice(0, Math.max(1, Math.min(input.count, leads.length)));
    return NextResponse.json({ source: "seed", leads: sliced });
  }

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          searchStringsArray: [`${input.niche} in ${input.city}`],
          maxCrawledPlacesPerSearch: input.count,
          language: "en",
        }),
        signal: AbortSignal.timeout(8500),
      },
    );
    if (!runRes.ok) throw new Error(`Apify response status ${runRes.status}`);
    const items = (await runRes.json()) as Array<Record<string, unknown>>;

    const leads: Lead[] = items.slice(0, input.count).map((it, i) => ({
      id: `live-${String(i + 1).padStart(2, "0")}`,
      name: String(it.title ?? it.name ?? "Unknown"),
      category: String(it.categoryName ?? input.niche),
      address: String(it.address ?? ""),
      city: input.city,
      phone: it.phone ? String(it.phone) : undefined,
      whatsapp: it.phone ? String(it.phone) : undefined,
      email: undefined,
      website: it.website ? String(it.website) : undefined,
      rating: typeof it.totalScore === "number" ? (it.totalScore as number) : undefined,
      reviewsCount: typeof it.reviewsCount === "number" ? (it.reviewsCount as number) : undefined,
      lat: typeof (it.location as { lat?: number })?.lat === "number" ? (it.location as { lat: number }).lat : 28.6139,
      lng: typeof (it.location as { lng?: number })?.lng === "number" ? (it.location as { lng: number }).lng : 77.2090,
      photosCount: typeof it.imagesCount === "number" ? (it.imagesCount as number) : undefined,
    }));

    return NextResponse.json({ source: "apify", leads });
  } catch (e) {
    const { leads } = await loadSeed(input);
    return NextResponse.json({
      source: "seed-fallback",
      error: (e as Error).message,
      leads: leads.slice(0, input.count),
    });
  }
}

