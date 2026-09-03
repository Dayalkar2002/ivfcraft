'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function LoginForm() {
  const { login, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) nextErrors.username = 'Username or email is required.';
    if (!password) nextErrors.password = 'Password is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await login(username.trim(), password);
    } catch {
      // error state handled in context
    }
  }

  return (
    <div className="relative w-full">
      {/* Top Animated Progress Bar while Loading */}
      {loading && (
        <div className="absolute -top-9 -left-9 -right-9 h-1 bg-purple-100 overflow-hidden rounded-t-[32px]">
          <div className="h-full bg-[#6b46c1] animate-pulse w-full" />
        </div>
      )}

      {/* Shield Icon Badge Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5b3da0] to-[#7c3aed] text-white shadow-md shadow-purple-600/20">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.2" />
            <rect x="9" y="11" width="6" height="5" rx="1" fill="currentColor" />
            <path d="M10 11V9a2 2 0 1 1 4 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Welcome Back!
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-normal">
          Sign in to continue to FERTITRACE
        </p>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 text-center"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Username / Email Input */}
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
              </svg>
            </div>
            <input
              id="username"
              type="text"
              placeholder="Username / Email"
              value={username}
              disabled={loading}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={clearError}
              autoComplete="username"
              aria-required
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#6b46c1] focus:ring-2 focus:ring-[#6b46c1]/15 disabled:bg-slate-50 disabled:text-slate-400 [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b] ${
                fieldErrors.username ? 'border-red-400' : 'border-slate-200'
              }`}
            />
          </div>
          {fieldErrors.username && (
            <span className="mt-1 block text-xs text-red-500" role="alert">
              {fieldErrors.username}
            </span>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearError}
              autoComplete="current-password"
              aria-required
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#6b46c1] focus:ring-2 focus:ring-[#6b46c1]/15 disabled:bg-slate-50 disabled:text-slate-400 [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b] ${
                fieldErrors.password ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          {fieldErrors.password && (
            <span className="mt-1 block text-xs text-red-500" role="alert">
              {fieldErrors.password}
            </span>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300 text-[#6b46c1] focus:ring-[#6b46c1]"
            />
            <span className="text-xs text-slate-600 font-medium">Remember Me</span>
          </label>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-xs font-semibold text-[#6b46c1] hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        {/* Solid Purple Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6b46c1] to-[#7c3aed] hover:from-[#5b3da0] hover:to-[#6d28d9] text-sm font-semibold text-white shadow-md shadow-purple-600/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-400">or</span>
        </div>

        {/* Login with Smart Card Button */}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setUsername('admin');
            setPassword('admin123');
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#6b46c1] hover:bg-purple-50/50 hover:border-[#6b46c1]/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span>Login with Smart Card</span>
        </button>
      </form>

      {/* Card Footer Security Line & Copyright */}
      <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[11px]">
        <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
          <svg className="h-3.5 w-3.5 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>Secure. Compliant. Confidential.</span>
        </div>
        <div className="mt-1 text-slate-400 font-normal">
          © 2025 FERTITRACE. All rights reserved.
        </div>
      </div>
    </div>
  );
}
