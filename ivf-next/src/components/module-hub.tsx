'use client';

import Link from 'next/link';
import { ModuleCard } from '@/components/clinical/clinical-shared';
import type { HubLink } from '@/lib/module-registry';

interface ModuleHubProps {
  title: string;
  description: string;
  links: HubLink[];
  note?: string;
}

export function ModuleHub({ title, description, links, note }: ModuleHubProps) {
  return (
    <ModuleCard title={title}>
      <p className="mb-4 text-sm text-slate-600">{description}</p>
      {note && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{note}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-primary hover:bg-brand-light/30"
          >
            <div className="font-medium text-brand-primary">{link.label}</div>
            {link.description && <div className="mt-1 text-xs text-slate-500">{link.description}</div>}
          </Link>
        ))}
      </div>
    </ModuleCard>
  );
}
