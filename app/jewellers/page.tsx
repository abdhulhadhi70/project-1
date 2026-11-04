import type { Metadata } from "next";
import { Directory } from "@/components/jewellers/Directory";

export const metadata: Metadata = { title: "Find a jeweller", description: "Jewellers across Dubai, Abu Dhabi and Sharjah, by area and language spoken." };

export default function JewellersPage() {
  return (
    <>
      <section className="page page-x pt-8 md:pt-12">
        <h1 className="font-serif text-[36px] leading-none tracking-[-0.015em] md:text-[48px]">Find a jeweller</h1>
        <p className="mt-3 max-w-xl text-[15px] text-ink-soft">Search by name, area or the language you would like to be served in. Every jeweller lists their pieces, hours and how to reach them.</p>
      </section>
      <Directory />
    </>
  );
}
