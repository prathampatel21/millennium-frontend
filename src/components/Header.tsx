
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, BarChart, PlusCircle, User, ClipboardList } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/create-order':
        return 'Create Order';
      case '/orders':
        return 'Order Status';
      case '/history':
        return 'Order History';
      case '/profile':
        return 'Profile';
      default:
        return 'TradeFlow';
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: BarChart },
    { name: 'Create Order', path: '/create-order', icon: PlusCircle },
    { name: 'Order Status', path: '/orders', icon: ClipboardList },
    { name: 'Order History', path: '/history', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">TradeFlow</span>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md text-gray-700 hover:text-primary transition duration-150"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`
                }
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div
        className={`fixed inset-0 bg-white z-30 md:hidden transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-4">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
              Navigation
            </p>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-3 rounded-lg ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700'
                  }`
                }
              >
                <div className="flex items-center">
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.name}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
