import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { login, register, loading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      if (mode === 'login') {
        if (!email) {
          setFormError('Please enter your email address.');
          return;
        }
        await login(email, password);
        setFormSuccess('Successfully logged in!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        if (!email || !fullName) {
          setFormError('Please enter your full name and email address.');
          return;
        }
        await register({
          name: fullName,
          email,
          password
        });
        setFormSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. You can also continue as guest.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition p-1 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-3">
            {mode === 'login' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h3 className="font-heading text-xl font-bold text-stone-900">
            {mode === 'login' ? 'Sign in to GramUdyam' : 'Create an Account'}
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Save multiple business plans, track district subsidies, and access your DPR anytime.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setFormError(null); }}
            className={`py-2 rounded-md transition cursor-pointer ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setFormError(null); }}
            className={`py-2 rounded-md transition cursor-pointer ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 pl-9 pr-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="entrepreneur@gramudyam.in"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 pl-9 pr-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Password {mode === 'login' && <span className="font-normal text-stone-400">(optional in prototype)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 pl-9 pr-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-2xs font-bold text-stone-600 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold text-stone-600 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Varanasi"
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-400 font-semibold">Or</span>
          </div>
        </div>

        {/* Continue as Guest Button - Explicit and prominent */}
        <div className="space-y-2">
          <button
            type="button"
            id="modal-continue-guest-button"
            onClick={() => {
              onContinueAsGuest();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 hover:border-stone-400 transition cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Continue as Guest (No Login Required)</span>
          </button>
          <p className="text-center text-2xs text-stone-500">
            Login is completely optional. You can test all business discovery, location intelligence, and loan calculations immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
