import type { Metadata } from "next";
import { JewellerPortal } from "@/components/portal/PortalShell";

export const metadata: Metadata = { title: "Jeweller portal" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <JewellerPortal>{children}</JewellerPortal>;
}
