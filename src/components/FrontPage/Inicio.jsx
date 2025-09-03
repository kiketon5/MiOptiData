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
    </div>
  );
};

export default LandingSection;
