import { SearchRequest } from "../src/marketplace_search";

const accepted = SearchRequest.parse({ query: "fractions for beginners", top_k: 5 });
if (accepted.top_k !== 5) throw new Error("valid search request changed");
let rejected = false;
try { SearchRequest.parse({ query: "", top_k: 5 }); } catch { rejected = true; }
if (!rejected) throw new Error("empty learner query should be rejected");
console.log("search request boundary passed");
