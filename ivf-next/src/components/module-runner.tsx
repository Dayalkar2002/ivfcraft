'use client';

import { CommonMasterForm } from '@/components/common-master-form';
import { CryoModule } from '@/components/cryo-module';
import { ModuleHub } from '@/components/module-hub';
import { ModulePlaceholder } from '@/components/module-placeholder';
import { ReportRunner } from '@/components/report-runner';
import { SpCrudModule } from '@/components/sp-crud-module';
import { getModuleDefinition, titleFromSlug, type ModuleDefinition } from '@/lib/module-registry';

interface ModuleRunnerProps {
  /** Route path without leading slash, e.g. `cryo/semen-self` or `reports/ivf-summary` */
  path: string;
  /** Override title from registry (e.g. nav label) */
  titleOverride?: string;
}

function renderModule(def: ModuleDefinition, title: string) {
  switch (def.kind) {
    case 'common-crud':
      return def.commonCatId != null ? <CommonMasterForm catId={def.commonCatId} /> : null;
    case 'sp-crud':
      return def.spCrud ? (
        <SpCrudModule title={title} description={def.description} spec={def.spCrud} note={def.note} />
      ) : null;
    case 'report':
      return def.report ? (
        <ReportRunner title={title} description={def.description} spec={def.report} note={def.note} />
      ) : null;
    case 'cryo-list':
      return def.cryo ? <CryoModule title={title} description={def.description} spec={def.cryo} note={def.note} /> : null;
    case 'hub':
      return def.hubLinks ? (
        <ModuleHub title={title} description={def.description} links={def.hubLinks} note={def.note} />
      ) : null;
    case 'info':
      return (
        <div className="space-y-3">
          <ModulePlaceholder title={title} description={def.description} variant="info" />
          {def.note && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{def.note}</p>
          )}
        </div>
      );
    default:
      return null;
  }
}

export function ModuleRunner({ path, titleOverride }: ModuleRunnerProps) {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  const def = getModuleDefinition(normalized);
  const slug = normalized.split('/');
  const title = titleOverride ?? def?.title ?? titleFromSlug(slug);

  if (def) {
    const rendered = renderModule(def, title);
    if (rendered) return rendered;
  }

  return (
    <ModulePlaceholder
      title={title}
      description={
        def?.description ??
        `The ${normalized || 'module'} screen is registered in navigation. Configure it in module-registry.ts or add a dedicated page.`
      }
    />
  );
}
