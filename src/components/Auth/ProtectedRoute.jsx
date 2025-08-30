import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mientras se comprueba el estado de autenticación
  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  // Si no hay usuario → redirige a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario → renderiza el contenido
  return children;
};

export default ProtectedRoute;
