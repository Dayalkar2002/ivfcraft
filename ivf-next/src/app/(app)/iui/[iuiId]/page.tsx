import { Suspense } from 'react';
import { IuiEntryClient } from './iui-entry-client';

export default async function IuiEntryPage({ params }: { params: Promise<{ iuiId: string }> }) {
  const { iuiId } = await params;
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
      <IuiEntryClient iuiId={iuiId} />
    </Suspense>
  );
}
