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
    <div className="bg-gray-50 min-h-screen">
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

          {/* Google Login Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue with Google
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            {loginError && (
              <p className="text-red-500 text-sm mt-1">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </form>

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