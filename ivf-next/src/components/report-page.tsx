'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ModuleRunner } from '@/components/module-runner';
import { REPORT_MENU_GROUPS } from '@/lib/nav-config';
import { getModuleDefinition, titleFromSlug } from '@/lib/module-registry';

export function ReportPage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug ?? [];
  const path = slug.length ? `reports/${slug.join('/')}` : 'reports';
  const title = titleFromSlug(slug.length ? slug : ['reports']);

  const matchedRoute = useMemo(() => {
    for (const group of REPORT_MENU_GROUPS) {
      for (const item of group.items) {
        const routeSlug = item.route.replace(/^\/reports\/?/, '');
        if (routeSlug === slug.join('/')) return item;
      }
    }
    return null;
  }, [slug]);

  const displayTitle = matchedRoute?.label ?? title;
  const reportsHub = slug.length === 0;

  if (reportsHub) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">Reports Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Select a report below. Each report runs its legacy stored procedure through the unified SP
            executor when SQL is configured.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {REPORT_MENU_GROUPS.map((group) => (
            <div key={group.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.route}>
                    <Link
                      href={item.route}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-mist hover:text-brand-dark"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const def = getModuleDefinition(path);
  if (def) {
    return <ModuleRunner path={path} titleOverride={displayTitle} />;
  }

  return (
    <div className="space-y-4">
      <ModuleRunner path={path} titleOverride={displayTitle} />
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Available reports</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {REPORT_MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{group.label}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.route}>
                    <Link href={item.route} className="text-sm text-brand-primary hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
