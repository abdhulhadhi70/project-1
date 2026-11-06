// Page addresses. Pieces and jewellers use a query string so that anything a
// jeweller adds has a page immediately, without rebuilding the site.
export const pieceHref = (slug: string) => `/piece?slug=${encodeURIComponent(slug)}`;
export const shopHref = (slug: string) => `/jeweller?slug=${encodeURIComponent(slug)}`;
/** Google Maps with the route to the shop already started from where the
 *  customer is; on a phone it opens in the Google Maps app. Free, no key. */
export const directionsHref = (shop: { lat: number; lng: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}&travelmode=driving`;
