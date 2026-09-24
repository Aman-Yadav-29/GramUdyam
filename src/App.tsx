import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './pages/LandingPage.tsx';
import { BusinessAnalysisPage } from './pages/BusinessAnalysisPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { SharedPlanPage } from './pages/SharedPlanPage.tsx';

export type AppRoute =
  | { page: 'landing' }
  | { page: 'analysis' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'share'; token: string };

export function parseCurrentRoute(): AppRoute {
  const path = window.location.pathname;
  const hash = window.location.hash;

  // 1. Hash-based share token: #share=<token>
  if (hash.toLowerCase().startsWith('#share=')) {
    const token = hash.substring(7).trim();
    if (token) return { page: 'share', token };
  }

  // 2. Path-based share token: /share/plan/<token>
  const shareMatch = path.match(/^\/share\/plan\/([a-zA-Z0-9_-]+)/);
  if (shareMatch && shareMatch[1]) {
    return { page: 'share', token: shareMatch[1] };
  }

  const pathLower = path.toLowerCase();
  const hashLower = hash.toLowerCase();

  if (pathLower === '/login' || hashLower === '#login') return { page: 'login' };
  if (pathLower === '/register' || hashLower === '#register') return { page: 'register' };
  if (pathLower === '/analysis' || hashLower === '#analysis') return { page: 'analysis' };
  return { page: 'landing' };
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseCurrentRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((pageName: 'landing' | 'analysis' | 'login' | 'register' | 'share', token?: string) => {
    let targetPath = '/';
    let targetHash = '';

    if (pageName === 'login') {
      targetPath = '/login';
      targetHash = '#login';
      setCurrentRoute({ page: 'login' });
    } else if (pageName === 'register') {
      targetPath = '/register';
      targetHash = '#register';
      setCurrentRoute({ page: 'register' });
    } else if (pageName === 'analysis') {
      targetPath = '/analysis';
      targetHash = '#analysis';
      setCurrentRoute({ page: 'analysis' });
    } else if (pageName === 'share' && token) {
      targetPath = `/share/plan/${token}`;
      targetHash = `#share=${token}`;
      setCurrentRoute({ page: 'share', token });
    } else {
      targetPath = '/';
      targetHash = '';
      setCurrentRoute({ page: 'landing' });
    }

    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      window.location.hash = targetHash;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
      {currentRoute.page === 'share' && (
        <SharedPlanPage
          shareToken={currentRoute.token}
          onNavigateHome={() => navigateTo('landing')}
          onNavigateToAnalysis={() => navigateTo('analysis')}
        />
      )}

      {currentRoute.page === 'login' && (
        <LoginPage
          onNavigateToRegister={() => navigateTo('register')}
          onContinueAsGuest={() => navigateTo('analysis')}
          onLoginSuccess={() => navigateTo('analysis')}
          onNavigateHome={() => navigateTo('landing')}
        />
      )}

      {currentRoute.page === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => navigateTo('login')}
          onContinueAsGuest={() => navigateTo('analysis')}
          onRegisterSuccess={() => navigateTo('analysis')}
          onNavigateHome={() => navigateTo('landing')}
        />
      )}

      {currentRoute.page === 'analysis' && (
        <BusinessAnalysisPage
          onBackToHome={() => navigateTo('landing')}
          onNavigateToLogin={() => navigateTo('login')}
        />
      )}

      {currentRoute.page === 'landing' && (
        <LandingPage
          onNavigateToAnalysis={() => navigateTo('analysis')}
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToRegister={() => navigateTo('register')}
        />
      )}
    </div>
  );
}
