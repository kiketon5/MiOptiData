import React from "react";
import { Outlet, Link } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header fijo opcional */}
      <header className="border-b py-4 text-center">
        <h1 className="text-xl font-bold text-blue-700">MiOptiData</h1>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1">
        <Outlet /> {/* Aquí se cargarán LandingPage o RegisterPage */}
      </main>

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
