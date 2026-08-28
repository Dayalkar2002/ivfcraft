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
    if (!username.trim()) nextErrors.username = 'Email is required.';
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
    <div className="w-full max-w-[420px]">
      <h1 className="mb-9 text-center text-[42px] font-extrabold leading-tight tracking-tight text-slate-800">
        Sign In
      </h1>

      {error && (
        <div
          className="mb-5 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-center text-[13px] font-medium text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <input
            id="username"
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={clearError}
            autoComplete="username"
            aria-label="Email"
            aria-required
            aria-invalid={!!fieldErrors.username}
            className={`h-12 w-full rounded-full border px-5 text-[15px] outline-none transition focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/15 ${
              fieldErrors.username ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {fieldErrors.username && (
            <span className="mt-1.5 block pl-5 text-xs font-medium text-red-600" role="alert">
              {fieldErrors.username}
            </span>
          )}
        </div>

        <div className="mb-4">
          <div className={`relative ${fieldErrors.password ? '[&_input]:border-red-400' : ''}`}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearError}
              autoComplete="current-password"
              aria-label="Password"
              aria-required
              aria-invalid={!!fieldErrors.password}
              className="h-12 w-full rounded-full border border-gray-300 px-5 pr-12 text-[15px] outline-none transition focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/15"
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-300 hover:text-brand-primary"
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
            <span className="mt-1.5 block pl-5 text-xs font-medium text-red-600" role="alert">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <a
          href="#"
          className="mb-7 ml-1 inline-block text-sm font-semibold text-brand-dark hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          Forgot password?
        </a>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-brand-border bg-gradient-to-br from-brand-dark to-brand-primary text-base font-bold text-white transition hover:-translate-y-px hover:from-[#4a7a29] hover:to-[#5d912f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Signing In...</span>
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

      <p className="mt-8 text-center text-[13px] font-medium text-slate-400">
        Developed by Jainamm Software
      </p>
    </div>
  );
}
