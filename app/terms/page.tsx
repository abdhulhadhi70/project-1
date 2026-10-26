import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <Prose title="Terms" intro="A short version, for the prototype.">
      <p>This site is a listing service. Any sale is a contract between you and the jeweller, made in the jeweller&apos;s shop. We are not a party to it.</p>
      <p>Prices shown are set or estimated by jewellers and can change, particularly with the gold price. Always confirm the price, purity and weight with the jeweller before you buy.</p>
      <p>All jewellers, prices, contact details and images currently on this site are demonstration data and are not offers.</p>
    </Prose>
  );
}
