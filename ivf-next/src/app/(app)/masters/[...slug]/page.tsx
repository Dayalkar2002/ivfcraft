'use client';

import { useParams } from 'next/navigation';
import { ModuleRunner } from '@/components/module-runner';

export default function MastersCatchAllPage() {
  const params = useParams<{ slug: string[] }>();
  const path = ['masters', ...(params.slug ?? [])].join('/');

  return <ModuleRunner path={path} />;
}
