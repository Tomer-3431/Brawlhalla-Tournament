import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home as HomeIcon, Trophy, Gamepad2, ShieldAlert, Users } from 'lucide-react';
import Cookies from 'js-cookie';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setAdmin] = useState<boolean>(false);

  const navItems = [
    { label: 'Home', path: `/home`, icon: HomeIcon },
    { label: 'Leaderboard', path: `/leaderboard`, icon: Trophy },
    { label: 'Groups Page', path: `/groups`, icon: Users },
    { label: 'Matches Page', path: `/matches`, icon: Gamepad2 },
    { label: 'Admin', path: `/admin`, icon: ShieldAlert },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  useEffect(() => {
    if (window.location.hostname === "localhost"
      || window.location.hostname === "127.0.0.1"
    ) {
      setAdmin(true);
    }

    const getCookie = Cookies.get(import.meta.env.VITE_ADMIN_KEY);

    if (getCookie === 'true') {
      setAdmin(true);
    }
  });

  return (
    <>
      {/* Dark Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/50">
          <span className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Navigation</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => {
            if (item.label === "Admin" && !isAdmin) return;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-800 text-indigo-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-indigo-400'
                  }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};