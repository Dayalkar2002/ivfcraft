'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ModuleRunner } from '@/components/module-runner';
import { ModulePlaceholder } from '@/components/module-placeholder';
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
      <div className="space-y-4">
        <ModulePlaceholder
          title="Reports"
          description="Select a report below. Each report runs its legacy stored procedure through the unified SP executor when SQL is configured."
          variant="info"
        />
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
