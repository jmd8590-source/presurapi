import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Tools } from "@/components/Tools";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("app.name") + " · " + t("app.tagline") };
}

export default async function HomePage() {
  const session = await getSession();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">P</span>
          <span>Presurapi</span>
        </Link>

        <div className="row" style={{ gap: 12 }}>
          {session ? (
            <Link href="/panel" className="btn btn-secondary">
              <T k="nav.home" /> →
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="btn btn-ghost">
                <T k="auth.goLogin" />
              </Link>
              <Link href="/registro" className="btn btn-primary">
                <T k="auth.signup" />
              </Link>
            </>
          )}
          <Tools withTour={false} />
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section className="hero rise">
          <span className="badge badge-warn" style={{ marginBottom: 16 }}>
            Presupuestos y Obras
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 1.5rem + 2.5vw, 3.2rem)", marginBottom: 16 }}>
            <T k="landing.title" />
          </h1>
          <p className="lead" style={{ marginBottom: 32 }}>
            <T k="landing.lead" />
          </p>

          <div className="row" style={{ justifyContent: "center", gap: 16 }}>
            <Link href={session ? "/panel" : "/registro"} className="btn btn-primary" style={{ minHeight: 48, fontSize: "1.05rem", padding: "0 28px" }}>
              <T k="landing.cta" /> →
            </Link>
          </div>
        </section>

        <section className="features">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
            <div className="card">
              <h3 style={{ fontSize: "1.2rem" }}>⚡ <T k="landing.f1.title" /></h3>
              <p className="muted"><T k="landing.f1.text" /></p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "1.2rem" }}>📄 <T k="landing.f2.title" /></h3>
              <p className="muted"><T k="landing.f2.text" /></p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "1.2rem" }}>🔒 <T k="landing.f3.title" /></h3>
              <p className="muted"><T k="landing.f3.text" /></p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 16px", textAlign: "center", fontSize: "0.875rem", color: "var(--muted)" }}>
        <div className="row" style={{ justifyContent: "center", gap: 20, marginBottom: 8 }}>
          <Link href="/privacidad"><T k="legal.privacy.title" /></Link>
          <Link href="/cookies"><T k="legal.cookies.title" /></Link>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Presurapi. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
