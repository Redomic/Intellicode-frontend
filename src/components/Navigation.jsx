import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/userSlice';
import ProfileDropdown from './ProfileDropdown';

/**
 * Navigation component for consistent header across pages
 * @param {Object} props - Component props
 */
const Navigation = ({ className = '' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <nav className={`px-6 py-4 border-b border-zinc-800 ${className}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl font-thin text-zinc-100 tracking-tight hover:text-white transition-colors duration-200"
        >
          IntelliCode
        </Link>
        
        {/* Right side - Authentication dependent */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors duration-200 font-light"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-zinc-700 text-zinc-100 text-sm rounded-lg hover:bg-zinc-600 transition-colors duration-200 font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
