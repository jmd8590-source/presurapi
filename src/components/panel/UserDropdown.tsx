"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/acciones/auth";
import { useT, usePrefs } from "@/components/PrefsProvider";
import { IconSettings, IconLogout, IconMoon, IconSun, IconDatabase, IconCheck } from "@/components/Icons";

interface UserDropdownProps {
  usuarioNombre: string;
  usuarioEmail: string;
  empresaNombre: string;
}

export function UserDropdown({ usuarioNombre, usuarioEmail, empresaNombre }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useT();
  const { theme, toggleTheme, lang, setLang } = usePrefs();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const iniciales = usuarioNombre
    ? usuarioNombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="dropdown-container" ref={ref}>
      <button
        type="button"
        className="user-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={usuarioNombre}
      >
        <span className="user-avatar">{iniciales}</span>
        <span className="user-name-truncate mobile-hide">{usuarioNombre.split(" ")[0]}</span>
        <svg
          className={`chevron-icon ${open ? "rotate-180" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu animate-dropdown" role="menu">
          <div className="dropdown-header">
            <div className="flex items-center gap-3">
              <span className="user-avatar-lg">{iniciales}</span>
              <div style={{ overflow: "hidden" }}>
                <strong style={{ display: "block", fontSize: "0.95rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {usuarioNombre}
                </strong>
                <span className="muted" style={{ fontSize: "0.8rem", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {usuarioEmail}
                </span>
                <span className="badge badge-accent mt-1" style={{ fontSize: "0.72rem" }}>
                  {empresaNombre}
                </span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider" />

          <div className="dropdown-section">
            <Link
              href="/panel/ajustes"
              className="dropdown-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <IconSettings />
              <span>{t("nav.settings")}</span>
            </Link>

            <Link
              href="/panel/banco"
              className="dropdown-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <IconDatabase />
              <span>{t("nav.bank")}</span>
            </Link>
          </div>

          <div className="dropdown-divider" />

          {/* Acciones de Apariencia e Idioma Rápidas */}
          <div className="dropdown-section">
            <button
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => {
                toggleTheme();
              }}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
              <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>

            <button
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => {
                setLang(lang === "es" ? "en" : "es");
              }}
            >
              <span className="inline-flag">{lang === "es" ? "EN" : "ES"}</span>
              <span>{lang === "es" ? "Cambiar a English" : "Cambiar a Español"}</span>
            </button>
          </div>

          <div className="dropdown-divider" />

          <form action={logoutAction} className="dropdown-footer">
            <button
              type="submit"
              className="dropdown-item text-danger"
              role="menuitem"
              style={{ width: "100%", textAlign: "left", background: "transparent", border: 0, cursor: "pointer" }}
            >
              <IconLogout />
              <span>{t("nav.logout")}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
