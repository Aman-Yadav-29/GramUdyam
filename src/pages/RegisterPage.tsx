import React, { useState } from 'react';
import { Sprout, User, Mail, Lock, UserPlus, LogIn, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { validateRegisterPayload } from '../validation/authValidator.ts';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onContinueAsGuest: () => void;
  onRegisterSuccess: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onContinueAsGuest,
  onRegisterSuccess,
  onNavigateHome
}) => {
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors([]);
    setServerError(null);
    setSuccessMsg(null);

    const validation = validateRegisterPayload({
      fullName: name,
      name,
      email,
      password,
      confirmPassword
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });
      setSuccessMsg('Account registered successfully!');
      setTimeout(() => {
        onRegisterSuccess();
      }, 500);
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
          Create an Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
          Save your rural enterprise blueprints, bank ratios, and tailored scheme subsidies.
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
            {/* Field: Name */}
            <div>
              <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Field: Email */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="register-email"
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
              <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Button 1: Create Account */}
            <div className="pt-2">
              <button
                id="register-submit-button"
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
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
                Or
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Button 2: Continue as Guest */}
            <button
              id="register-continue-guest-button"
              type="button"
              onClick={onContinueAsGuest}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 hover:border-stone-400 transition cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Continue as Guest</span>
            </button>

            {/* Button 3: Login */}
            <button
              id="register-login-button"
              type="button"
              onClick={onNavigateToLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-stone-500" />
              <span>Already have an account? Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
