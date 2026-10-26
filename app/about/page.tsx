import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <Prose title="About" intro={`${site.name} brings together jewellery from independent jewellers across the UAE, so you can see a piece and its price before you visit.`}>
      <p>We are a listing service, not a shop. We do not hold stock, take payments or deliver. When you find a piece you like, you contact the jeweller and see it in person.</p>
      <h2>Prices</h2>
      <p>A listed price is set by the jeweller. An indicative price is worked out from the jeweller&apos;s gold rate on the day it was listed and moves with the gold price. Either way, the jeweller confirms the final price in the shop.</p>
      <h2>This prototype</h2>
      <p>Every jeweller, price and contact detail on this site is demonstration data, and the images are 3D renders rather than photographs of real stock.</p>
    </Prose>
  );
}
