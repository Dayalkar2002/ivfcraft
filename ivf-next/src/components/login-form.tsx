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
    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) nextErrors.username = 'Email or username is required.';
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
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Welcome back</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
          Sign in to smART
        </h1>
        <p className="mt-2 text-sm text-slate-500">Access cycles, clinical modules, masters, and reports.</p>
      </div>

      {error && (
        <div
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-slate-600">
            Email or Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="you@clinic.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={clearError}
            autoComplete="username"
            aria-required
            aria-invalid={!!fieldErrors.username}
            className={`h-12 w-full rounded-2xl border bg-white px-4 text-[15px] outline-none transition focus:border-brand-primary focus:shadow-glow ${
              fieldErrors.username ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          {fieldErrors.username && (
            <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
              {fieldErrors.username}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-600">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearError}
              autoComplete="current-password"
              aria-required
              aria-invalid={!!fieldErrors.password}
              className={`h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-[15px] outline-none transition focus:border-brand-primary focus:shadow-glow ${
                fieldErrors.password ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-dark"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <span className="material-symbols-rounded text-[22px]" aria-hidden="true">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {fieldErrors.password && (
            <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-primary" />
            Remember me
          </label>
          <a
            href="#"
            className="text-sm font-semibold text-brand-dark hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-dark to-brand-primary text-base font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-rounded text-[22px]" aria-hidden="true">
                login
              </span>
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-6 rounded-2xl bg-brand-mist px-4 py-3 text-center text-xs text-slate-500">
        Demo: <span className="font-semibold text-brand-dark">admin / admin123</span>
        {' · '}
        SQL login uses <span className="font-semibold">spUserLogin</span>
      </p>
    </div>
  );
}
