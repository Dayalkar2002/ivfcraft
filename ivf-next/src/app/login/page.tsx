import Image from 'next/image';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-cream">
      <div className="pointer-events-none absolute inset-0 bg-mesh-teal" />

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-2">
        {/* Left visual panel */}
        <section className="relative hidden overflow-hidden lg:flex">
          <Image
            src="/images/login-family.png"
            alt="Mother holding newborn"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-ink/90 via-brand-dark/75 to-brand-primary/40" />
          <div className="login-orb left-10 top-16 h-56 w-56 bg-brand-primary/40" />
          <div className="login-orb bottom-20 right-10 h-64 w-64 bg-brand-rose/30" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md ring-1 ring-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-soft">
                  <span className="font-display text-lg font-extrabold">s</span>
                </div>
                <div>
                  <div className="font-display text-xl font-extrabold tracking-tight text-white">smART</div>
                  <div className="text-xs font-medium text-teal-100/90">IVF & Fertility Management</div>
                </div>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/90">
                Next-gen clinic OS
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                Compassionate care,
                <span className="block bg-gradient-to-r from-teal-200 to-rose-200 bg-clip-text text-transparent">
                  smarter workflows.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-teal-50/85">
                Cycles, IUI, IVF, ICSI, ET/BT, cryo, consents, and reports — powered by your existing SQL
                Server stored procedures.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { value: 'SP', label: 'SQL Procedures' },
                  { value: 'AI', label: 'Modern UI' },
                  { value: '24×7', label: 'Clinic Ready' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/10 px-3 py-4 text-center ring-1 ring-white/15 backdrop-blur-md"
                  >
                    <div className="font-display text-xl font-bold text-white">{stat.value}</div>
                    <div className="mt-1 text-[11px] font-medium text-teal-100/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-teal-100/60">Developed by Jainamm Software</p>
          </div>
        </section>

        {/* Right auth panel */}
        <section className="relative flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="login-orb -left-10 top-10 h-40 w-40 bg-brand-primary/20 lg:hidden" />
          <div className="login-orb bottom-10 right-0 h-48 w-48 bg-brand-rose/15 lg:hidden" />

          <div className="relative w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-light px-4 py-2.5 shadow-soft">
                <span className="font-display text-lg font-extrabold text-brand-dark">smART</span>
                <span className="text-xs font-medium text-brand-green">IVF Clinic</span>
              </div>
            </div>

            <div className="glass-card rounded-[28px] p-7 shadow-card sm:p-9">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
