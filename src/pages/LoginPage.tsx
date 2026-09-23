import React, { useState } from 'react';
import { Sprout, Mail, Lock, LogIn, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { validateLoginPayload } from '../validation/authValidator.ts';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onContinueAsGuest: () => void;
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onContinueAsGuest,
  onLoginSuccess,
  onNavigateHome
}) => {
  const { login, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors([]);
    setServerError(null);
    setSuccessMsg(null);

    const validation = validateLoginPayload({ email, password });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      await login(email.trim(), password);
      setSuccessMsg('Successfully logged in!');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Nav */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-stone-900 font-heading font-extrabold text-2xl hover:opacity-90 transition cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <span>GramUdyam</span>
        </button>

        <h1 className="mt-6 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Sign In to Your Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
          Access your enterprise evaluations, loan matching benchmarks, and saved analyses.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 sm:px-10 shadow-sm">
          {/* Validation & Server Alerts */}
          {fieldErrors.length > 0 && (
            <div className="mb-5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>Please fix the following:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-2xs pl-1">
                {fieldErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {serverError && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="entrepreneur@gramudyam.in"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Button 1: Login */}
            <div className="pt-2">
              <button
                id="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{loading ? 'Authenticating...' : 'Login'}</span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-stone-400 font-semibold uppercase tracking-wider text-2xs">
                Or Continue With
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Button 2: Continue as Guest */}
            <button
              id="login-continue-guest-button"
              type="button"
              onClick={onContinueAsGuest}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 hover:border-stone-400 transition cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Continue as Guest</span>
            </button>

            {/* Button 3: Create Account */}
            <button
              id="login-create-account-button"
              type="button"
              onClick={onNavigateToRegister}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-stone-500" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <p className="text-2xs text-stone-500">
              GramUdyam believes in zero-barrier access. All core financial and discovery features are freely accessible without signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
