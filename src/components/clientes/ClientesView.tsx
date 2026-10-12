"use client";

import { useActionState, useState } from "react";
import { createClienteAction, updateClienteAction, deleteClienteAction } from "@/app/acciones/clientes";
import { useT } from "@/components/PrefsProvider";
import { IconPlus, IconPhone, IconMail } from "@/components/Icons";

type ClienteItem = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  obras: number;
};

export function ClientesView({ clientes }: { clientes: ClienteItem[] }) {
  const { t } = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boundAction = editing
    ? updateClienteAction.bind(null, editing.id)
    : createClienteAction;

  const [state, formAction, isPending] = useActionState(boundAction, null);

  // Cerrar modal al guardar con éxito
  const handleSuccessClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("common.confirmDelete"))) return;
    setDeleteError(null);
    const res = await deleteClienteAction(id);
    if (!res.ok && res.errorKey) {
      setDeleteError(t(res.errorKey as any));
    }
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{t("clients.title")}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t("clients.privacyNote")}
          </p>
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
          <span>{t("clients.new")}</span>
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-error" role="alert">
          {deleteError}
        </div>
      )}

      {clientes.length === 0 ? (
        <div className="card empty">
          <h2>{t("clients.empty")}</h2>
          <p>{t("clients.emptyText")}</p>
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
            <span>{t("clients.new")}</span>
          </button>
        </div>
      ) : (
        <div className="grid">
          {clientes.map((c) => (
            <div key={c.id} className="card list-item">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{c.nombre}</h3>
                <div className="row" style={{ gap: 12, marginTop: 4, fontSize: "0.85rem" }}>
                  {c.telefono && <span className="muted inline-icon"><IconPhone /> {c.telefono}</span>}
                  {c.email && <span className="muted inline-icon"><IconMail /> {c.email}</span>}
                  <span className="badge badge-info">
                    {t("clients.worksCount", { n: c.obras })}
                  </span>
                </div>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(c);
                    setModalOpen(true);
                  }}
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: "var(--danger)" }}
                  onClick={() => handleDelete(c.id)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog accesible para Crear / Editar */}
      {modalOpen && (
        <div
          className="tour-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && handleSuccessClose()}
        >
          <div
            className="tour-card rise"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{ maxWidth: 520 }}
          >
            <h2 id="modal-title">
              {editing ? t("clients.edit") : t("clients.new")}
            </h2>

            {state?.generalError && (
              <div className="alert alert-error" role="alert">
                {t(state.generalError as any)}
              </div>
            )}

            <form
              action={async (formData) => {
                await formAction(formData);
                handleSuccessClose();
              }}
              className="stack"
              noValidate
            >
              <div className="field">
                <label htmlFor="c-nombre">{t("clients.name")}</label>
                <input
                  id="c-nombre"
                  name="nombre"
                  type="text"
                  required
                  defaultValue={editing?.nombre || ""}
                  className="input"
                  aria-invalid={Boolean(state?.errors?.nombre)}
                />
                {state?.errors?.nombre && (
                  <span className="field-error">{t(state.errors.nombre as any)}</span>
                )}
              </div>

              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="c-nif">{t("clients.nif")}</label>
                  <input
                    id="c-nif"
                    name="nif"
                    type="text"
                    className="input"
                  />
                </div>
                <div className="field">
                  <label htmlFor="c-tel">{t("clients.phone")}</label>
                  <input
                    id="c-tel"
                    name="telefono"
                    type="tel"
                    defaultValue={editing?.telefono || ""}
                    className="input"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="c-email">{t("clients.email")}</label>
                <input
                  id="c-email"
                  name="email"
                  type="email"
                  defaultValue={editing?.email || ""}
                  className="input"
                />
              </div>

              <div className="field">
                <label htmlFor="c-dir">{t("clients.address")}</label>
                <input
                  id="c-dir"
                  name="direccion"
                  type="text"
                  className="input"
                />
              </div>

              <div className="field">
                <label htmlFor="c-notas">{t("clients.notes")}</label>
                <textarea
                  id="c-notas"
                  name="notas"
                  rows={2}
                  className="textarea"
                />
              </div>

              <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSuccessClose}
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
