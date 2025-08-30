import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center" onClick={closeMenus}>
              <span className="text-2xl font-bold text-blue-600">MiOptiData</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  isActive
                    ? "text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/profiles" 
                className={({ isActive }) => 
                  isActive
                    ? "text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                }
              >
                Profiles
              </NavLink>
              <NavLink 
                to="/reminders" 
                className={({ isActive }) => 
                  isActive
                    ? "text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                }
              >
                Reminders
              </NavLink>
            </div>
          )}

          {/* User Profile Dropdown & Mobile Menu Toggle */}
          <div className="flex items-center">
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                      <img 
                        className="h-8 w-8 rounded-full object-cover" 
                        src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                        alt="Profile"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : 
                         user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>
                </div>
                {isProfileMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p>Signed in as</p>
                      <p className="font-medium">{user.email}</p>
                      {user.user_metadata?.full_name && (
                        <p className="text-xs text-gray-500">{user.user_metadata.full_name}</p>
                      )}
                    </div>
                    <Link 
                      to="/account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeMenus}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-4">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        {user ? (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                isActive
                  ? "bg-blue-50 text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              }
              onClick={closeMenus}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/profiles" 
              className={({ isActive }) => 
                isActive
                  ? "bg-blue-50 text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              }
              onClick={closeMenus}
            >
              Profiles
            </NavLink>
            <NavLink 
              to="/reminders" 
              className={({ isActive }) => 
                isActive
                  ? "bg-blue-50 text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              }
              onClick={closeMenus}
            >
              Reminders
            </NavLink>
            <div className="border-t border-gray-200 pt-2">
              <Link
                to="/account"
                className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenus}
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/login" 
              className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeMenus}
            >
              Sign in
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={closeMenus}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;