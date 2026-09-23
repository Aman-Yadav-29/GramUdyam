import React, { useState } from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { HeroSection } from '../components/HeroSection.tsx';
import { CoreQuestionCard } from '../components/CoreQuestionCard.tsx';
import { PillarsOverview } from '../components/PillarsOverview.tsx';
import { InteractiveDiscoveryPreview } from '../components/InteractiveDiscoveryPreview.tsx';
import { AuthModal } from '../components/AuthModal.tsx';
import { Footer } from '../components/Footer.tsx';
import { 
  Server, 
  Layers, 
  Database, 
  Cpu, 
  FolderTree, 
  ShieldCheck, 
  CheckCircle,
  FileCode,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAnalysis: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToAnalysis,
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (mode === 'login') {
      onNavigateToLogin();
    } else {
      onNavigateToRegister();
    }
  };

  const handleScrollToPillars = () => {
    const el = document.getElementById('pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSandbox = () => {
    const el = document.getElementById('discovery-sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigateToAnalysis={onNavigateToAnalysis}
        onScrollToPillars={handleScrollToPillars}
      />

      {/* Hero Section */}
      <HeroSection
        onStartAnalysis={onNavigateToAnalysis}
        onOpenAuth={handleOpenAuth}
        onContinueGuest={handleScrollToSandbox}
      />

      {/* Core Question Highlight Section */}
      <CoreQuestionCard onTriggerAnalysis={handleScrollToSandbox} />

      {/* Interactive Discovery Sandbox Preview */}
      <InteractiveDiscoveryPreview onFullAnalysis={onNavigateToAnalysis} />

      {/* The 7 Core Pillars Overview */}
      <PillarsOverview onSelectPillar={() => handleScrollToSandbox()} />

      {/* Platform Technical Architecture Showcase */}
      <section id="architecture" className="py-16 sm:py-24 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 mb-3">
              <Layers className="h-3.5 w-3.5 text-stone-900" />
              <span>Phase 1 Production Architecture</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-stone-900 tracking-tight">
              Decoupled, Modular Architecture
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              GramUdyam enforces clean separation of concerns across presentation, domain calculation services, database adapters, and external subsidy/banking APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <FolderTree className="h-5 w-5 text-emerald-700" />
                <span>Frontend & Client Hooks</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                React 19 + Tailwind CSS with dedicated custom hooks (<code>useAuth</code>, <code>useBusinessAnalysis</code>, <code>useSystemHealth</code>).
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /src/components/ (Navbar, Hero, Sandbox, Modals)</li>
                <li>• /src/pages/ (LandingPage, BusinessAnalysisPage)</li>
                <li>• /src/hooks/ (Reactive state & API contracts)</li>
                <li>• /src/services/ (Typed API Client)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <Server className="h-5 w-5 text-blue-700" />
                <span>Backend Express API & Controllers</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Dedicated Express routes mounted cleanly under <code>/api/*</code> with centralized request validation and standard JSON envelopes.
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /server/routes/ (business, financial, schemes, loans, gis)</li>
                <li>• /server/controllers/ (Handler routing & error handling)</li>
                <li>• /src/validation/ (Input boundary schema checks)</li>
                <li>• /server.ts (Express + Vite Middleware entry point)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <Cpu className="h-5 w-5 text-purple-700" />
                <span>Business & Calculation Engines</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Pure business services executing mathematical financial modeling, reducing-balance EMI amortization, and subsidy evaluations.
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /server/services/businessService.ts</li>
                <li>• /server/services/financialEngineService.ts</li>
                <li>• /server/services/schemeEngineService.ts</li>
                <li>• /server/services/loanEngineService.ts</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <Database className="h-5 w-5 text-amber-700" />
                <span>Database & Models</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Pluggable database configuration supporting external PostgreSQL via <code>DATABASE_URL</code> with automatic memory-store fallback.
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /server/models/database.ts (Pool & Config manager)</li>
                <li>• /server/models/schema.ts (Entity repositories)</li>
                <li>• /src/data/ (Schemes, Enterprises, Districts)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <Layers className="h-5 w-5 text-teal-700" />
                <span>Location GIS & Benchmarks</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                District-level raw material catchment, agro-climatic zones, and DIC contact directories across Indian states.
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /server/services/locationGisService.ts</li>
                <li>• /src/data/locationBenchmarksData.ts</li>
                <li>• GIS district intelligence endpoints</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-stone-900 font-heading font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <span>Auth & AI Integration</span>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Non-blocking Guest sessions for instant accessibility, plus optional account creation and Gemini AI advisory integration.
              </p>
              <ul className="space-y-1.5 text-2xs text-stone-500 font-mono">
                <li>• /server/services/authService.ts (Guest + User)</li>
                <li>• /server/services/aiService.ts (Gemini lazy client)</li>
                <li>• Safe server-only environment credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onContinueAsGuest={() => {
          setAuthModalOpen(false);
          handleScrollToSandbox();
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
