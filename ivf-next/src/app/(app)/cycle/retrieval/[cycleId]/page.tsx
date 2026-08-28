import { CycleRetrievalForm } from '@/components/cycle-retrieval-form';

export default async function CycleRetrievalPage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  return <CycleRetrievalForm cycleId={cycleId} />;
}
