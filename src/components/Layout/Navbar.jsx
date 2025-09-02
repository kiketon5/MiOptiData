import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const imgDataLogo =
    "data:image/png;base64,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";
  const imgDataText =
    "data:image/png;base64,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";
  

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
            <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2" onClick={closeMenus}>
              <img src={imgDataLogo} alt="Logo icon" className="h-10 w-10" />
              <img src={imgDataText} alt="Logo text" className="h-10" />
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