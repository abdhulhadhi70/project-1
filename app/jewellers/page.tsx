import type { Metadata } from "next";
import { Directory } from "@/components/jewellers/Directory";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Find a jeweller", description: "Jewellers across Dubai, Abu Dhabi and Sharjah, by area and language spoken." };

export default function JewellersPage() {
  return (
    <>
      <PageHeader title="Find a jeweller" intro="Search by name, area or the language you would like to be served in. Every jeweller lists their pieces, hours and how to reach them." />
      <Directory />
    </>
  );
}
