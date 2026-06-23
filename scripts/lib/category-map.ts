// Maps Microsoft Learn gallery headings and MCP descriptions to our category IDs.

export const msCategoryMap: Record<string, string> = {
  // Actual headings from Microsoft Learn gallery pages
  'Collaboration and communication': 'communication',
  'Content management systems': 'productivity',
  'Customer relationship management': 'crm',
  'Data visualization': 'data',
  'Databases': 'data',
  'Developer tools': 'dev-tools',
  'Files and documents': 'cloud-storage',
  'Human resources and recruiting': 'hr',
  'IT service management tools': 'support',
  'Project management': 'project-mgmt',
  'Sales': 'crm',
  'Support': 'support',
  'Others': 'productivity',
  'Certified for Microsoft 365 Copilot': 'productivity',
  'Learning': 'productivity',
  'Social networks': 'communication',
  'Website': 'data',
  // Legacy/fallback headings
  'CRM': 'crm',
  'Customer Service': 'support',
  'Developer Tools': 'dev-tools',
  'eCommerce': 'marketing',
  'eDiscovery': 'security',
  'ERP': 'finance',
  'File Sharing': 'cloud-storage',
  'HR': 'hr',
  'IT Service Management': 'support',
  'Knowledge & Content Management': 'productivity',
  'Line of Business': 'productivity',
  'Media': 'communication',
  'Multi-purpose': 'productivity',
  'Project Management & Collaboration': 'project-mgmt',
  'Social & Communication': 'communication',
  'Collaboration': 'productivity',
  'Content Management': 'productivity',
  'Data & Analytics': 'data',
  'Security & Compliance': 'security',
  'Finance': 'finance',
  'Marketing': 'marketing',
};

// Keyword-based categorization for MCP servers (no categories in the API)
const mcpKeywordMap: Array<{ keywords: string[]; categoryId: string }> = [
  { keywords: ['slack', 'discord', 'email', 'gmail', 'smtp', 'imap', 'chat', 'telegram', 'teams'], categoryId: 'communication' },
  { keywords: ['salesforce', 'crm', 'hubspot', 'pipedrive', 'zoho crm'], categoryId: 'crm' },
  { keywords: ['github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'npm', 'code', 'git', 'ci', 'cd', 'jenkins', 'terraform', 'aws', 'azure', 'gcp', 'sentry', 'debug', 'compiler', 'ide', 'lint', 'build', 'deploy', 'puppeteer', 'playwright', 'selenium', 'test'], categoryId: 'dev-tools' },
  { keywords: ['drive', 'dropbox', 'box', 's3', 'storage', 'file', 'filesystem', 'blob', 'minio', 'ftp', 'sftp'], categoryId: 'cloud-storage' },
  { keywords: ['jira', 'asana', 'trello', 'linear', 'monday', 'project', 'todoist', 'clickup', 'notion', 'basecamp'], categoryId: 'project-mgmt' },
  { keywords: ['workday', 'bamboo', 'gusto', 'adp', 'human resource', 'recruit', 'hiring', 'employee'], categoryId: 'hr' },
  { keywords: ['stripe', 'quickbooks', 'xero', 'invoice', 'payment', 'accounting', 'finance', 'bank', 'plaid'], categoryId: 'finance' },
  { keywords: ['security', 'auth', 'oauth', 'vault', 'encrypt', 'compliance', 'firewall', 'waf', 'siem'], categoryId: 'security' },
  { keywords: ['postgres', 'mysql', 'mongo', 'redis', 'elastic', 'bigquery', 'snowflake', 'sql', 'database', 'analytics', 'data', 'supabase', 'firebase', 'search', 'fetch', 'scrape', 'web', 'browse', 'crawl', 'memory', 'knowledge'], categoryId: 'data' },
  { keywords: ['zendesk', 'intercom', 'freshdesk', 'support', 'helpdesk', 'ticket', 'servicenow'], categoryId: 'support' },
  { keywords: ['mailchimp', 'sendgrid', 'marketing', 'campaign', 'social media', 'seo', 'ads', 'canva'], categoryId: 'marketing' },
  { keywords: ['google docs', 'confluence', 'sharepoint', 'productivity', 'office', 'document', 'wiki', 'notes', 'calendar', 'schedule', 'meeting'], categoryId: 'productivity' },
];

export function categorizeMcpServer(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  for (const mapping of mcpKeywordMap) {
    if (mapping.keywords.some(kw => text.includes(kw))) {
      return mapping.categoryId;
    }
  }
  return 'productivity'; // default fallback
}

export function mapMsCategory(heading: string): string {
  return msCategoryMap[heading] || 'productivity';
}
