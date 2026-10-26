import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { Prose } from "@/components/Prose";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "For jewellers" };

export default function ForJewellers() {
  return (
    <Prose title="For jewellers" intro="Bring your designs to customers across the UAE. They find the piece here, then contact you and buy in your shop.">
      <h2>How it works</h2>
      <p>You list pieces with a photograph, purity, weight and a price, or mark them price on request. Each listing shows your shop, area and contact buttons. Customers message or call you directly.</p>
      <h2>What we do not do</h2>
      <p>No checkout, no online payment, no deposits and no commission on sales. The sale is between you and the customer, in your shop.</p>
      <h2>Register your interest</h2>
      {site.contactEmail ? (
        <InterestForm />
      ) : (
        <p>Registration is not open yet. This site is a prototype, and the form will appear here once there is an inbox to receive it.</p>
      )}
    </Prose>
  );
}
