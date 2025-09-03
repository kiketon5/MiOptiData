import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Login from "../Auth/Login";

const LandingSection = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center py-16 px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Tu visión, siempre contigo
        </h1>
        <p className="text-gray-600 mb-6">
          Guarda tus recetas ópticas de forma segura y accede a ellas cuando
          quieras.
        </p>
        <Link
          to="/register"
          className="inline-block px-6 py-3 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition font-medium mb-0"
        >
          Empieza ahora
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center px-6 py-8">
        <div>
            <span className="text-4xl mb-2 block">📄</span>
            <h3 className="text-lg font-semibold text-gray-900">Historial completo</h3>
            <p className="text-gray-600 mt-1">
            Guarda tus recetas y evolución visual fácilmente
            </p>
        </div>

        <div>
            <span className="text-4xl mb-2 block">🔒</span>
            <h3 className="text-lg font-semibold text-gray-900">Seguridad garantizada</h3>
            <p className="text-gray-600 mt-1">
            Solo tú puedes ver tus datos
            </p>
        </div>

        <div>
            <span className="text-4xl mb-2 block">🌍</span>
            <h3 className="text-lg font-semibold text-gray-900">Accede desde cualquier lugar</h3>
            <p className="text-gray-600 mt-1">
            Compatible con móvil, tablet o PC
            </p>
        </div>
        </section>
    </div>
  );
};

export default LandingSection;
