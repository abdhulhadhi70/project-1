import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page page-x py-24 text-center">
      <p className="font-serif text-[36px] leading-tight">This page is not here.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center border border-ink px-5 text-[14px]">Back to the collection</Link>
    </section>
  );
}
