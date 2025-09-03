import React from "react";

const LegalPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          📜 Aviso Legal
        </h1>

        <section className="mb-6">
          <p className="text-gray-700 mb-2">
            En cumplimiento con el deber de información recogido en el artículo 10
            de la Ley 34/2002, de Servicios de la Sociedad de la Información y del
            Comercio Electrónico, se informa lo siguiente:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <span className="font-semibold">Titular:</span> Victoria Vera Cañete
            </li>
            <li>
              <span className="font-semibold">Email de contacto:</span>{" "}
              <a
                href="mailto:vvera.imp@gmail.com"
                className="text-blue-700 hover:underline"
              >
                vvera.imp@gmail.com
              </a>
            </li>
            <li>
              <span className="font-semibold">Sitio web:</span>{" "}
              <a
                href="https://mioptidata.com"
                className="text-blue-700 hover:underline"
              >
                mioptidata.com
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🎯 Objeto del sitio web
          </h2>
          <p className="text-gray-700">
            Este sitio web ha sido creado como proyecto personal sin ánimo de
            lucro. Su finalidad es ofrecer a los usuarios registrados un espacio
            donde guardar sus recetas ópticas de forma privada y accesible.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ⚖️ Responsabilidad
          </h2>
          <p className="text-gray-700">
            El titular no se hace responsable del mal uso de los contenidos de
            esta web. Asimismo, se reserva el derecho de modificar en cualquier
            momento los contenidos existentes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🖋️ Propiedad intelectual
          </h2>
          <p className="text-gray-700">
            Los contenidos del sitio web (textos, imágenes, diseño, etc.) son
            propiedad del titular, salvo que se indique lo contrario. Queda
            prohibida su reproducción sin autorización expresa.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🔐 Protección de datos
          </h2>
          <p className="text-gray-700">
            Este sitio cumple con el Reglamento General de Protección de Datos
            (UE) 2016/679 y la Ley Orgánica 3/2018 (LOPDGDD). Consulta nuestra{" "}
            <a href="/privacy" className="text-blue-700 hover:underline">
              Política de Privacidad
            </a>{" "}
            para más detalles.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            📌 Ley aplicable y jurisdicción
          </h2>
          <p className="text-gray-700">
            Este aviso legal se rige por la legislación española. Para la
            resolución de conflictos, las partes se someterán a los juzgados y
            tribunales del domicilio del usuario.
          </p>
        </section>

        <p className="text-gray-500 text-sm mt-6 text-right">
          Fecha de última actualización: 01/09/2025
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
