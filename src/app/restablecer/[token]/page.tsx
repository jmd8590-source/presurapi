import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/auth/ResetForm";
import { Tools } from "@/components/Tools";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("auth.reset.title") };
}

export default async function RestablecerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

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
            <T k="auth.reset.title" />
          </h1>
        </div>

        <ResetForm token={token} />
      </div>
    </main>
  );
}
