import type { Metadata } from "next";
import { AdminPortal } from "@/components/portal/PortalShell";

export const metadata: Metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortal>{children}</AdminPortal>;
}
