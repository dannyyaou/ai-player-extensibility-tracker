/**
 * Crawl glean.com/connectors page for Glean connectors using Playwright.
 * The page uses Webflow CMS pagination with query param c2fbc4ef_page.
 * Each card may have integration type badges (Native, MCP, Push API, etc.).
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { mapGleanCategory } from './lib/category-map';

interface GleanConnector {
  id: string;
  vendorId: 'glean';
  name: string;
  description: string;
  categoryId: string;
  type: 'official';
  status: 'stable';
  sourceUrl?: string;
  integrationTypes?: string[];
}

const BASE_URL = 'https://www.glean.com/connectors';
const PAGES = [
  BASE_URL,
  `${BASE_URL}?c2fbc4ef_page=2`,
  `${BASE_URL}?c2fbc4ef_page=3`,
];

export async function crawlGlean(browser: Browser): Promise<GleanConnector[]> {
  console.log('Crawling Glean connectors (glean.com/connectors)...');

  const page = await browser.newPage();
  const allRaw: Array<{ name: string; description: string; category: string; link: string | null; integrationTypes: string[] }> = [];

  try {
    for (const url of PAGES) {
      console.log(`  Loading ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2000);

      // Dismiss cookie banner if present
      const acceptCookies = await page.$('button:has-text("Accept")');
      if (acceptCookies) {
        await acceptCookies.click().catch(() => {});
        await page.waitForTimeout(500);
      }

      const pageRaw = await page.evaluate(() => {
        const results: Array<{
          name: string;
          description: string;
          category: string;
          link: string | null;
          integrationTypes: string[];
        }> = [];

        // Glean uses Webflow CMS with Finsweet attributes
        // Cards are in div.connectors-grid_item > div.result-item
        const cards = document.querySelectorAll('div.connectors-grid_item');

        for (const card of cards) {
          // Name: div with fs-cmsfilter-field="Name" (class connector-name-label)
          const nameEl = card.querySelector('div[fs-cmsfilter-field="Name"], .connector-name-label');
          const name = nameEl?.textContent?.trim() || '';
          if (!name || name.length < 2) continue;

          // Category: div with fs-cmsfilter-field="Category"
          const categoryEl = card.querySelector('div[fs-cmsfilter-field="Category"]');
          const category = categoryEl?.textContent?.trim() || '';

          // Integration type tags: div.connector-tag > div[fs-cmsfilter-field="tag"]
          const integrationTypes: string[] = [];
          const tagEls = card.querySelectorAll('div.connector-tag div[fs-cmsfilter-field="tag"]');
          for (const tag of tagEls) {
            const text = tag.textContent?.trim();
            if (text) {
              integrationTypes.push(text);
            }
          }

          // Detail link: a.connector-link-wrapper
          const linkEl = card.querySelector('a.connector-link-wrapper');
          const link = linkEl?.getAttribute('href') || null;

          // Description — not visible on the listing page, use empty
          results.push({ name, description: '', category, link, integrationTypes });
        }

        return results;
      });

      allRaw.push(...pageRaw);
    }

    // Deduplicate by name (page may render cards twice for desktop/mobile)
    const seenNames = new Set<string>();
    const dedupedRaw = allRaw.filter(raw => {
      const key = raw.name.toLowerCase().trim();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    if (dedupedRaw.length === 0) {
      console.warn('  Warning: No connectors found on glean.com/connectors. Keeping existing data.');
      return [];
    }

    const seen = new Set<string>();
    const connectors: GleanConnector[] = [];

    for (const raw of dedupedRaw) {
      const categoryId = raw.category ? mapGleanCategory(raw.category) : 'productivity';
      let id = `gl-${slugify(raw.name)}`;
      let counter = 1;
      while (seen.has(id)) {
        id = `gl-${slugify(raw.name)}-${++counter}`;
      }
      seen.add(id);

      let sourceUrl: string | undefined;
      if (raw.link) {
        sourceUrl = raw.link.startsWith('http') ? raw.link : `https://www.glean.com${raw.link}`;
      }

      const connector: GleanConnector = {
        id,
        vendorId: 'glean',
        name: raw.name,
        description: raw.description || `${raw.name} connector for Glean.`,
        categoryId,
        type: 'official',
        status: 'stable',
        ...(sourceUrl ? { sourceUrl } : {}),
        ...(raw.integrationTypes.length > 0 ? { integrationTypes: raw.integrationTypes } : {}),
      };

      connectors.push(connector);
    }

    const outPath = path.join(CONNECTORS_DIR, 'glean.json');
    writeJsonFile(outPath, connectors);
    console.log(`  Found ${connectors.length} Glean connectors`);
    return connectors;
  } catch (err) {
    console.warn(`  Warning: Failed to crawl Glean connectors: ${err}`);
    return [];
  } finally {
    await page.close();
  }
}

// Allow running standalone
if (require.main === module) {
  (async () => {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    try {
      const connectors = await crawlGlean(browser);
      console.log(`Done. Total Glean connectors: ${connectors.length}`);
    } finally {
      await browser.close();
    }
  })().catch(console.error);
}
