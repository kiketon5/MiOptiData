import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateEmail, validatePassword } from "../../utils/validation";
import MainLayout from "../FrontPage/MainLayout";

const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error.message ||
          "Failed to login. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError("");

    try {
      await loginWithGoogle();
      // OAuth redirect will handle navigation
    } catch (err) {
      setLoginError(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col">
      {/* Hero Section */}
      {!showLogin && (
        <section className="max-w-4xl mx-auto text-center py-16 px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Tu visión, siempre contigo
          </h1>
          <p className="text-gray-600 mb-6">
            Guarda tus recetas ópticas de forma segura y accede a ellas cuando
            quieras.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block px-6 py-3 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition font-medium mb-0"
          >
            Empieza ahora
          </button>
        </section>
      )}

      {/* LOGIN COMPONENT */}
      {showLogin && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 mt-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">MiOptiData</h1>
            <h2 className="text-xl font-semibold mt-2">Sign In</h2>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center px-6 py-8">
        <div>
          <span className="text-4xl mb-2 block">📄</span>
          <h3 className="text-lg font-semibold text-gray-900">
            Historial completo
          </h3>
          <p className="text-gray-600 mt-1">
            Guarda tus recetas y evolución visual fácilmente
          </p>
        </div>

        <div>
          <span className="text-4xl mb-2 block">🔒</span>
          <h3 className="text-lg font-semibold text-gray-900">
            Seguridad garantizada
          </h3>
          <p className="text-gray-600 mt-1">Solo tú puedes ver tus datos</p>
        </div>

        <div>
          <span className="text-4xl mb-2 block">🌍</span>
          <h3 className="text-lg font-semibold text-gray-900">
            Accede desde cualquier lugar
          </h3>
          <p className="text-gray-600 mt-1">
            Compatible con móvil, tablet o PC
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
