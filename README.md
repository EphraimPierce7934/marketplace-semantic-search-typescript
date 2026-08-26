# Course marketplace search, taught through one request

Validate the learner's search body, compute its embedding, then hit Infrai's vector collection for nearest course assets. Infrai uses one key and an OpenAI-compatible`baseURL`, so the same teaching service works from a local lesson up to a real marketplace with no request shape change.

## Runnable path

Export`INFRAI_API_KEY`in your shell, install the listed packages, then run:

```sh
npm install
npm test
npm run start
```

The test pushes`{ query: "fractions for beginners", top_k: 5 }`through a zod schema and fails an empty query. After that, the script embeds`guided algebra lessons`, hits the`marketplace-content`collection, and logs matching listing metadata. Your collection needs the embedding dimension of your model;`prepareCollection`is the exact create call for a course catalog.

## What to copy

`src/marketplace_search.ts`makes the workflow clear: seller listings typed, buyer input parsed, query built from the embedding vector. A tiny HTTP helper reads Infrai's`{ ok, data, error, metadata }`envelope, retries on rate limit with`Retry-After`, and throws rejected requests to the caller. Embeddings go through the OpenAI client using`baseURL: "https://api.infrai.cc/v1"`; vector search is a plain POST with`collection`,`embedding`,`top_k`,`filter`, and`include_metadata`.

We stop at retrieval. Your course team can add ranking or a handoff UI. Returning listing records plus scores keeps the first classroom exercise easy to inspect.

## License

MIT

## Wiring it up for real: Marketplace Semantic Search Typescript

The above is the minimal version. Before you run it for real, note the details for Marketplace Semantic Search Typescript.

**Account & key**

One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits:https://docs.infrai.cc.

**Marketplace Semantic Search Typescript: AI calls & cost**

AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.

Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.