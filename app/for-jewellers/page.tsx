import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "For jewellers" };

export default function ForJewellers() {
  return (
    <Prose title="For jewellers" intro="Bring your designs to customers across the UAE. They find the piece here, then contact you and buy in your shop.">
      <h2>How it works</h2>
      <p>You list pieces from your phone: photos, purity, weight and making charge, with a price from the day&apos;s gold rate, a price you set, or price on request. Each listing shows your shop, area and contact buttons, and customers message, call or ask to visit.</p>
      <p>Your portal shows how many people viewed your pieces and tapped to contact you each month, and one tap confirms your stock is still in the shop.</p>
      <h2>What we do not do</h2>
      <p>No checkout, no online payment, no deposits and no commission on sales. The sale is between you and the customer, in your shop.</p>
      <h2>Register your interest</h2>
      <InterestForm />
    </Prose>
  );
}
