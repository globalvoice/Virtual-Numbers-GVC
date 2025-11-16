import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#0a192f]/80 backdrop-blur-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-white">Global Voice Connect Solution</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;