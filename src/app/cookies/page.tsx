import type { Metadata } from "next";
import CookiesPageContent from "@/components/legal/CookiesPageContent";

export const metadata: Metadata = { title: "Política de cookies" };

export default function CookiesPage() {
  return <CookiesPageContent />;
}
