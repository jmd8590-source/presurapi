import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Tools } from "@/components/Tools";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("onb.title") };
}

export default async function BienvenidaPage() {
  const session = await requireSession();

  return (
    <main className="auth-page">
      <div className="auth-tools">
        <Tools withTour={false} />
      </div>

      <div className="card auth-card rise" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ marginBottom: 6, fontSize: "1.45rem" }}>
            <T k="onb.title" />
          </h1>
          <p className="muted" style={{ fontSize: "0.95rem" }}>
            <T k="onb.intro" />
          </p>
        </div>

        <OnboardingWizard initialData={session.empresa} />
      </div>
    </main>
  );
}
