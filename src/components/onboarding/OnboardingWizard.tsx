"use client";

import { useActionState, useState } from "react";
import { saveOnboardingAction } from "@/app/acciones/empresa";
import { useT } from "@/components/PrefsProvider";

export function OnboardingWizard({ initialData }: { initialData?: any }) {
  const { t } = useT();
  const [step, setStep] = useState(1);
  const [state, formAction, isPending] = useActionState(saveOnboardingAction, null);

  return (
    <form action={formAction} className="stack" encType="multipart/form-data" noValidate>
      <div className="steps" aria-hidden="true">
        <span className={step >= 1 ? "on" : ""} />
        <span className={step >= 2 ? "on" : ""} />
        <span className={step >= 3 ? "on" : ""} />
      </div>

      <p className="muted" style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>
        {t("onb.step", { n: step, total: 3 })}
      </p>

      {state?.generalError && (
        <div className="alert alert-error" role="alert">
          {t(state.generalError as any)}
        </div>
      )}

      {/* PASO 1: TU EMPRESA */}
      <div style={{ display: step === 1 ? "contents" : "none" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{t("onb.s1.title")}</h2>

        <div className="field">
          <label htmlFor="nombre">{t("onb.company")}</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            defaultValue={initialData?.nombre || ""}
            className="input"
            aria-invalid={Boolean(state?.errors?.nombre)}
            aria-describedby={state?.errors?.nombre ? "nombre-err" : undefined}
          />
          {state?.errors?.nombre && (
            <span id="nombre-err" className="field-error">
              {t(state.errors.nombre as any)}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="cif">{t("onb.cif")}</label>
          <input
            id="cif"
            name="cif"
            type="text"
            required
            placeholder="B12345678 / 12345678Z"
            defaultValue={initialData?.cif || ""}
            className="input"
            aria-invalid={Boolean(state?.errors?.cif)}
            aria-describedby={state?.errors?.cif ? "cif-err" : undefined}
          />
          {state?.errors?.cif && (
            <span id="cif-err" className="field-error">
              {t(state.errors.cif as any)}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="logo">{t("onb.logo")}</label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="input"
            style={{ padding: "8px" }}
          />
          <span className="hint">{t("onb.logoHint")}</span>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
            {t("common.next")} →
          </button>
        </div>
      </div>

      {/* PASO 2: CONTACTO Y DIRECCIÓN */}
      <div style={{ display: step === 2 ? "contents" : "none" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{t("onb.s2.title")}</h2>

        <div className="field">
          <label htmlFor="direccion">{t("onb.address")}</label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            required
            defaultValue={initialData?.direccion || ""}
            className="input"
            aria-invalid={Boolean(state?.errors?.direccion)}
          />
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="cp">{t("onb.postal")}</label>
            <input
              id="cp"
              name="cp"
              type="text"
              defaultValue={initialData?.cp || ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="poblacion">{t("onb.city")}</label>
            <input
              id="poblacion"
              name="poblacion"
              type="text"
              defaultValue={initialData?.poblacion || ""}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="provincia">{t("onb.province")}</label>
            <input
              id="provincia"
              name="provincia"
              type="text"
              defaultValue={initialData?.provincia || ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="telefono">{t("onb.phone")}</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              defaultValue={initialData?.telefono || ""}
              className="input"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="emailContacto">{t("onb.contactEmail")}</label>
          <input
            id="emailContacto"
            name="emailContacto"
            type="email"
            defaultValue={initialData?.emailContacto || ""}
            className="input"
          />
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
            ← {t("common.back")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
            {t("common.next")} →
          </button>
        </div>
      </div>

      {/* PASO 3: PRESUPUESTOS Y CONDICIONES */}
      <div style={{ display: step === 3 ? "contents" : "none" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{t("onb.s3.title")}</h2>

        <div className="field">
          <label htmlFor="ivaPct">{t("onb.vat")}</label>
          <input
            id="ivaPct"
            name="ivaPct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            required
            defaultValue={initialData?.ivaPct ?? 21}
            className="input"
            style={{ maxWidth: 140 }}
          />
        </div>

        <div className="field">
          <label htmlFor="condiciones">{t("onb.terms")}</label>
          <textarea
            id="condiciones"
            name="condiciones"
            rows={4}
            defaultValue={initialData?.condiciones || "Forma de pago: 40% al inicio, 40% a mitad de obra, 20% a la finalización. Plazo de validez de la oferta: 15 días."}
            className="textarea"
          />
          <span className="hint">{t("onb.termsHint")}</span>
        </div>

        <div className="field">
          <label htmlFor="piePdf">{t("onb.footer")}</label>
          <input
            id="piePdf"
            name="piePdf"
            type="text"
            defaultValue={initialData?.piePdf || "Gracias por confiar en nosotros."}
            className="input"
          />
          <span className="hint">{t("onb.footerHint")}</span>
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
            ← {t("common.back")}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? t("common.saving") : t("common.finish")} ✓
          </button>
        </div>
      </div>
    </form>
  );
}
