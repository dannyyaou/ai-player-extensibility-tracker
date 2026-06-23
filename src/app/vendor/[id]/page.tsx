import { notFound } from 'next/navigation';
import { getVendor, getVendors, getConnectors, getCategories } from '@/lib/data';
import VendorDetailClient from '@/components/VendorDetailClient';

export function generateStaticParams() {
  const vendors = getVendors();
  return vendors.map((v) => ({ id: v.id }));
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = getVendor(params.id);
  if (!vendor) {
    notFound();
  }

  const connectors = getConnectors(params.id);
  const categories = getCategories();

  return (
    <VendorDetailClient
      vendor={vendor}
      connectors={connectors}
      categories={categories}
    />
  );
}
