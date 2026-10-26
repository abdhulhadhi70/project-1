import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <Prose title="Contact" intro="About a piece? Use the WhatsApp or call buttons on its page: they go straight to the jeweller.">
      <h2>Everything else</h2>
      {site.contactEmail ? (
        <p>Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
      ) : (
        <p>This prototype does not have a contact inbox yet. An address will be listed here before launch.</p>
      )}
    </Prose>
  );
}
