"use client";

import Link from "next/link";
import { Tools } from "@/components/Tools";
import { UserDropdown } from "./UserDropdown";
import { IconPlus } from "@/components/Icons";

interface TopbarProps {
  usuario?: {
    nombre: string;
    email: string;
  };
  empresa?: {
    nombre: string;
  };
}

export function Topbar({ usuario, empresa }: TopbarProps) {
  return (
    <header className="topbar">
      <Link href="/panel" className="brand mobile-only">
        <span className="brand-mark">P</span>
        <span>Presurapi</span>
      </Link>

      <div className="topbar-actions mobile-hide">
        <Link href="/panel/presupuestos/nuevo" className="btn btn-primary btn-sm-glow">
          <IconPlus />
          <span>Nuevo Presupuesto</span>
        </Link>
      </div>

      <div className="topbar-tools">
        <Tools withTour={true} />
        {usuario && empresa && (
          <UserDropdown
            usuarioNombre={usuario.nombre}
            usuarioEmail={usuario.email}
            empresaNombre={empresa.nombre}
          />
        )}
      </div>
    </header>
  );
}
