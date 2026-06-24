/**
 * Orchestrator: launches a single Chromium instance and runs all 5 vendor
 * crawlers in parallel, then updates vendors.json and stats.json.
 */
import * as path from 'path';
import { chromium } from 'playwright';
import { DATA_DIR, CONNECTORS_DIR, readJsonFile, writeJsonFile } from './lib/utils';
import { crawlMicrosoft } from './crawl-microsoft';
import { crawlAnthropic } from './crawl-anthropic';
import { crawlGoogle } from './crawl-google';
import { crawlOpenAI } from './crawl-openai';
import { crawlGlean } from './crawl-glean';

interface Vendor {
  id: string;
  name: string;
  productName: string;
  description: string;
  color: string;
  websiteUrl: string;
  totalConnectors: number;
  officialConnectors: number;
}

interface Connector {
  id: string;
  vendorId: string;
  name: string;
  categoryId: string;
  type: string;
  status: string;
}

async function main() {
  console.log('=== Copilot Extensibility Tracker: Data Update ===\n');

  // Launch a single browser instance shared across all crawlers
  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  try {
    // Run all 5 crawlers in parallel
    console.log('Starting crawlers...\n');
    const [msConnectors, anthropicConnectors, googleConnectors, openaiConnectors, gleanConnectors] = await Promise.all([
      crawlMicrosoft(browser),
      crawlAnthropic(browser),
      crawlGoogle(browser),
      crawlOpenAI(browser),
      crawlGlean(browser),
    ]);

    console.log('\nCrawl complete.');
    console.log(`  Microsoft: ${msConnectors.length} connectors`);
    console.log(`  Anthropic: ${anthropicConnectors.length} connectors`);
    console.log(`  Google: ${googleConnectors.length} connectors`);
    console.log(`  OpenAI: ${openaiConnectors.length} connectors`);
    console.log(`  Glean: ${gleanConnectors.length} connectors`);

    // Fall back to existing data if crawl returned nothing
    const allByVendor: Record<string, Connector[]> = {
      microsoft: msConnectors.length > 0 ? msConnectors : readJsonFile(path.join(CONNECTORS_DIR, 'microsoft.json')),
      anthropic: anthropicConnectors.length > 0 ? anthropicConnectors : readJsonFile(path.join(CONNECTORS_DIR, 'anthropic.json')),
      google: googleConnectors.length > 0 ? googleConnectors : readJsonFile(path.join(CONNECTORS_DIR, 'google.json')),
      openai: openaiConnectors.length > 0 ? openaiConnectors : readJsonFile(path.join(CONNECTORS_DIR, 'openai.json')),
      glean: gleanConnectors.length > 0 ? gleanConnectors : readJsonFile(path.join(CONNECTORS_DIR, 'glean.json')),
    };

    // Update vendors.json with new counts
    console.log('\nUpdating vendors.json...');
    const vendors: Vendor[] = readJsonFile(path.join(DATA_DIR, 'vendors.json'));
    for (const vendor of vendors) {
      const connectors = allByVendor[vendor.id] || [];
      vendor.totalConnectors = connectors.length;
      vendor.officialConnectors = connectors.filter(c => c.type === 'official').length;
    }
    writeJsonFile(path.join(DATA_DIR, 'vendors.json'), vendors);

    // Update stats.json
    console.log('Updating stats.json...');
    const allConnectors = Object.values(allByVendor).flat();
    const categories: { id: string }[] = readJsonFile(path.join(DATA_DIR, 'categories.json'));
    const coverage = readJsonFile<unknown[]>(path.join(DATA_DIR, 'coverage.json'));

    const vendorCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (const [vid, connectors] of Object.entries(allByVendor)) {
      vendorCounts[vid] = connectors.length;
      for (const c of connectors) {
        categoryCounts[c.categoryId] = (categoryCounts[c.categoryId] || 0) + 1;
      }
    }

    const stats = {
      totalConnectors: allConnectors.length,
      totalVendors: vendors.length,
      totalCategories: categories.length,
      coverageEntries: coverage.length,
      vendorCounts,
      categoryCounts,
    };
    writeJsonFile(path.join(DATA_DIR, 'stats.json'), stats);

    console.log('\n=== Summary ===');
    console.log(`Total connectors: ${stats.totalConnectors}`);
    for (const [vid, count] of Object.entries(vendorCounts)) {
      const v = vendors.find(v => v.id === vid);
      console.log(`  ${v?.name || vid}: ${count} (${v?.officialConnectors || 0} official)`);
    }
    console.log('\nDone!');
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
