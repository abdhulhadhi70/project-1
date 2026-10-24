import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache yet. The R2 cache in OpenNext's template needs a card
// on file with Cloudflare, so it is left out until we decide on caching in
// Phase 5 (Workers KV has a free tier and needs no card).
export default defineCloudflareConfig();
