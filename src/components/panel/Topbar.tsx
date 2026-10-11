"use client";

import Link from "next/link";
import { Tools } from "@/components/Tools";

export function Topbar() {
  return (
    <header className="topbar">
      <Link href="/panel" className="brand mobile-only">
        <span className="brand-mark">P</span>
        <span>Presurapi</span>
      </Link>

      <Tools withTour={true} />
    </header>
  );
}
