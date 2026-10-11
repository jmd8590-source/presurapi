import Link from "next/link";
import { T } from "@/components/T";

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="card auth-card rise" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>404</h1>
        <h2><T k="notfound.title" /></h2>
        <p className="muted"><T k="notfound.text" /></p>
        <div style={{ marginTop: 20 }}>
          <Link href="/" className="btn btn-primary">
            <T k="notfound.home" />
          </Link>
        </div>
      </div>
    </main>
  );
}
