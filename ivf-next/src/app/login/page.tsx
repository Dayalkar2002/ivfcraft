import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SmartLogo } from '@/components/smart-logo';

export default function LoginPage() {
  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden bg-[#dce5f0] font-sans text-slate-800 selection:bg-purple-500 selection:text-white">
      {/* Background High-Res Macro ICSI Artwork */}
      <div className="absolute inset-0 z-0 opacity-85">
        <Image
          src="/images/icsi-macro-perfect.jpg"
          alt="IVF ICSI Micromanipulation"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Ambient Soft Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#edf4fc]/95 via-[#e2ecf7]/70 to-[#d6e3f3]/85" />

      {/* Main Container - Fits 100vh without vertical scrollbar */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col justify-between p-6 lg:px-12 lg:py-8">
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Left Branding & Hero Column */}
          <div className="flex flex-col justify-between py-2 lg:col-span-7">
            
            {/* Top Logo & System Subtitle */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3.5">
                <SmartLogo className="h-16 w-16 drop-shadow-md" />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-[#1e3a8a]">
                      FERTI
                    </span>
                    <span className="text-3xl font-extrabold tracking-tight text-[#6345A6]">
                      TRACE
                    </span>
                    <span className="text-xs font-bold text-[#6345A6]">TM</span>
                  </div>
                  <div className="text-xs font-normal text-[#64748b] tracking-wide mt-0.5">
                    IVF & Fertility Management System
                  </div>
                </div>
              </div>
            </div>

            {/* Main Hero Headline */}
            <div className="max-w-xl">
              <h1 className="text-4xl font-normal tracking-tight text-[#334155] sm:text-[46px] leading-[1.2]">
                Every Cell. Every Step.
                <span className="block font-bold text-[#6345A6] mt-1">
                  Every Miracle, Traced.
                </span>
              </h1>
              
              {/* Short & Thin Gradient Accent Line */}
              <div className="mt-3 h-[3px] w-20 rounded-full bg-gradient-to-r from-[#6345A6] to-[#7A3DB8]" />

              {/* Value Proposition Tag (No white pill container background) */}
              <div className="mt-7 flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100/90 text-[#6345A6] shadow-2xs">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-sm text-[#334155] font-normal leading-snug">
                  Precision today,<br />
                  <span className="font-bold text-[#6345A6]">Parenthood</span> tomorrow.
                </div>
              </div>
            </div>

            {/* Bottom 4 Badges with Subtle Vertical Dividers */}
            <div className="mt-12 flex items-center justify-start max-w-md">
              {[
                {
                  title: 'Secure',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  title: 'Accurate',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  ),
                },
                {
                  title: 'Reliable',
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 1 0-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
              ].map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className={`flex flex-col items-center text-center px-5 ${
                    idx < 3 ? 'border-r border-slate-300/50' : ''
                  } ${idx === 0 ? 'pl-0' : ''}`}
                >
                  <div className="mb-1 flex h-7 w-7 items-center justify-center text-[#6345A6]">
                    {pillar.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#475569]">{pillar.title}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Floating White Login Card */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="w-full max-w-[420px] rounded-[32px] bg-white p-8 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5">
              <LoginForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
