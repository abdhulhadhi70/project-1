"use client";
import { Prose } from "@/components/Prose";
import { site } from "@/data/site";
import { useCatalogue } from "@/lib/catalogue-store";

export default function Contact() {
  const { settings } = useCatalogue();
  const email = settings?.contactEmail ?? site.contactEmail;
  const wa = settings?.contactWhatsapp;
  return (
    <Prose title="Contact" intro="About a piece? Use the WhatsApp or call buttons on its page: they go straight to the jeweller.">
      <h2>Everything else</h2>
      {email || wa ? (
        <p>
          {email && <>Email <a href={`mailto:${email}`}>{email}</a>{wa ? ", or " : "."}</>}
          {wa && <>WhatsApp <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">+{wa}</a>.</>}
        </p>
      ) : (
        <p>A contact address will be listed here before launch.</p>
      )}
    </Prose>
  );
}
