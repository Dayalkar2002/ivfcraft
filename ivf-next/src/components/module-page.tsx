import { ModuleRunner } from '@/components/module-runner';
import type { PendingModuleMeta } from '@/lib/pending-modules';

interface ModulePageProps {
  meta: PendingModuleMeta;
  path?: string;
}

/** @deprecated Use ModuleRunner directly */
export function ModulePage({ meta, path }: ModulePageProps) {
  if (path) {
    return <ModuleRunner path={path} titleOverride={meta.title} />;
  }

  return <ModuleRunner path="" titleOverride={meta.title} />;
}
