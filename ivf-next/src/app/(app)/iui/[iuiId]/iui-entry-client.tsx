'use client';

import { IuiEntryForm } from '@/components/iui-entry-form';

export function IuiEntryClient({ iuiId }: { iuiId: string }) {
  return <IuiEntryForm iuiId={iuiId} />;
}
