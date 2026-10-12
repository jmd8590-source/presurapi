"use client";

import { useState, useRef, useEffect } from "react";
import { IconDots, IconDownload, IconLink, IconCopy, IconTrash } from "@/components/Icons";
import { useT } from "@/components/PrefsProvider";

interface PresupuestoDropdownProps {
  id: string;
  onCopiarEnlace: () => void;
  onDuplicar: () => void;
  onEliminar: () => void;
  isPending: boolean;
}

export function PresupuestoDropdown({
  id,
  onCopiarEnlace,
  onDuplicar,
  onEliminar,
  isPending,
}: PresupuestoDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useT();

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

  return (
    <div className="dropdown-container" ref={ref}>
      <button
        type="button"
        className="icon-btn action-dots-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Más opciones"
        disabled={isPending}
      >
        <IconDots />
      </button>

      {open && (
        <div className="dropdown-menu dropdown-menu-right animate-dropdown" role="menu">
          <a
            href={`/panel/presupuestos/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <IconDownload />
            <span>Descargar PDF</span>
          </a>

          <button
            type="button"
            className="dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCopiarEnlace();
            }}
          >
            <IconLink />
            <span>{t("send.copyLink")}</span>
          </button>

          <button
            type="button"
            className="dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDuplicar();
            }}
          >
            <IconCopy />
            <span>{t("quotes.duplicate")}</span>
          </button>

          <div className="dropdown-divider" />

          <button
            type="button"
            className="dropdown-item text-danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEliminar();
            }}
          >
            <IconTrash />
            <span>{t("common.delete")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
