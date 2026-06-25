import PlatformCapabilities from '@/components/PlatformCapabilities';

export default function CapabilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Capabilities Comparison</h1>
        <p className="text-sm text-slate-600 mt-1">
          Side-by-side comparison of what each vendor&apos;s extensibility platform provides
          at the platform level — architecture, developer experience, and enterprise readiness.
        </p>
      </div>

      <PlatformCapabilities />
    </div>
  );
}
