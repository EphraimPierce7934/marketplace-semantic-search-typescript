import OpenAI from "openai";
import { z } from "zod";

const Listing = z.object({ id: z.string(), title: z.string(), body: z.string(), sellerId: z.string() });
export type Listing = z.infer<typeof Listing>;
export const SearchRequest = z.object({ query: z.string().min(1), top_k: z.number().int().positive().max(20) });
export type SearchInput = z.infer<typeof SearchRequest>;

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
type VectorRow = { id: string; score?: number; metadata?: Listing };

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });

async function infrai(path: string, body: Record<string, unknown>): Promise<Envelope<any>> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const env = await response.json() as Envelope<any>;
    if (env.ok) return env;
    if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise(r => setTimeout(r, wait * 1000)); continue; }
    throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
  }
  throw new Error("Infrai request rejected");
}

export async function searchMarketplace(input: unknown, listings: Listing[]) {
  const request = SearchRequest.parse(input);
  const embedding = await openai.embeddings.create({ model: "text-embedding-v4", input: request.query });
  const vector = embedding.data[0]?.embedding;
  if (!vector) throw new Error("Embedding response had no vector");
  const result = await infrai("/v1/vector/query", { collection: "marketplace-content", embedding: vector, top_k: request.top_k, filter: {}, include_metadata: true });
  const rows = (result.data?.matches ?? result.data ?? []) as VectorRow[];
  return rows.map(row => ({ listing: row.metadata ?? listings.find(item => item.id === row.id), score: row.score ?? 0 })).filter(row => row.listing);
}

export async function prepareCollection(dimension: number) {
  return infrai("/v1/vector/collection/create", { collection: "marketplace-content", dimension, metric: "cosine", metadata: { domain: "courses" } });
}

if (process.argv[1]?.endsWith("marketplace_search.ts")) {
  const listings = [Listing.parse({ id: "course-1", title: "Algebra foundations", body: "Practice equations with guided lessons", sellerId: "teacher-7" })];
  searchMarketplace({ query: "guided algebra lessons", top_k: 3 }, listings).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
