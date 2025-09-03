import React from "react";

const PrivacyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          🔐 Política de Privacidad
        </h1>

        {/* 1. Responsable */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Responsable del tratamiento
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <span className="font-semibold">Titular:</span> Victoria Vera
              Cañete
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
              <span className="font-semibold">Finalidad:</span> Gestionar el
              registro de usuarios y permitir el almacenamiento de recetas
              ópticas de forma privada.
            </li>
          </ul>
        </section>

        {/* 2. Qué datos se recogen */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Qué datos se recogen
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Correo electrónico</li>
            <li>
              Recetas ópticas u otra información que el usuario introduzca
              voluntariamente
            </li>
          </ul>
        </section>

        {/* 3. Finalidad */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Finalidad del tratamiento
          </h2>
          <p className="text-gray-700 mb-2">
            Los datos son recogidos con el único fin de ofrecer al usuario un
            espacio personal donde guardar sus recetas ópticas.
          </p>
          <p className="text-gray-700">
            No se realizan cesiones a terceros. No se utilizan con fines
            comerciales ni publicitarios.
          </p>
        </section>

        {/* 4. Base legal */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Base legal
          </h2>
          <p className="text-gray-700">
            La base legal para el tratamiento es el consentimiento del usuario al
            registrarse y utilizar la plataforma.
          </p>
        </section>

        {/* 5. Conservación */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Conservación de los datos
          </h2>
          <p className="text-gray-700">
            Los datos serán almacenados mientras el usuario mantenga su cuenta
            activa. El usuario puede solicitar la eliminación de sus datos en
            cualquier momento.
          </p>
        </section>

        {/* 6. Derechos */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. Derechos de los usuarios
          </h2>
          <p className="text-gray-700 mb-2">Los usuarios pueden ejercer los siguientes derechos:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Acceder a sus datos</li>
            <li>Rectificarlos</li>
            <li>Suprimirlos</li>
            <li>Limitar u oponerse al tratamiento</li>
            <li>Portabilidad de los datos</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Para ejercer estos derechos, pueden contactar al email indicado
            anteriormente.
          </p>
        </section>

        {/* 7. Medidas de seguridad */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Medidas de seguridad
          </h2>
          <p className="text-gray-700">
            Se han implementado medidas técnicas y organizativas para proteger
            los datos personales contra accesos no autorizados, pérdida o
            destrucción.
          </p>
        </section>

        {/* 8. Cambios */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            8. Cambios en la política
          </h2>
          <p className="text-gray-700">
            Esta política puede actualizarse ocasionalmente. Cualquier cambio
            será notificado en esta misma página.
          </p>
        </section>

        <p className="text-gray-500 text-sm mt-6 text-right">
          Fecha de última actualización: 01/09/2025
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
