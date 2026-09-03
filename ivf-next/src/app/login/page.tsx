import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SmartLogo } from '@/components/smart-logo';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#dce5f0] font-sans text-slate-800 selection:bg-purple-500 selection:text-white">
      {/* Background Medical ICSI Artwork */}
      <div className="absolute inset-0 z-0 opacity-90">
        <Image
          src="/images/login-bg-exact.jpg"
          alt="IVF ICSI Micromanipulation"
          fill
          priority
          className="object-cover object-left-bottom"
          sizes="100vw"
        />
      </div>

      {/* Ambient Gradient Soft Layer for Contrast */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#eef4fb]/90 via-[#e2ebf6]/60 to-[#d8e3f2]/80" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1360px] flex-col justify-between p-6 lg:p-12">
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Left Branding & Copy Column */}
          <div className="flex flex-col justify-between py-4 lg:col-span-7">
            
            {/* Top Logo & System Subtitle */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-4">
                <SmartLogo className="h-16 w-16 drop-shadow-md" />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-[#1e3a8a]">
                      FERTI
                    </span>
                    <span className="text-3xl font-extrabold tracking-tight text-[#6b46c1]">
                      TRACE
                    </span>
                    <span className="text-xs font-bold text-[#6b46c1]">TM</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 tracking-wide mt-0.5">
                    IVF & Fertility Management System
                  </div>
                </div>
              </div>
            </div>

            {/* Main Hero Headline */}
            <div className="max-w-xl">
              <h1 className="text-4xl font-semibold tracking-tight text-[#2c3e50] sm:text-5xl leading-[1.25]">
                Every Cell. Every Step.
                <span className="block font-bold text-[#6b46c1] mt-1">
                  Every Miracle, Traced.
                </span>
              </h1>
              
              {/* Accent Purple Underline */}
              <div className="mt-3 h-1 w-24 rounded-full bg-[#6b46c1]" />

              {/* Sub-badge Card */}
              <div className="mt-8 inline-flex items-center gap-3.5 rounded-2xl bg-white/40 p-2.5 pr-5 backdrop-blur-xs border border-white/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#6b46c1]">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-sm text-slate-700 leading-snug">
                  Precision today,<br />
                  <span className="font-bold text-[#6b46c1]">Parenthood</span> tomorrow.
                </div>
              </div>
            </div>

            {/* Bottom 4 Pillars */}
            <div className="mt-14 flex items-center justify-start gap-6 border-t border-slate-300/60 pt-5 max-w-md">
              {[
                {
                  title: 'Secure',
                  icon: (
                    <svg className="h-4 w-4 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  title: 'Accurate',
                  icon: (
                    <svg className="h-4 w-4 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                      <line x1="12" y1="2" x2="12" y2="4" />
                      <line x1="12" y1="20" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="4" y2="12" />
                      <line x1="20" y1="12" x2="22" y2="12" />
                    </svg>
                  ),
                },
                {
                  title: 'Trackable',
                  icon: (
                    <svg className="h-4 w-4 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  ),
                },
                {
                  title: 'Reliable',
                  icon: (
                    <svg className="h-4 w-4 text-[#6b46c1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 1 0 7.75" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
              ].map((pillar, idx) => (
                <div key={pillar.title} className="flex items-center gap-6">
                  {idx > 0 && <div className="h-5 w-[1px] bg-slate-300" />}
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 shadow-2xs">
                      {pillar.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">{pillar.title}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Floating White Login Card */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="w-full max-w-[430px] rounded-[32px] bg-white p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.09)] ring-1 ring-slate-900/5">
              <LoginForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
