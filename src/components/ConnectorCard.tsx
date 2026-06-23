import { Connector } from '@/types';
import Badge from './Badge';

interface ConnectorCardProps {
  connector: Connector;
}

export default function ConnectorCard({ connector }: ConnectorCardProps) {
  return (
    <div className="glass-card glass-card-hover p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-slate-900">{connector.name}</h3>
        <Badge label={connector.status} variant={connector.status} />
      </div>
      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{connector.description}</p>
      <div className="flex items-center gap-2">
        <Badge label={connector.type} variant={connector.type} />
        {connector.docsUrl && (
          <a
            href={connector.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            Docs
          </a>
        )}
      </div>
    </div>
  );
}
