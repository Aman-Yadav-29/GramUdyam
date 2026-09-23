import React from 'react';
import { Sprout, User, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { SystemStatusBadge } from './SystemStatusBadge.tsx';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToAnalysis: () => void;
  onScrollToPillars: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onNavigateToAnalysis,
  onScrollToPillars
}) => {
  const { user, isGuest, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20">
            <Sprout className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold tracking-tight text-stone-900">
                GramUdyam
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                Phase 1
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              Enterprise & Financing Advisory Engine
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={onScrollToPillars}
            className="transition hover:text-emerald-700 cursor-pointer"
          >
            Core Pillars
          </button>
          <button
            onClick={onNavigateToAnalysis}
            className="transition hover:text-emerald-700 cursor-pointer"
          >
            Business Discovery
          </button>
          <a
            href="#schemes"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToAnalysis();
            }}
            className="transition hover:text-emerald-700 cursor-pointer"
          >
            Govt. Schemes
          </a>
          <a
            href="#architecture"
            className="transition hover:text-emerald-700 cursor-pointer"
          >
            Platform Architecture
          </a>
        </nav>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <SystemStatusBadge />
          </div>

          {user && !isGuest ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-700 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200">
                <User className="h-3.5 w-3.5 text-emerald-700" />
                <span>{user.fullName || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-xs font-semibold text-stone-600 hover:text-rose-600 transition px-2.5 py-1.5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 border border-stone-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Guest Access Active</span>
              </div>
              <button
                id="navbar-login-button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-200/70 transition cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-stone-500" />
                <span>Login</span>
              </button>
              <button
                id="navbar-create-account-button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Account</span>
                <span className="sm:hidden">Join</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
