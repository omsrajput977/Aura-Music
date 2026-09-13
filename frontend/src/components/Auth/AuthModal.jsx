import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Disc3, X, Mail, Lock, User, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-void/80 backdrop-blur-xl animate-fade-in select-none">
      {/* Background ambient glow */}
      <div className="absolute w-[300px] xs:w-[400px] h-[300px] xs:h-[400px] bg-gradient-to-tr from-neonCyan/20 to-neonViolet/20 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-5 xs:p-7 overflow-hidden z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neonCyan to-spotifyGreen flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] mb-3">
            <Disc3 className="w-7 h-7 text-slate-950 animate-spin-slow" />
          </div>
          <h2 className="text-xl xs:text-2xl font-bold font-display tracking-wide text-white">
            {mode === 'login' ? 'Welcome Back to AURA' : 'Join the AURA Orbit'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {mode === 'login'
              ? 'Sign in to access your direct-drive spatial vinyl collection.'
              : 'Create a free account to unlock high-fidelity music streaming.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-neonCyan/20 to-teal-400/20 text-neonCyan border border-neonCyan/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-neonCyan/20 to-teal-400/20 text-neonCyan border border-neonCyan/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification Pill */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-neonCyan/60 focus:ring-1 focus:ring-neonCyan/40 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-neonCyan/60 focus:ring-1 focus:ring-neonCyan/40 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-neonCyan/60 focus:ring-1 focus:ring-neonCyan/40 focus:outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-neonCyan/60 focus:ring-1 focus:ring-neonCyan/40 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-neonCyan via-teal-400 to-spotifyGreen text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to AURA' : 'Create AURA Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-mono">
          <Sparkles className="w-3 h-3 text-neonCyan" />
          <span>Encrypted with SHA-256 & JWT Cookie Sessions</span>
        </div>
      </div>
    </div>
  );
};
