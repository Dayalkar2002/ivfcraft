import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <header className="absolute left-8 top-7 z-10 max-[480px]:left-5 max-[480px]:top-5">
        <div className="inline-flex flex-col gap-0.5 rounded-[10px] bg-brand-light px-[18px] py-2.5 shadow-[0_2px_10px_rgba(46,125,50,0.12)] max-[480px]:px-3.5 max-[480px]:py-2">
          <span className="text-xl font-extrabold tracking-wide text-brand-green max-[480px]:text-lg">
            smART
          </span>
          <span className="text-[11px] font-medium text-green-400 max-[480px]:text-[10px]">
            IVF Clinic Management System
          </span>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pb-12 pt-24 max-[480px]:px-5 max-[480px]:pb-8 max-[480px]:pt-[88px]">
        <LoginForm />
      </main>
    </div>
  );
}
