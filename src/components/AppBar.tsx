import React from 'react';
import { Menu, } from 'lucide-react';

interface AppBarProps {
  onOpenDrawer: () => void;
  title?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ onOpenDrawer, title = "BRAWLHALLA TOURNAMENT" }) => {
  return (
    <header className="h-12 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Drawer Toggle */}
      <div className="w-10 flex items-center">
        <button
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center Title */}
      <h1 className="text-base font-bold text-gray-100 tracking-wider flex items-center gap-2">
        {title}
      </h1>

      {/* Right Spacer for Center Alignment */}
      <div className="w-10" />
    </header>
  );
};