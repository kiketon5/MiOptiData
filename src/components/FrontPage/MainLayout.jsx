import React, { useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MainLayout = () => {
const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard"); // 👈 redirige si ya está logueado
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Contenido dinámico */}
      <main className="flex-1">
        <Outlet /> {/* Aquí se cargarán LandingPage o RegisterPage */}
      </main>

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

export default MainLayout;
