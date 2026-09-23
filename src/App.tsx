import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './pages/LandingPage.tsx';
import { BusinessAnalysisPage } from './pages/BusinessAnalysisPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';

type PageRoute = 'landing' | 'analysis' | 'login' | 'register';

function parseCurrentRoute(): PageRoute {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/login' || hash === '#login') return 'login';
  if (path === '/register' || hash === '#register') return 'register';
  if (path === '/analysis' || hash === '#analysis') return 'analysis';
  return 'landing';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => parseCurrentRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(parseCurrentRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((page: PageRoute) => {
    let targetPath = '/';
    let targetHash = '';

    if (page === 'login') {
      targetPath = '/login';
      targetHash = '#login';
    } else if (page === 'register') {
      targetPath = '/register';
      targetHash = '#register';
    } else if (page === 'analysis') {
      targetPath = '/analysis';
      targetHash = '#analysis';
    }

    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      window.location.hash = targetHash;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
      {currentPage === 'login' && (
        <LoginPage
          onNavigateToRegister={() => navigateTo('register')}
          onContinueAsGuest={() => navigateTo('analysis')}
          onLoginSuccess={() => navigateTo('analysis')}
          onNavigateHome={() => navigateTo('landing')}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => navigateTo('login')}
          onContinueAsGuest={() => navigateTo('analysis')}
          onRegisterSuccess={() => navigateTo('analysis')}
          onNavigateHome={() => navigateTo('landing')}
        />
      )}

      {currentPage === 'analysis' && (
        <BusinessAnalysisPage
          onBackToHome={() => navigateTo('landing')}
          onNavigateToLogin={() => navigateTo('login')}
        />
      )}

      {currentPage === 'landing' && (
        <LandingPage
          onNavigateToAnalysis={() => navigateTo('analysis')}
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToRegister={() => navigateTo('register')}
        />
      )}
    </div>
  );
}
