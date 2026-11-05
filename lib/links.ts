// Page addresses. Pieces and jewellers use a query string so that anything a
// jeweller adds has a page immediately, without rebuilding the site.
export const pieceHref = (slug: string) => `/piece?slug=${encodeURIComponent(slug)}`;
export const shopHref = (slug: string) => `/jeweller?slug=${encodeURIComponent(slug)}`;
