interface ModulePlaceholderProps {
  title: string;
  description: string;
  variant?: 'pending' | 'info';
}

export function ModulePlaceholder({ title, description, variant = 'pending' }: ModulePlaceholderProps) {
  const badge =
    variant === 'info'
      ? { label: 'Information', className: 'bg-sky-50 text-sky-700' }
      : { label: 'Not configured', className: 'bg-amber-50 text-amber-700' };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
      <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
      {variant === 'pending' && (
        <p className="mt-4 text-sm text-slate-500">
          Add an entry in <code className="rounded bg-slate-100 px-1">module-registry.ts</code> or wire a dedicated page to
          connect this route to stored procedures via <code className="rounded bg-slate-100 px-1">/api/sp</code>.
        </p>
      )}
    </div>
  );
}
