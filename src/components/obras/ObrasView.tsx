"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createObraAction, updateObraAction, deleteObraAction } from "@/app/acciones/obras";
import { useT } from "@/components/PrefsProvider";
import { IconPlus } from "@/components/Icons";

type ObraItem = {
  id: string;
  nombre: string;
  direccion: string;
  estado: string;
  clienteId: string;
  clienteNombre: string;
};

type ClienteOpt = {
  id: string;
  nombre: string;
};

export function ObrasView({
  obras,
  clientes,
}: {
  obras: ObraItem[];
  clientes: ClienteOpt[];
}) {
  const { t } = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ObraItem | null>(null);

  const boundAction = editing
    ? updateObraAction.bind(null, editing.id)
    : createObraAction;

  const [state, formAction, isPending] = useActionState(boundAction, null);

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("common.confirmDelete"))) return;
    await deleteObraAction(id);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "en_curso":
        return <span className="badge badge-ok">{t("works.status.active")}</span>;
      case "terminada":
        return <span className="badge badge-info">{t("works.status.finished")}</span>;
      case "cancelada":
        return <span className="badge badge-warn">{t("works.status.cancelled")}</span>;
      default:
        return <span className="badge">{t("works.status.pending")}</span>;
    }
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{t("works.title")}</h1>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <IconPlus />
          <span>{t("works.new")}</span>
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="alert alert-info" role="status">
          {t("works.needClient")}{" "}
          <Link href="/panel/clientes" style={{ fontWeight: 600 }}>
            {t("home.addClient")} →
          </Link>
        </div>
      ) : null}

      {obras.length === 0 ? (
        <div className="card empty">
          <h2>{t("works.empty")}</h2>
          <p>{t("works.emptyText")}</p>
          {clientes.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <IconPlus />
              <span>{t("works.new")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {obras.map((o) => (
            <div key={o.id} className="card list-item">
              <div>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{o.nombre}</h3>
                  {getStatusBadge(o.estado)}
                </div>
                <div className="row" style={{ gap: 12, marginTop: 6, fontSize: "0.85rem" }}>
                  <span className="muted">👤 {o.clienteNombre}</span>
                  {o.direccion && <span className="muted">📍 {o.direccion}</span>}
                </div>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(o);
                    setModalOpen(true);
                  }}
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: "var(--danger)" }}
                  onClick={() => handleDelete(o.id)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog accesible para Crear / Editar Obra */}
      {modalOpen && (
        <div
          className="tour-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="tour-card rise"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-obra-title"
            style={{ maxWidth: 520 }}
          >
            <h2 id="modal-obra-title">
              {editing ? t("works.edit") : t("works.new")}
            </h2>

            {state?.generalError && (
              <div className="alert alert-error" role="alert">
                {t(state.generalError as any)}
              </div>
            )}

            <form
              action={async (formData) => {
                await formAction(formData);
                handleClose();
              }}
              className="stack"
              noValidate
            >
              <div className="field">
                <label htmlFor="o-cliente">{t("works.client")}</label>
                <select
                  id="o-cliente"
                  name="clienteId"
                  required
                  defaultValue={editing?.clienteId || ""}
                  className="select"
                  aria-invalid={Boolean(state?.errors?.clienteId)}
                >
                  <option value="" disabled>
                    -- {t("works.selectClient")} --
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {state?.errors?.clienteId && (
                  <span className="field-error">{t(state.errors.clienteId as any)}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="o-nombre">{t("works.name")}</label>
                <input
                  id="o-nombre"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej. Reforma Integral de Baño"
                  defaultValue={editing?.nombre || ""}
                  className="input"
                  aria-invalid={Boolean(state?.errors?.nombre)}
                />
                {state?.errors?.nombre && (
                  <span className="field-error">{t(state.errors.nombre as any)}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="o-dir">{t("works.address")}</label>
                <input
                  id="o-dir"
                  name="direccion"
                  type="text"
                  defaultValue={editing?.direccion || ""}
                  className="input"
                />
              </div>

              <div className="field">
                <label htmlFor="o-estado">{t("works.status")}</label>
                <select
                  id="o-estado"
                  name="estado"
                  defaultValue={editing?.estado || "pendiente"}
                  className="select"
                >
                  <option value="pendiente">{t("works.status.pending")}</option>
                  <option value="en_curso">{t("works.status.active")}</option>
                  <option value="terminada">{t("works.status.finished")}</option>
                  <option value="cancelada">{t("works.status.cancelled")}</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="o-notas">{t("works.notes")}</label>
                <textarea
                  id="o-notas"
                  name="notas"
                  rows={2}
                  className="textarea"
                />
              </div>

              <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
