'use client';

import { useParams } from 'next/navigation';
import { ModuleRunner } from '@/components/module-runner';

export default function ModuleCatchAllPage() {
  const params = useParams<{ slug: string[] }>();
  const path = (params.slug ?? []).join('/');

  return <ModuleRunner path={path} />;
}
