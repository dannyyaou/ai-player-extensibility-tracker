'use client';

import { VendorId } from '@/types';

const vendorIds: VendorId[] = ['microsoft', 'google', 'anthropic', 'openai', 'glean'];

const vendorMeta: Record<VendorId, { label: string; color: string; headerBg: string; borderColor: string }> = {
  microsoft: { label: 'Microsoft', color: 'text-blue-700', headerBg: 'bg-blue-50', borderColor: 'border-blue-200' },
  google: { label: 'Google', color: 'text-emerald-700', headerBg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  anthropic: { label: 'Anthropic', color: 'text-amber-700', headerBg: 'bg-amber-50', borderColor: 'border-amber-200' },
  openai: { label: 'OpenAI', color: 'text-slate-700', headerBg: 'bg-slate-100', borderColor: 'border-slate-200' },
  glean: { label: 'Glean', color: 'text-violet-700', headerBg: 'bg-violet-50', borderColor: 'border-violet-200' },
};

interface CapabilityRow {
  capability: string;
  description: string;
  values: Record<VendorId, { text: string; sentiment: 'strong' | 'moderate' | 'weak' | 'neutral' }>;
}

interface CapabilitySection {
  title: string;
  rows: CapabilityRow[];
}

const SENTIMENT_STYLES: Record<string, string> = {
  strong: 'bg-emerald-50 text-emerald-800',
  moderate: 'bg-amber-50 text-amber-800',
  weak: 'bg-red-50 text-red-700',
  neutral: 'bg-slate-50 text-slate-700',
};

const sections: CapabilitySection[] = [
  {
    title: 'Integration Architecture',
    rows: [
      {
        capability: 'Primary integration model',
        description: 'How connectors integrate with the platform',
        values: {
          microsoft: { text: 'Graph Connectors (push/crawl into unified index)', sentiment: 'strong' },
          google: { text: 'Gemini Extensions (first-party wrappers)', sentiment: 'moderate' },
          anthropic: { text: 'MCP (open protocol, stdio/SSE transport)', sentiment: 'strong' },
          openai: { text: 'GPT Actions (OpenAPI schema → tool calls)', sentiment: 'moderate' },
          glean: { text: 'Native connectors + MCP + Push API', sentiment: 'strong' },
        },
      },
      {
        capability: 'Protocol / standard',
        description: 'Underlying protocol for data exchange',
        values: {
          microsoft: { text: 'Microsoft Graph REST API', sentiment: 'neutral' },
          google: { text: 'Proprietary extension API', sentiment: 'weak' },
          anthropic: { text: 'Model Context Protocol (open standard)', sentiment: 'strong' },
          openai: { text: 'OpenAPI 3.x specification', sentiment: 'moderate' },
          glean: { text: 'REST API + MCP', sentiment: 'moderate' },
        },
      },
      {
        capability: 'Data ingestion model',
        description: 'How data flows into the platform',
        values: {
          microsoft: { text: 'Crawl + push; data indexed in Microsoft Search', sentiment: 'strong' },
          google: { text: 'Real-time API calls at query time', sentiment: 'moderate' },
          anthropic: { text: 'Real-time tool calls via MCP servers', sentiment: 'moderate' },
          openai: { text: 'Real-time API calls per user action', sentiment: 'moderate' },
          glean: { text: 'Crawl + push; data indexed in Glean Search', sentiment: 'strong' },
        },
      },
      {
        capability: 'Offline / indexed search',
        description: 'Whether data is pre-indexed for search without live API calls',
        values: {
          microsoft: { text: 'Yes — full index in Microsoft Search', sentiment: 'strong' },
          google: { text: 'No — live queries only', sentiment: 'weak' },
          anthropic: { text: 'No — live tool calls only', sentiment: 'weak' },
          openai: { text: 'No — live API calls only', sentiment: 'weak' },
          glean: { text: 'Yes — full index in Glean Search', sentiment: 'strong' },
        },
      },
    ],
  },
  {
    title: 'Data & Access',
    rows: [
      {
        capability: 'Default data flow',
        description: 'Read-only vs. read-write access to external data',
        values: {
          microsoft: { text: 'Read-only (ingestion into index)', sentiment: 'neutral' },
          google: { text: 'Read-only', sentiment: 'neutral' },
          anthropic: { text: 'Read-write (tools can mutate data)', sentiment: 'strong' },
          openai: { text: 'Read-write (actions call external APIs)', sentiment: 'strong' },
          glean: { text: 'Read-only (search index)', sentiment: 'neutral' },
        },
      },
      {
        capability: 'Auth scope',
        description: 'Tenant-wide admin provisioning vs. per-user setup',
        values: {
          microsoft: { text: 'Tenant-level (admin deploys for org)', sentiment: 'strong' },
          google: { text: 'User-level (individual opt-in)', sentiment: 'moderate' },
          anthropic: { text: 'User-level (per-session MCP config)', sentiment: 'weak' },
          openai: { text: 'User-level (per-GPT configuration)', sentiment: 'moderate' },
          glean: { text: 'Tenant-level (admin deploys for org)', sentiment: 'strong' },
        },
      },
      {
        capability: 'Auth methods',
        description: 'Supported authentication mechanisms',
        values: {
          microsoft: { text: 'OAuth 2.0, service principals, certificates', sentiment: 'strong' },
          google: { text: 'OAuth 2.0 (Google accounts)', sentiment: 'moderate' },
          anthropic: { text: 'Varies by MCP server (OAuth, API key, none)', sentiment: 'moderate' },
          openai: { text: 'OAuth 2.0, API keys', sentiment: 'moderate' },
          glean: { text: 'OAuth 2.0, API tokens, service accounts', sentiment: 'strong' },
        },
      },
      {
        capability: 'Sync mode',
        description: 'How frequently data is refreshed',
        values: {
          microsoft: { text: 'Scheduled crawl (configurable intervals)', sentiment: 'moderate' },
          google: { text: 'Real-time (on query)', sentiment: 'strong' },
          anthropic: { text: 'Real-time (on tool call)', sentiment: 'strong' },
          openai: { text: 'Real-time (on action call)', sentiment: 'strong' },
          glean: { text: 'Scheduled crawl + incremental sync', sentiment: 'moderate' },
        },
      },
      {
        capability: 'ACL / permissions',
        description: 'Whether source-system permissions are respected',
        values: {
          microsoft: { text: 'Full ACL trimming (source permissions enforced)', sentiment: 'strong' },
          google: { text: 'Google account permissions', sentiment: 'moderate' },
          anthropic: { text: 'No built-in ACL (server-level auth only)', sentiment: 'weak' },
          openai: { text: 'No built-in ACL', sentiment: 'weak' },
          glean: { text: 'Full ACL trimming (source permissions enforced)', sentiment: 'strong' },
        },
      },
    ],
  },
  {
    title: 'Developer Experience',
    rows: [
      {
        capability: 'SDK / tooling',
        description: 'Developer tools and SDKs available',
        values: {
          microsoft: { text: 'Graph SDK (.NET, Java, Python, JS, Go), CLI', sentiment: 'strong' },
          google: { text: 'Limited — first-party only, no public SDK', sentiment: 'weak' },
          anthropic: { text: 'MCP SDK (TypeScript, Python), Claude CLI', sentiment: 'strong' },
          openai: { text: 'OpenAPI schema + GPT Builder UI', sentiment: 'moderate' },
          glean: { text: 'REST API, Push API SDK', sentiment: 'moderate' },
        },
      },
      {
        capability: 'Third-party / community connectors',
        description: 'Whether third parties can build and publish connectors',
        values: {
          microsoft: { text: 'Yes — ISV partner program + community', sentiment: 'strong' },
          google: { text: 'No — Google-built only', sentiment: 'weak' },
          anthropic: { text: 'Yes — open ecosystem, anyone can publish MCP servers', sentiment: 'strong' },
          openai: { text: 'Yes — GPT Store for custom actions', sentiment: 'strong' },
          glean: { text: 'Limited — partner-built + Push API', sentiment: 'moderate' },
        },
      },
      {
        capability: 'Connector marketplace',
        description: 'Discovery and distribution of connectors',
        values: {
          microsoft: { text: 'Microsoft 365 admin center gallery', sentiment: 'strong' },
          google: { text: 'Built-in extensions list', sentiment: 'weak' },
          anthropic: { text: 'Community registries (npmjs, GitHub, Smithery)', sentiment: 'moderate' },
          openai: { text: 'GPT Store', sentiment: 'strong' },
          glean: { text: 'Glean admin console catalog', sentiment: 'moderate' },
        },
      },
      {
        capability: 'Schema / type system',
        description: 'How connector data is structured',
        values: {
          microsoft: { text: 'Typed schema with semantic labels, ExternalItem', sentiment: 'strong' },
          google: { text: 'Unstructured (extension-defined)', sentiment: 'weak' },
          anthropic: { text: 'JSON Schema for tool parameters', sentiment: 'moderate' },
          openai: { text: 'OpenAPI schema with JSON Schema types', sentiment: 'moderate' },
          glean: { text: 'Typed schema with custom properties', sentiment: 'strong' },
        },
      },
    ],
  },
  {
    title: 'Enterprise Readiness',
    rows: [
      {
        capability: 'Admin controls',
        description: 'IT admin governance and management capabilities',
        values: {
          microsoft: { text: 'Full M365 admin center, Entra ID policies, DLP', sentiment: 'strong' },
          google: { text: 'Google Workspace admin console', sentiment: 'moderate' },
          anthropic: { text: 'Limited — no centralized admin console', sentiment: 'weak' },
          openai: { text: 'ChatGPT Enterprise admin, Team controls', sentiment: 'moderate' },
          glean: { text: 'Full admin console, role-based access', sentiment: 'strong' },
        },
      },
      {
        capability: 'Compliance / certifications',
        description: 'Regulatory compliance and data residency',
        values: {
          microsoft: { text: 'SOC 2, ISO 27001, FedRAMP, GDPR, HIPAA', sentiment: 'strong' },
          google: { text: 'SOC 2, ISO 27001, FedRAMP', sentiment: 'strong' },
          anthropic: { text: 'SOC 2, HIPAA (via API)', sentiment: 'moderate' },
          openai: { text: 'SOC 2, GDPR, HIPAA (Enterprise)', sentiment: 'moderate' },
          glean: { text: 'SOC 2, ISO 27001, GDPR', sentiment: 'strong' },
        },
      },
      {
        capability: 'Multi-tenant isolation',
        description: 'Data isolation between tenants/organizations',
        values: {
          microsoft: { text: 'Full tenant isolation in Microsoft 365', sentiment: 'strong' },
          google: { text: 'Workspace domain isolation', sentiment: 'strong' },
          anthropic: { text: 'Organization-level API keys', sentiment: 'moderate' },
          openai: { text: 'Organization-level isolation', sentiment: 'moderate' },
          glean: { text: 'Full tenant isolation', sentiment: 'strong' },
        },
      },
      {
        capability: 'Audit logging',
        description: 'Activity tracking and audit trail',
        values: {
          microsoft: { text: 'Unified audit log, Microsoft Purview', sentiment: 'strong' },
          google: { text: 'Google Workspace audit logs', sentiment: 'moderate' },
          anthropic: { text: 'API request logs only', sentiment: 'weak' },
          openai: { text: 'Usage logs, conversation history', sentiment: 'moderate' },
          glean: { text: 'Activity logs, search analytics', sentiment: 'moderate' },
        },
      },
    ],
  },
  {
    title: 'AI Integration',
    rows: [
      {
        capability: 'AI model access',
        description: 'Which AI models power the platform',
        values: {
          microsoft: { text: 'GPT-4o via Azure OpenAI (multi-model roadmap)', sentiment: 'strong' },
          google: { text: 'Gemini (1.5 Pro / Flash / Ultra)', sentiment: 'strong' },
          anthropic: { text: 'Claude (Opus, Sonnet, Haiku)', sentiment: 'strong' },
          openai: { text: 'GPT-4o, o1, o3, GPT-4.5', sentiment: 'strong' },
          glean: { text: 'Multi-model (GPT-4, Claude, custom fine-tuned)', sentiment: 'strong' },
        },
      },
      {
        capability: 'Grounding / RAG',
        description: 'How AI responses are grounded in source data',
        values: {
          microsoft: { text: 'Microsoft Graph grounding + Semantic Index', sentiment: 'strong' },
          google: { text: 'Google Search grounding', sentiment: 'moderate' },
          anthropic: { text: 'Tool-call based (no built-in RAG)', sentiment: 'weak' },
          openai: { text: 'File search + web browsing', sentiment: 'moderate' },
          glean: { text: 'Enterprise knowledge graph + semantic search', sentiment: 'strong' },
        },
      },
      {
        capability: 'Citation / attribution',
        description: 'Whether responses include source references',
        values: {
          microsoft: { text: 'Inline citations with links to source items', sentiment: 'strong' },
          google: { text: 'Source links for Search grounding', sentiment: 'moderate' },
          anthropic: { text: 'No built-in citation system', sentiment: 'weak' },
          openai: { text: 'Citations in file search results', sentiment: 'moderate' },
          glean: { text: 'Inline citations with source links + permissions', sentiment: 'strong' },
        },
      },
    ],
  },
];

function SentimentDot({ sentiment }: { sentiment: string }) {
  const colors: Record<string, string> = {
    strong: 'bg-emerald-400',
    moderate: 'bg-amber-400',
    weak: 'bg-red-400',
    neutral: 'bg-slate-300',
  };
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors[sentiment] || colors.neutral}`} />;
}

export default function PlatformCapabilities() {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title} className="glass-card overflow-hidden">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">{section.title}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3 min-w-[180px] w-[180px]">
                    Capability
                  </th>
                  {vendorIds.map(vid => (
                    <th key={vid} className={`text-center text-xs font-semibold px-3 py-3 min-w-[160px] ${vendorMeta[vid].color}`}>
                      {vendorMeta[vid].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={row.capability} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-medium text-slate-900">{row.capability}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{row.description}</div>
                    </td>
                    {vendorIds.map(vid => {
                      const val = row.values[vid];
                      return (
                        <td key={vid} className="px-3 py-3 align-top">
                          <div className={`rounded-md px-2.5 py-2 text-xs leading-relaxed ${SENTIMENT_STYLES[val.sentiment]}`}>
                            <SentimentDot sentiment={val.sentiment} />
                            {val.text}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-slate-700 mb-2">Sentiment Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="flex items-center"><SentimentDot sentiment="strong" /> Strong — industry-leading or fully featured</span>
          <span className="flex items-center"><SentimentDot sentiment="moderate" /> Moderate — functional but with gaps</span>
          <span className="flex items-center"><SentimentDot sentiment="weak" /> Weak — limited or not available</span>
          <span className="flex items-center"><SentimentDot sentiment="neutral" /> Neutral — design choice, not a gap</span>
        </div>
      </div>
    </div>
  );
}
