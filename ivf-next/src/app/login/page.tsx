import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SmartLogo } from '@/components/smart-logo';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#eaf1f9] font-sans text-slate-800 selection:bg-purple-500 selection:text-white">
      {/* Background High-Res Cinematic Macro ICSI Artwork */}
      <div className="absolute inset-0 z-0 opacity-90">
        <Image
          src="/images/icsi-cinematic-bg.jpg"
          alt="IVF ICSI Micromanipulation"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Ambient Gradient Soft Layer for Contrast & Depth */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#edf4fc]/95 via-[#e2ecf7]/60 to-[#d6e3f3]/80" />

      {/* Radial Purple Glow Behind Login Card */}
      <div className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 z-0 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

      {/* Main Container - Responsive & Perfectly Proportioned */}
      <div className="relative z-10 mx-auto flex min-h-screen lg:h-full max-w-[1360px] flex-col justify-between p-4 sm:p-6 lg:px-12 lg:py-8">
        <div className="grid flex-1 items-center gap-8 py-6 lg:py-0 lg:grid-cols-12">
          
          {/* Left Branding & Hero Column */}
          <div className="flex flex-col justify-between space-y-6 lg:space-y-0 py-2 lg:col-span-7">
            
            {/* Top Logo & System Subtitle */}
            <div className="mb-2 lg:mb-6">
              <div className="inline-flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-purple-600/20 blur-sm" />
                  <SmartLogo className="relative h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 drop-shadow-md" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight text-[#1e3a8a]">
                      FERTI
                    </span>
                    <span className="text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#6345A6] to-[#8b5cf6] bg-clip-text text-transparent">
                      TRACE
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#6345A6]">TM</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide mt-0.5">
                    Next-Generation IVF Witnessing
                  </div>
                </div>
              </div>
            </div>

            {/* Main Hero Headline */}
            <div className="max-w-xl">
              <h1 className="text-3xl font-normal tracking-tight text-[#334155] sm:text-4xl lg:text-5xl leading-[1.2]">
                Every Cell. Every Step.
                <span className="block font-bold bg-gradient-to-r from-[#5b3da0] via-[#6345A6] to-[#8b5cf6] bg-clip-text text-transparent mt-1">
                  Every Miracle, Traced.
                </span>
              </h1>
              
              {/* Short & Thin Gradient Accent Line */}
              <div className="mt-3.5 h-[3.5px] w-20 rounded-full bg-gradient-to-r from-[#6345A6] to-[#8b5cf6]" />

              {/* Middle Part Punch Line - Glassmorphic Pill */}
              <div className="mt-7 inline-flex items-center gap-3.5 rounded-2xl bg-white/75 p-3 pr-6 backdrop-blur-md border border-white/80 shadow-xs transition hover:bg-white/85">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100/90 text-[#6345A6] shadow-2xs">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-sm sm:text-base text-[#334155] font-normal leading-snug">
                  Precision today,<br />
                  <span className="font-bold text-[#6345A6]">Safe Parenthood</span> tomorrow.
                </div>
              </div>
            </div>

            {/* Bottom 4 Badges with Subtle Vertical Dividers */}
            <div className="mt-8 lg:mt-12 flex flex-wrap items-center justify-start gap-4 sm:gap-6 border-t border-slate-300/60 pt-5 max-w-md">
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
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
              ].map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className={`flex items-center gap-4 ${
                    idx < 3 ? 'border-r border-slate-300/60 pr-4' : ''
                  }`}
                >
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-[#6345A6] shadow-2xs group-hover:scale-105 transition-transform">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{pillar.title}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Floating Glassmorphic Login Card */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="w-full max-w-[420px] rounded-[32px] bg-white/95 p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(99,69,166,0.18)] backdrop-blur-xl ring-1 ring-slate-900/5 transition hover:shadow-[0_30px_70px_-15px_rgba(99,69,166,0.22)]">
              <LoginForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
