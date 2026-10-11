import type { Metadata } from "next";
import Link from "next/link";
import { Tools } from "@/components/Tools";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("legal.cookies.title") };
}

export default function CookiesPage() {
  return (
    <div style={{ minHeight: "100dvh" }}>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">P</span>
          <span>Presurapi</span>
        </Link>
        <Tools withTour={false} />
      </header>

      <main className="content" style={{ maxWidth: 800, padding: "40px 16px" }}>
        <h1 style={{ marginBottom: 12 }}>
          <T k="legal.cookies.title" />
        </h1>

        <div className="alert alert-info" role="note" style={{ marginBottom: 24 }}>
          <T k="legal.draft" />
        </div>

        <div className="card stack">
          <p><T k="legal.cookies.p1" /></p>
          <p><T k="legal.cookies.p2" /></p>
          <p><T k="legal.cookies.p3" /></p>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/" className="btn btn-secondary">
            ← <T k="common.back" />
          </Link>
        </div>
      </main>
    </div>
  );
}
