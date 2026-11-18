import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";

const PENDIENTE = "[PENDIENTE]";

export default function PrivacidadPage() {
  return (
    <LegalPage
      titleEs="Política de privacidad"
      titleEn="Privacy policy"
      updatedEs="Última actualización: 17 de noviembre de 2026"
      updatedEn="Last updated: 17 November 2026"
      noticeEs={
        <>
          Esta app está en <strong>modo demostración</strong>: el login no verifica contraseñas
          reales y los datos (clientes, obras, presupuestos) se guardan solo en tu navegador,
          no en ningún servidor. Los apartados sobre Appwrite y envío de email describen cómo
          funcionará cuando se conecte el backend real.
        </>
      }
      noticeEn={
        <>
          This app is in <strong>demo mode</strong>: sign-in does not verify real passwords and
          data (clients, projects, quotes) is saved only in your browser, not on any server. The
          sections about Appwrite and email sending describe how it will work once the real
          backend is connected.
        </>
      }
      sectionsEs={[
        {
          heading: "1. Responsable del tratamiento",
          body: (
            <>
              <p>
                Responsable: {PENDIENTE} · NIF: {PENDIENTE} · Domicilio: {PENDIENTE} · Email:{" "}
                {PENDIENTE}
              </p>
            </>
          ),
        },
        {
          heading: "2. Dos papeles distintos frente a tus datos",
          body: (
            <>
              <p>
                Presurapi actúa como <strong>responsable del tratamiento</strong> de los datos
                de tu propia cuenta (email, datos de empresa, tarifas) y como{" "}
                <strong>encargado del tratamiento</strong> respecto a los datos de tus clientes
                y obras que tú introduces en la app: esos datos son tuyos, los tratamos
                únicamente para prestarte el servicio y nunca los usamos con fines propios.
              </p>
            </>
          ),
        },
        {
          heading: "3. Qué datos tratamos y con qué finalidad",
          body: (
            <ul className="list-disc pl-5">
              <li>Cuenta: email, para identificarte y comunicarte cuestiones del servicio.</li>
              <li>
                Empresa: nombre, NIF, dirección, teléfono, email y logo, para incluirlos en tus
                presupuestos en PDF.
              </li>
              <li>
                Clientes y obras que registras: para generar tus presupuestos; son datos de
                terceros que tú nos facilitas bajo tu responsabilidad como usuario profesional.
              </li>
              <li>Preferencias: idioma y modo claro/oscuro.</li>
            </ul>
          ),
        },
        {
          heading: "4. Legitimación",
          body: (
            <p>
              Ejecución del contrato de prestación del servicio y, en su caso, tu
              consentimiento (por ejemplo, para cookies de preferencia no necesarias).
            </p>
          ),
        },
        {
          heading: "5. Destinatarios y encargados",
          body: (
            <ul className="list-disc pl-5">
              <li>
                Appwrite (base de datos, autenticación y almacenamiento): se usará cuando se
                conecte el proyecto real; mientras tanto no se envía ningún dato a Appwrite.
              </li>
              <li>
                Resend (envío de emails con el PDF del presupuesto): se activará cuando el
                usuario configure su propia clave y dominio.
              </li>
              <li>Vercel: aloja y sirve la aplicación.</li>
              <li>No se cede ningún dato a terceros con fines publicitarios.</li>
            </ul>
          ),
        },
        {
          heading: "6. Plazo de conservación",
          body: (
            <p>
              Mientras mantengas tu cuenta activa. En modo demostración, mientras no borres los
              datos de tu navegador o uses la opción de borrar cuenta.
            </p>
          ),
        },
        {
          heading: "7. Tus derechos: acceso, exportar y borrar tu cuenta",
          body: (
            <p>
              Tienes derecho a acceder, rectificar, suprimir, portar, limitar y oponerte al
              tratamiento de tus datos. Desde{" "}
              <Link href="/panel/ajustes" className="text-(--color-brass) hover:underline">
                Ajustes
              </Link>{" "}
              puedes exportar todos tus datos en un fichero y borrar tu cuenta por completo en
              cualquier momento, sin necesidad de pedírnoslo. Para cualquier otra solicitud,
              escribe a {PENDIENTE}.
            </p>
          ),
        },
        {
          heading: "8. Seguridad",
          body: (
            <p>
              El acceso a cada dato se restringe por usuario (permisos por documento a nivel de
              base de datos cuando Appwrite esté conectado), las conexiones viajan cifradas
              (HTTPS) y aplicamos cabeceras de seguridad conforme a buenas prácticas OWASP.
            </p>
          ),
        },
        {
          heading: "9. Cambios en esta política",
          body: (
            <p>
              Podemos actualizar esta política para reflejar cambios legales o del servicio; la
              fecha de la última actualización aparece arriba.
            </p>
          ),
        },
      ]}
      sectionsEn={[
        {
          heading: "1. Data controller",
          body: (
            <p>
              Controller: {PENDIENTE} · Tax ID: {PENDIENTE} · Address: {PENDIENTE} · Email:{" "}
              {PENDIENTE}
            </p>
          ),
        },
        {
          heading: "2. Two different roles regarding your data",
          body: (
            <p>
              Presurapi acts as <strong>data controller</strong> for your own account data
              (email, company details, rates) and as <strong>data processor</strong> for your
              clients&apos; and projects&apos; data that you enter into the app: that data is
              yours, we process it only to provide the service, and never use it for our own
              purposes.
            </p>
          ),
        },
        {
          heading: "3. What data we process and why",
          body: (
            <ul className="list-disc pl-5">
              <li>Account: email, to identify you and contact you about the service.</li>
              <li>
                Company: name, tax ID, address, phone, email and logo, to include in your PDF
                quotes.
              </li>
              <li>
                Clients and projects you register: to generate your quotes; this is
                third-party data you provide under your own responsibility as a professional
                user.
              </li>
              <li>Preferences: language and light/dark mode.</li>
            </ul>
          ),
        },
        {
          heading: "4. Legal basis",
          body: (
            <p>
              Performance of the service contract and, where applicable, your consent (e.g.
              for non-essential preference cookies).
            </p>
          ),
        },
        {
          heading: "5. Recipients and processors",
          body: (
            <ul className="list-disc pl-5">
              <li>
                Appwrite (database, authentication and storage): will be used once the real
                project is connected; no data is sent to Appwrite in the meantime.
              </li>
              <li>
                Resend (emailing the quote PDF): activated once the user configures their own
                key and domain.
              </li>
              <li>Vercel: hosts and serves the application.</li>
              <li>No data is shared with third parties for advertising purposes.</li>
            </ul>
          ),
        },
        {
          heading: "6. Retention period",
          body: (
            <p>
              For as long as your account remains active. In demo mode, until you clear your
              browser data or use the delete-account option.
            </p>
          ),
        },
        {
          heading: "7. Your rights: access, export and delete your account",
          body: (
            <p>
              You have the right to access, rectify, erase, port, restrict and object to the
              processing of your data. From{" "}
              <Link href="/panel/ajustes" className="text-(--color-brass) hover:underline">
                Settings
              </Link>{" "}
              you can export all your data to a file and delete your account entirely at any
              time, without having to ask us. For any other request, write to {PENDIENTE}.
            </p>
          ),
        },
        {
          heading: "8. Security",
          body: (
            <p>
              Access to each piece of data is restricted per user (database-level document
              permissions once Appwrite is connected), connections are encrypted (HTTPS), and
              we apply security headers following OWASP good practice.
            </p>
          ),
        },
        {
          heading: "9. Changes to this policy",
          body: (
            <p>
              We may update this policy to reflect legal or service changes; the last-updated
              date appears above.
            </p>
          ),
        },
      ]}
    />
  );
}
