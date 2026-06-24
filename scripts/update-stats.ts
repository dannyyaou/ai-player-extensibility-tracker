import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, '..', 'public', 'data');
const connectorsDir = path.join(dataDir, 'connectors');

interface Connector {
  id: string;
  vendorId: string;
  name: string;
  categoryId: string;
  type: string;
  status: string;
}

const vendorFiles = ['microsoft', 'google', 'anthropic', 'openai', 'glean'];
const allConnectors: Connector[] = [];
const vendorCounts: Record<string, number> = {};
const categoryCounts: Record<string, number> = {};

for (const vendor of vendorFiles) {
  const filePath = path.join(connectorsDir, `${vendor}.json`);
  const connectors: Connector[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  allConnectors.push(...connectors);
  vendorCounts[vendor] = connectors.length;
  for (const c of connectors) {
    categoryCounts[c.categoryId] = (categoryCounts[c.categoryId] || 0) + 1;
  }
}

const categories: { id: string }[] = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf-8')
);
const coverage = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'coverage.json'), 'utf-8')
);

const stats = {
  totalConnectors: allConnectors.length,
  totalVendors: vendorFiles.length,
  totalCategories: categories.length,
  coverageEntries: coverage.length,
  vendorCounts,
  categoryCounts,
};

fs.writeFileSync(path.join(dataDir, 'stats.json'), JSON.stringify(stats, null, 2));
console.log('Stats updated:', stats);
