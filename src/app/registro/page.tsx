import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Tools } from "@/components/Tools";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("auth.register.title") };
}

export default async function RegistroPage() {
  return (
    <main className="auth-page">
      <div className="auth-tools">
        <Tools withTour={false} />
      </div>

      <div className="card auth-card rise">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" className="brand" style={{ justifyContent: "center" }}>
            <span className="brand-mark">P</span>
            <span>Presurapi</span>
          </Link>
          <h1 style={{ marginTop: 16, marginBottom: 8, fontSize: "1.45rem" }}>
            <T k="auth.register.title" />
          </h1>
          <p className="muted" style={{ fontSize: "0.95rem" }}>
            <T k="auth.register.intro" />
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
