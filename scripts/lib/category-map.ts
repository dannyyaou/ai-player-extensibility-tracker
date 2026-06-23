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
// ORDER MATTERS: specific categories first, broad catch-alls last.
const mcpKeywordMap: Array<{ keywords: string[]; categoryId: string }> = [
  // Specific named products first (before broad keywords can steal them)
  { keywords: ['salesforce', 'hubspot', 'pipedrive', 'zoho crm', 'dynamics 365', 'crm'], categoryId: 'crm' },
  { keywords: ['slack', 'discord', 'email', 'gmail', 'smtp', 'imap', 'chat', 'telegram', 'teams', 'messaging', 'sms', 'twilio'], categoryId: 'communication' },
  { keywords: ['jira', 'asana', 'trello', 'linear', 'monday', 'todoist', 'clickup', 'basecamp', 'project management'], categoryId: 'project-mgmt' },
  { keywords: ['zendesk', 'intercom', 'freshdesk', 'helpdesk', 'ticket', 'servicenow', 'customer support', 'freshservice'], categoryId: 'support' },
  { keywords: ['workday', 'bamboohr', 'gusto', 'adp', 'human resource', 'recruit', 'hiring', 'employee', 'payroll', 'workforce'], categoryId: 'hr' },
  { keywords: ['stripe', 'quickbooks', 'xero', 'invoice', 'payment', 'accounting', 'bank', 'plaid', 'bookkeeping', 'ledger', 'fintech'], categoryId: 'finance' },
  { keywords: ['health', 'medical', 'clinical', 'pharma', 'veeva', 'fhir', 'hl7', 'cerner', 'medidata', 'pubmed', 'genomic', 'biotech', 'drug', 'oncolog', 'patient', 'hospital', 'therapy', 'dental', 'nursing'], categoryId: 'healthcare' },
  { keywords: ['legal', 'law', 'court', 'attorney', 'lawyer', 'litigation', 'cocounsel', 'everlaw', 'harvey', 'jurisdiction', 'statute', 'prolaw', 'practical law', 'west km', 'netdocuments', 'imanage'], categoryId: 'legal' },
  { keywords: ['coursera', 'udemy', 'edtech', 'education', 'learning', 'tutoring', 'lesson', 'curriculum', 'student', 'teacher', 'training', 'quiz'], categoryId: 'education' },
  { keywords: ['canva', 'figma', 'adobe', 'design', 'creative', 'illustration', 'sketch', 'photoshop', 'graphic', 'video edit', 'image'], categoryId: 'design' },
  { keywords: ['shopify', 'woocommerce', 'ecommerce', 'e-commerce', 'product catalog', 'retail', 'inventory', 'order management'], categoryId: 'ecommerce' },
  { keywords: ['booking.com', 'travel', 'flight', 'hotel', 'airbnb', 'airline', 'trip', 'reservation', 'tourism', 'viator', 'tripadvisor', 'trivago', 'expedia', 'kiwi.com', 'lastminute', 'wyndham'], categoryId: 'travel' },
  // Dev tools — tighter keywords, named products preferred
  { keywords: ['github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'npm', 'ci/cd', 'jenkins', 'terraform', 'sentry', 'compiler', 'ide', 'lint', 'playwright', 'selenium', 'sdk', 'api', 'devops', 'programming', 'source code', 'repository', 'pull request', 'merge request', 'commit'], categoryId: 'dev-tools' },
  { keywords: ['drive', 'dropbox', 'box', 's3', 'storage', 'file', 'filesystem', 'blob', 'minio', 'ftp', 'sftp', 'cloud storage'], categoryId: 'cloud-storage' },
  { keywords: ['siem', 'firewall', 'waf', 'encrypt', 'vulnerability', 'threat', 'antivirus', 'ediscovery', 'zero trust', 'penetration'], categoryId: 'security' },
  { keywords: ['mailchimp', 'sendgrid', 'marketing', 'campaign', 'social media', 'seo', 'ads', 'advertising', 'branding', 'newsletter'], categoryId: 'marketing' },
  // Data — tighter, named products preferred
  { keywords: ['postgres', 'mysql', 'mongo', 'redis', 'elastic', 'bigquery', 'snowflake', 'sql', 'database', 'analytics', 'supabase', 'firebase', 'tableau', 'looker', 'dbt', 'etl', 'data warehouse', 'data pipeline'], categoryId: 'data' },
  // Productivity last — intentionally broad catch-all
  { keywords: ['confluence', 'sharepoint', 'notion', 'google docs', 'office', 'document', 'wiki', 'notes', 'calendar', 'schedule', 'meeting', 'productivity', 'workspace', 'collaboration'], categoryId: 'productivity' },
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
