import { notFound } from 'next/navigation';
import { getVendor, getVendors, getConnectors, getCategories } from '@/lib/data';
import VendorDetailClient from '@/components/VendorDetailClient';

export function generateStaticParams() {
  const vendors = getVendors();
  return vendors.map((v) => ({ id: v.id }));
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = getVendor(id);
  if (!vendor) {
    notFound();
  }

  const connectors = getConnectors(id);
  const categories = getCategories();

  return (
    <VendorDetailClient
      vendor={vendor}
      connectors={connectors}
      categories={categories}
    />
  );
}
