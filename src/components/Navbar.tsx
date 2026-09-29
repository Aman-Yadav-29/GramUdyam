import React, { useState } from 'react';
import { Sprout, LogIn, User, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';

interface NavbarProps {
  onNavigateToLogin: () => void;
  onScrollToPillars: () => void;
  onScrollToDiscovery?: () => void;
  onScrollToSchemes?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateToLogin,
  onScrollToPillars,
  onScrollToDiscovery,
  onScrollToSchemes
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleScroll = (id: string, callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) {
      callback();
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    onNavigateToLogin();
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div 
          onClick={onScrollToPillars} 
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onScrollToPillars();
            }
          }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-800 transition">
            <Sprout className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-900 transition">
                GramUdyam
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              Enterprise & Financing Advisory Engine
            </p>
          </div>
        </div>

        {/* Desktop Product Navigation */}
        <nav 
          aria-label="Main Navigation" 
          className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600"
        >
          <button
            id="nav-core-pillars"
            onClick={() => handleScroll('pillars', onScrollToPillars)}
            className="transition hover:text-emerald-700 cursor-pointer focus:outline-none focus:text-emerald-700"
          >
            Core Pillars
          </button>
          <button
            id="nav-business-discovery"
            onClick={() => handleScroll('discovery', onScrollToDiscovery)}
            className="transition hover:text-emerald-700 cursor-pointer focus:outline-none focus:text-emerald-700"
          >
            Business Discovery
          </button>
          <button
            id="nav-govt-schemes"
            onClick={() => handleScroll('schemes', onScrollToSchemes)}
            className="transition hover:text-emerald-700 cursor-pointer focus:outline-none focus:text-emerald-700"
          >
            Govt. Schemes
          </button>
        </nav>

        {/* Desktop Right Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                <User className="h-3.5 w-3.5 text-emerald-700" />
                <span>{user.fullName || user.email}</span>
              </div>
              <button
                id="navbar-signout-button"
                onClick={handleLogoutClick}
                className="text-xs font-semibold text-stone-600 hover:text-rose-600 transition px-2 py-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-button"
              onClick={handleLoginClick}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/70 transition cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3">
            <button
              id="mobile-nav-core-pillars"
              onClick={() => handleScroll('pillars', onScrollToPillars)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-stone-700 hover:text-emerald-700 border-b border-stone-100 text-left"
            >
              <span>Core Pillars</span>
            </button>
            <button
              id="mobile-nav-business-discovery"
              onClick={() => handleScroll('discovery', onScrollToDiscovery)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-stone-700 hover:text-emerald-700 border-b border-stone-100 text-left"
            >
              <span>Business Discovery</span>
            </button>
            <button
              id="mobile-nav-govt-schemes"
              onClick={() => handleScroll('schemes', onScrollToSchemes)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-stone-700 hover:text-emerald-700 border-b border-stone-100 text-left"
            >
              <span>Govt. Schemes</span>
            </button>

            <div className="pt-2">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                    <User className="h-4 w-4 text-emerald-700" />
                    <span>{user.fullName || user.email}</span>
                  </div>
                  <button
                    id="mobile-navbar-signout-button"
                    onClick={handleLogoutClick}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  id="mobile-navbar-login-button"
                  onClick={handleLoginClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
