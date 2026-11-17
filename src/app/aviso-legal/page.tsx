import LegalPage from "@/components/legal/LegalPage";

const PENDIENTE = "[PENDIENTE]";

export default function AvisoLegalPage() {
  return (
    <LegalPage
      titleEs="Aviso legal"
      titleEn="Legal notice"
      updatedEs="Última actualización: 17 de noviembre de 2026"
      updatedEn="Last updated: 17 November 2026"
      noticeEs={
        <>
          Los campos marcados como <strong>{PENDIENTE}</strong> están pendientes de que el
          titular del servicio aporte sus datos reales antes de publicar la app. Este texto no
          sustituye el asesoramiento de un abogado.
        </>
      }
      noticeEn={
        <>
          Fields marked <strong>{PENDIENTE}</strong> are pending the service owner providing
          their real details before the app goes live. This text does not replace legal advice.
        </>
      }
      sectionsEs={[
        {
          heading: "1. Datos identificativos",
          body: (
            <ul className="list-disc pl-5">
              <li>Titular: {PENDIENTE}</li>
              <li>NIF/CIF: {PENDIENTE}</li>
              <li>Domicilio: {PENDIENTE}</li>
              <li>Email de contacto: {PENDIENTE}</li>
              <li>Inscripción registral (si procede): {PENDIENTE}</li>
            </ul>
          ),
        },
        {
          heading: "2. Objeto",
          body: (
            <p>
              Presurapi es una aplicación web que ayuda a albañiles y pequeñas empresas de
              reforma de España a elaborar presupuestos de obra. El acceso y uso del sitio
              atribuye la condición de usuario y supone la aceptación de este aviso legal.
            </p>
          ),
        },
        {
          heading: "3. Condiciones de uso",
          body: (
            <p>
              El usuario se compromete a utilizar el sitio y sus contenidos de conformidad con
              la ley, la moral y el orden público, y a no emplearlo con fines ilícitos o
              lesivos para los derechos de terceros. Los precios del banco de precios son
              orientativos y nunca se presentan como exactos; el usuario es responsable de
              verificar y, en su caso, ajustar los precios y presupuestos antes de entregarlos
              a sus clientes.
            </p>
          ),
        },
        {
          heading: "4. Propiedad intelectual e industrial",
          body: (
            <p>
              El diseño, la marca, el código y los contenidos propios de Presurapi están
              protegidos por derechos de propiedad intelectual e industrial. Queda prohibida su
              reproducción, distribución o transformación sin autorización expresa, salvo lo
              estrictamente necesario para el uso normal del servicio. Los datos, clientes,
              obras y presupuestos que cada usuario introduce son de su propiedad.
            </p>
          ),
        },
        {
          heading: "5. Exclusión de responsabilidad",
          body: (
            <p>
              Presurapi no garantiza la exactitud, vigencia ni exhaustividad de los precios de
              materiales ni de las mediciones calculadas por el asistente; son una ayuda de
              cálculo, no una tasación profesional. El titular no se hace responsable de los
              presupuestos finalmente emitidos por los usuarios a sus clientes.
            </p>
          ),
        },
        {
          heading: "6. Legislación aplicable",
          body: (
            <p>
              Este aviso legal se rige por la legislación española. Para cualquier controversia
              derivada del acceso o uso del sitio, las partes se someten a los juzgados y
              tribunales que correspondan conforme a la normativa de protección de
              consumidores y usuarios aplicable.
            </p>
          ),
        },
      ]}
      sectionsEn={[
        {
          heading: "1. Identifying information",
          body: (
            <ul className="list-disc pl-5">
              <li>Owner: {PENDIENTE}</li>
              <li>Tax ID: {PENDIENTE}</li>
              <li>Address: {PENDIENTE}</li>
              <li>Contact email: {PENDIENTE}</li>
              <li>Registry entry (if applicable): {PENDIENTE}</li>
            </ul>
          ),
        },
        {
          heading: "2. Purpose",
          body: (
            <p>
              Presurapi is a web application that helps builders and small renovation
              businesses in Spain prepare construction quotes. Accessing and using the site
              makes you a user and means you accept this legal notice.
            </p>
          ),
        },
        {
          heading: "3. Terms of use",
          body: (
            <p>
              Users agree to use the site and its content in accordance with the law, morality
              and public order, and not to use it for unlawful purposes or in ways that harm
              third-party rights. Prices in the price list are guideline figures and are never
              presented as exact; users are responsible for checking and adjusting prices and
              quotes before sending them to their own clients.
            </p>
          ),
        },
        {
          heading: "4. Intellectual and industrial property",
          body: (
            <p>
              Presurapi&apos;s design, brand, code and original content are protected by
              intellectual and industrial property rights. Reproduction, distribution or
              transformation without express authorisation is prohibited, except as strictly
              necessary for normal use of the service. The clients, projects and quotes each
              user enters belong to them.
            </p>
          ),
        },
        {
          heading: "5. Disclaimer",
          body: (
            <p>
              Presurapi does not guarantee the accuracy, currency or completeness of material
              prices or measurements calculated by the assistant; they are a calculation aid,
              not a professional appraisal. The owner is not responsible for quotes ultimately
              issued by users to their own clients.
            </p>
          ),
        },
        {
          heading: "6. Applicable law",
          body: (
            <p>
              This legal notice is governed by Spanish law. Any dispute arising from access to
              or use of the site will be subject to the competent courts under applicable
              consumer protection law.
            </p>
          ),
        },
      ]}
    />
  );
}
