import { CommonMasterForm } from '@/components/common-master-form';

export default async function CommonMasterPage({ params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params;
  return <CommonMasterForm catId={Number(catId)} />;
}
