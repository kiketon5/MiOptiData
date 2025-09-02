import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute → loading:", loading, "user:", user);

  // Mientras se comprueba el estado de autenticación
  if (loading) return <p className="text-center py-8 text-gray-500">Cargando sesión...</p>;


  // Si no hay usuario → redirige a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario → renderiza el contenido
  return children;
};

export default ProtectedRoute;
