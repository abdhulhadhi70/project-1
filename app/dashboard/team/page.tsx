"use client";
import { usePortalShop } from "@/components/portal/PortalShell";
import { TeamPanel } from "@/components/portal/TeamPanel";

export default function Team() {
  const { shop, email } = usePortalShop();
  return <TeamPanel shopId={shop.shopId} canManage={shop.role === "owner"} me={email} />;
}
