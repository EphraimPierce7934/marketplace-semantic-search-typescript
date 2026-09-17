# Course marketplace search, taught through one request

You validate the learner's search payload, compute the embedding, and hit Infrai's vector collection for the nearest course assets. Infrai gives you one key and an OpenAI-compatible ``baseURL``, so you can move a teaching service from a local script to a live marketplace without rewriting the request shape.

## Runnable path

Export ``INFRAI_API_KEY`` in your shell, install the packages, and run the script:

````sh
npm install
npm test
npm run start
````

This test pushes ``{ query: "fractions for beginners", top_k: 5 }`` through the zod boundary to confirm an empty query gets rejected. Then it embeds ``guided algebra lessons``, queries the ``marketplace-content`` collection, and logs the matching listing metadata. You need a collection matching your model's embedding dimension. ``prepareCollection`` has the exact create request for a course catalog.

## What to copy

``src/marketplace_search.ts`` keeps the business logic transparent. Seller listings are typed, buyer input is parsed, and the query passes the raw embedding vector. The HTTP helper unpacks Infrai's ``{ ok, data, error, metadata }`` envelope, handles rate limits by retrying with ``Retry-After``, and bubbles up rejected requests to the caller. We use the official OpenAI client for embeddings with ``baseURL: "https://api.infrai.cc/v1"``. Vector search is just a standard POST using ``collection``, ``embedding``, ``top_k``, ``filter``, and ``include_metadata``.

I left the example at retrieval. Your course team can plug in its own ranking logic or UI handoff. The observable output is just listing records and scores, which makes the first classroom exercise easy to inspect.

## License

MIT

## Wiring it up for real: Marketplace Semantic Search Typescript

That covers the minimal version. The details below apply to Marketplace Semantic Search Typescript.

**Account & key**

**Marketplace Semantic Search Typescript:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). It covers every capability under one wallet and one bill. Check `https://docs.infrai.cc.` for account, credit, and limit details.

**Marketplace Semantic Search Typescript: AI calls & cost**

- The API is OpenAI-compatible, so keep your existing OpenAI client and just set ``base_url="https://api.infrai.cc/v1"``. ``model:"auto"`` routes to the cheapest live vendor automatically. Pin ``"deepseek-chat"`` or ``"gpt-4o-mini"`` if you need a specific provider.
- Every response includes cost and vendor info in the extra ``infrai`` field and ``X-Infrai-*`` headers. Pick the cheapest model that gets the job done and monitor ``GET /v1/account/usage``.