import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import {
  signUp,
  signIn,
  signOut,
  signInWithGoogle,
  ensureUserProfile
} from '../utils/supabaseApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        const currentSession = data?.session;

        if (error) throw error;

        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error al obtener la sesión inicial:', err);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Cambio de estado de autenticación:', event, newSession);
        setSession(newSession);

        if (newSession?.user) {
          try {
            await ensureUserProfile(newSession.user);
          } catch (err) {
            console.warn('Error en ensureUserProfile:', err);
          }
          setUser(newSession.user);
        } else {
          setUser(null);
          setSession(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Métodos de autenticación
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await signIn(email, password);
      return data;
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const data = await signUp(email, password, userData);
      return data;
    } catch (err) {
      console.error('Error al registrarse:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const data = await signInWithGoogle();
      return data;
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      throw err;
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
