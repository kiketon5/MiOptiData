import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LandingSection = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard"); // 👈 redirige si ya está logueado
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center py-16 px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Tu visión, siempre contigo
        </h1>
        <p className="text-gray-600 mb-6">
          Guarda tus recetas ópticas de forma segura y accede a ellas cuando quieras.
        </p>
        <Link
          to="/register"
          className="inline-block px-6 py-3 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition font-medium"
        >
          Empieza ahora
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-6 py-12">
        <div>
          <span className="text-4xl mx-auto mb-3 block">📄</span>
          <h3 className="text-lg font-semibold text-gray-900">Historial completo</h3>
          <p className="text-gray-600 mt-2">
            Guarda tus recetas y evolución visual fácilmente
          </p>
        </div>

        <div>
          <span className="text-4xl mx-auto mb-3 block">🔒</span>
          <h3 className="text-lg font-semibold text-gray-900">Seguridad garantizada</h3>
          <p className="text-gray-600 mt-2">
            Solo tú puedes ver tus datos
          </p>
        </div>

        <div>
          <span className="text-4xl mx-auto mb-3 block">🌍</span>
          <h3 className="text-lg font-semibold text-gray-900">Accede desde cualquier lugar</h3>
          <p className="text-gray-600 mt-2">
            Compatible con móvil, tablet o PC
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-600">
        <div className="space-x-4 mb-2">
          <Link to="/legal" className="hover:underline">
            Legal
          </Link>
          <Link to="/privacy" className="hover:underline">
            Política de privacidad
          </Link>
        </div>
        <p>© 2025 MiOptiData</p>
      </footer>
    </div>
  );
};

export default LandingSection;
