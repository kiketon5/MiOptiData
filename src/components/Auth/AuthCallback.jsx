import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ensureUserProfile } from '../../utils/supabaseApi';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Location:', location);
        
        setStatus('Processing authentication...');

        // Small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle the OAuth callback from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Session data:', data);
        console.log('Session error:', error);
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(`Authentication failed: ${error.message}`);
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        if (data.session && data.session.user) {
          console.log('Session found, user:', data.session.user.email);
          setStatus('Creating user profile...');
          
          try {
            // Ensure user profile exists in our database
            await ensureUserProfile(data.session.user);
            console.log('User profile ensured');
            
            setStatus('Redirecting to dashboard...');
            
            // Navigate to dashboard immediately
            console.log('Navigating to dashboard...');
            navigate('/dashboard', { replace: true });
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            // Even if profile creation fails, still redirect to dashboard
            console.log('Profile creation failed, but redirecting anyway...');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('No session found, redirecting to login');
          setError('No authentication session found');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setError(`Something went wrong: ${error.message}`);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    // Process callback with a small delay
    const timer = setTimeout(handleAuthCallback, 500);
    return () => clearTimeout(timer);
  }, [navigate, location]);

  // If user is already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold mb-2">Authentication Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
          <p className="text-xs text-gray-500 mt-2">Redirecting automatically in 3 seconds...</p>
        </div>
      </div>
    );
  }

  // Show loading while processing authentication
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600 mb-2">{status}</p>
        <p className="text-sm text-gray-500">Please wait while we set up your account</p>
        <div className="mt-4 text-xs text-gray-400">
          <p>Current URL: {window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;