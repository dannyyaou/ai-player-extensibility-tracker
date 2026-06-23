/**
 * Crawl Microsoft Learn Graph Connectors gallery pages using Playwright.
 * Two pages: microsoft-built and partner-built.
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { mapMsCategory } from './lib/category-map';

interface Connector {
  id: string;
  vendorId: 'microsoft';
  name: string;
  description: string;
  categoryId: string;
  type: 'official' | 'third-party';
  status: 'stable' | 'beta' | 'preview' | 'deprecated';
  docsUrl?: string;
  publisher?: string;
}

const MS_BUILT_URL = 'https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connectors-gallery-microsoft';
const PARTNER_BUILT_URL = 'https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connectors-gallery-partners';

async function parseGalleryPage(browser: Browser, url: string, type: 'official' | 'third-party'): Promise<Connector[]> {
  console.log(`  Fetching ${url}...`);
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for tables to render
    await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});

    const connectors = await page.evaluate((connectorType: string) => {
      const results: Array<{
        name: string;
        description: string;
        category: string;
        isPreview: boolean;
        link: string | null;
        publisher: string | undefined;
      }> = [];

      let currentCategory = 'productivity';
      const elements = document.querySelectorAll('h2, h3, table');

      for (const el of elements) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'h2' || tag === 'h3') {
          const heading = el.textContent?.trim() || '';
          if (heading && !heading.toLowerCase().includes('overview') &&
              !heading.toLowerCase().includes('next step') &&
              !heading.toLowerCase().includes('related content') &&
              !heading.toLowerCase().includes('see also')) {
            currentCategory = heading;
          }
        } else if (tag === 'table') {
          const rows = el.querySelectorAll('tbody tr, tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const nameCell = cells[0];
            let name = nameCell.textContent?.trim() || '';
            const isPreview = name.toLowerCase().includes('(preview)');
            name = name.replace(/\s*\(preview\)/gi, '').replace(/\*+$/g, '').trim();

            const linkEl = nameCell.querySelector('a') || cells[cells.length - 1].querySelector('a');
            const link = linkEl?.getAttribute('href') || null;

            const publisher = cells.length >= 3 ? cells[1].textContent?.trim() : undefined;
            let description: string;
            if (cells.length >= 4) {
              description = cells[2].textContent?.trim() || '';
            } else if (cells.length >= 3) {
              description = cells[2].textContent?.trim() || '';
            } else {
              description = cells[1].textContent?.trim() || '';
            }

            if (name && name.length > 0 && name !== 'Connector name') {
              results.push({ name, description, category: currentCategory, isPreview, link, publisher });
            }
          }
        }
      }
      return results;
    }, type);

    return connectors.map(c => {
      const connectorType = type === 'official' ? 'official' : 'third-party';
      const idBase = connectorType === 'third-party' && c.publisher
        ? `ms-${slugify(c.name)}-${slugify(c.publisher)}`
        : `ms-${slugify(c.name)}`;

      let docsUrl: string | undefined;
      if (c.link) {
        if (c.link.startsWith('http')) {
          docsUrl = c.link;
        } else if (c.link.startsWith('/')) {
          docsUrl = `https://learn.microsoft.com${c.link}`;
        } else {
          docsUrl = `https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/${c.link}`;
        }
      }

      const description = c.description.length > 200
        ? c.description.slice(0, 197) + '...'
        : (c.description || `${c.name} connector for Microsoft 365.`);

      return {
        id: idBase,
        vendorId: 'microsoft' as const,
        name: c.name,
        description,
        categoryId: mapMsCategory(c.category),
        type: connectorType,
        status: c.isPreview ? 'preview' as const : 'stable' as const,
        ...(docsUrl ? { docsUrl } : {}),
        ...(c.publisher && connectorType === 'third-party' ? { publisher: c.publisher } : {}),
      };
    });
  } finally {
    await page.close();
  }
}

export async function crawlMicrosoft(browser: Browser): Promise<Connector[]> {
  console.log('Crawling Microsoft connectors...');

  let microsoftBuilt: Connector[] = [];
  let partnerBuilt: Connector[] = [];

  try {
    microsoftBuilt = await parseGalleryPage(browser, MS_BUILT_URL, 'official');
    console.log(`  Found ${microsoftBuilt.length} Microsoft-built connectors`);
  } catch (err) {
    console.warn(`  Warning: Could not fetch Microsoft-built page: ${err}`);
  }

  try {
    partnerBuilt = await parseGalleryPage(browser, PARTNER_BUILT_URL, 'third-party');
    console.log(`  Found ${partnerBuilt.length} partner-built connectors`);
  } catch (err) {
    console.warn(`  Warning: Could not fetch partner-built page: ${err}`);
  }

  const allConnectors = [...microsoftBuilt, ...partnerBuilt];

  // Deduplicate by ID
  const seen = new Set<string>();
  const deduped: Connector[] = [];
  for (const c of allConnectors) {
    let id = c.id;
    let counter = 1;
    while (seen.has(id)) {
      id = `${c.id}-${++counter}`;
    }
    seen.add(id);
    deduped.push({ ...c, id });
  }

  if (deduped.length === 0) {
    console.warn('  Warning: No connectors crawled from Microsoft. Keeping existing data.');
    return [];
  }

  const outPath = path.join(CONNECTORS_DIR, 'microsoft.json');
  writeJsonFile(outPath, deduped);
  return deduped;
}

// Allow running standalone
if (require.main === module) {
  (async () => {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    try {
      const connectors = await crawlMicrosoft(browser);
      console.log(`Done. Total Microsoft connectors: ${connectors.length}`);
    } finally {
      await browser.close();
    }
  })().catch(console.error);
}
