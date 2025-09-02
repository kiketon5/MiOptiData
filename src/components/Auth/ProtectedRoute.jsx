import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute → loading:", loading, "user:", user);

  // Mientras se comprueba el estado de autenticación
  if (loading) {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4 text-gray-500">Cargando sesión...</span>
    </div>
  );
}


  // Si no hay usuario → redirige a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario → renderiza el contenido
  return !loading && user ? children : null;
};

export default ProtectedRoute;
