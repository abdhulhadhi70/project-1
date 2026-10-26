import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <Prose title="Privacy" intro="This prototype collects nothing about you.">
      <p>There are no accounts, no analytics and no advertising cookies.</p>
      <p>Pieces you save are stored in your own browser, using its local storage, so they are still there next time on the same device. They are never sent to us. Clearing your browser data removes them.</p>
      <p>When you contact a jeweller by WhatsApp or phone, that conversation is between you and the jeweller, under WhatsApp&apos;s or your phone provider&apos;s terms.</p>
    </Prose>
  );
}
