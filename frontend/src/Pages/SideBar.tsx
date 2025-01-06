import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SideBarProps {
  isLoggedIn: boolean;
  user: { email: string; username: string } | null;
  handleLogout: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ isLoggedIn, user, handleLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gray-800 text-white shadow-md flex flex-col p-2 transition-width duration-300`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-4 text-gray-400 hover:text-white self-end focus:outline-none"
      >
        {isCollapsed ? '☰' : '⟨'}
      </button>

      {isLoggedIn ? (
        <div className={`mb-8 ${isCollapsed ? 'hidden' : ''}`}>
          <p className="text-sm mb-2">Zalogowany jako:</p>
          <p className="text-lg font-semibold">{user?.username}</p>
          <button
            className="mt-4 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md w-full"
            onClick={handleLogout}
          >
            Wyloguj
          </button>
        </div>
      ) : (
        <Link
          className={`block bg-green-500 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md mb-8 ${
            isCollapsed ? 'hidden' : ''
          }`}
          to="/login"
        >
          Zaloguj się
        </Link>
      )}

      <nav className="flex-grow">
        <ul className="space-y-4">
          <li>
            <Link
              className={`block py-2 px-4 rounded-md ${
                isActive('/home')
                  ? 'bg-blue-500 text-white shadow-inner transform translate-y-0.5'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
              to="/home"
            >
              {isCollapsed ? '🏠' : 'Home'}
            </Link>
          </li>
          <li>
            <Link
              className={`block py-2 px-4 rounded-md ${
                isActive('/contact')
                  ? 'bg-blue-500 text-white shadow-inner transform translate-y-0.5'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
              to="/contact"
            >
              {isCollapsed ? '📞' : 'Contact'}
            </Link>
          </li>
          <li>
            <Link
              className={`block py-2 px-4 rounded-md ${
                isActive('/about')
                  ? 'bg-blue-500 text-white shadow-inner transform translate-y-0.5'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
              to="/about"
            >
              {isCollapsed ? 'ℹ️' : 'About'}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto p-4">
        {!isCollapsed && (
          <>
            <img src="/white_logo.png" alt="Black Logo" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold text-center">ForexMate</h2>
          </>
        )}
      </div>
    </div>
  );
};

export default SideBar;
