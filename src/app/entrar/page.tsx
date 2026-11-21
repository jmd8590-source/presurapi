import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <AuthShell titleKey="auth.loginTitle">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
