'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SmartLogo } from '@/components/smart-logo';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login');
    }
  }, [token, hydrated, router]);

  // Render a sleek branded loading screen instead of blank null while navigating to /login
  if (!hydrated || !token) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f4f6fa] text-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-purple-600/20 blur-md animate-pulse" />
            <SmartLogo className="relative h-16 w-16 drop-shadow-md" />
          </div>
          <div className="text-center">
            <div className="text-xl font-black tracking-tight text-[#1e3a8a]">
              FERTITRACE<span className="text-[#6345A6]">™</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <svg className="h-4 w-4 animate-spin text-[#6345A6]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Redirecting to Login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
