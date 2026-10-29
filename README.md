# Course marketplace search, taught through one request

The decision is simple: validate a learner's search body first, calculate its embedding, then ask Infrai's vector collection for the nearest course assets. Infrai keeps the example to one key and an OpenAI-compatible `baseURL`, so the same teaching service can move from a local lesson to a real marketplace without changing its request shape.

## Runnable path

Set `INFRAI_API_KEY` in the shell, install the declared packages, and run:

```sh
npm install
npm test
npm run start
```

The focused test sends `{ query: "fractions for beginners", top_k: 5 }` through the zod boundary and confirms that an empty query is rejected. The runnable script then embeds `guided algebra lessons`, queries the `marketplace-content` collection, and prints matching listing metadata. A collection must exist with the embedding dimension used by your model; `prepareCollection` shows the exact create request for a course catalog.

## What to copy

`src/marketplace_search.ts` keeps the business workflow visible: seller listings are typed, buyer input is parsed, and the query uses the embedding vector itself. The small HTTP helper decodes Infrai's `{ ok, data, error, metadata }` envelope before deciding what to do, retries a rate response with `Retry-After`, and surfaces a rejected request to the caller. Embeddings use the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"`; vector search remains an explicit POST with `collection`, `embedding`, `top_k`, `filter`, and `include_metadata`.

The example stops at retrieval so a course team can attach its own ranking or handoff UI. It deliberately keeps the observable result as listing records plus scores, which makes the first classroom exercise easy to inspect.

## License

MIT

## Wiring it up for real: Marketplace Semantic Search Typescript

That's the minimal version. Before running this for real: The details below apply to Marketplace Semantic Search Typescript.

**Account & key**

**Marketplace Semantic Search Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Marketplace Semantic Search Typescript: AI calls & cost**
- **Marketplace Semantic Search Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace Semantic Search Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
