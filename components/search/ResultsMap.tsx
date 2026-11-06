"use client";
// Map of the jewellers behind the current results. Leaflet with the
// OpenStreetMap standard tiles (free with attribution, for light use), toned
// down in CSS to sit with the palette. CARTO's basemaps now need an API key.
// For real traffic, move to a tile plan with a key. Pins carry the number of
// matching pieces at that shop.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { areaFor } from "@/lib/catalogue-store";
import type { MapShop } from "./map-shops";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export default function ResultsMap({ shops, onPick, className = "" }: {
  shops: MapShop[];
  onPick?: (slug: string) => void;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([25.05, 55.1], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      className: "tibr-tiles",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    // Clicks on a popup's button arrive here rather than through React.
    el.current.addEventListener("click", (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-shop]");
      if (t) pick.current?.(t.dataset.shop!);
    });
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const points: L.LatLngExpression[] = [];
    for (const { shop, count, label } of shops) {
      const icon = L.divIcon({
        className: "",
        html: `<span class="tibr-pin">${escape(label ?? String(count))}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const area = areaFor(shop);
      L.marker([shop.lat, shop.lng], { icon, title: shop.name, keyboard: true })
        .bindPopup(
          `<div class="tibr-pop"><strong>${escape(shop.name)}</strong><span>${escape(area.name)}, ${escape(area.emirate)}</span>` +
          (pick.current ? `<button type="button" data-shop="${escape(shop.slug)}">Show ${count} ${count === 1 ? "piece" : "pieces"}</button>` : "") + `</div>`,
          { closeButton: false },
        )
        .addTo(g);
      points.push([shop.lat, shop.lng]);
    }
    if (points.length === 1) m.setView(points[0], 14);
    else if (points.length) m.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13 });
  }, [shops]);

  return <div ref={el} className={`z-0 bg-limestone ${className}`} role="region" aria-label="Map of jewellers" />;
}
