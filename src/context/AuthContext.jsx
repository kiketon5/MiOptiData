import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  signInWithGoogle,
  ensureUserProfile,
} from "../utils/supabaseApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
  setLoading(true);

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("Cambio de estado de autenticación:", event, session);

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Evitamos await directo en el listener
      ensureUserProfile(session.user).catch(console.error);
    }

    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);


  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await signIn(email, password);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const data = await signUp(email, password, userData);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const data = await signInWithGoogle();
      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
