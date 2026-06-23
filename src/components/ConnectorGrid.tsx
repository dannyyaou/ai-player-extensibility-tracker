import { Connector } from '@/types';
import ConnectorCard from './ConnectorCard';

interface ConnectorGridProps {
  connectors: Connector[];
}

export default function ConnectorGrid({ connectors }: ConnectorGridProps) {
  if (connectors.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-500">No connectors match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map((connector) => (
        <ConnectorCard key={connector.id} connector={connector} />
      ))}
    </div>
  );
}
