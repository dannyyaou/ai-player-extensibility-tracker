/**
 * Crawl claude.com/connectors page for official Anthropic connectors using Playwright.
 * The page uses Webflow CMS pagination — clicking "View more" loads 24 items per page.
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { categorizeMcpServer } from './lib/category-map';

interface Connector {
  id: string;
  vendorId: 'anthropic';
  name: string;
  description: string;
  categoryId: string;
  type: 'official';
  status: 'stable';
  sourceUrl?: string;
}

const CONNECTORS_URL = 'https://claude.com/connectors#connectors';

export async function crawlAnthropic(browser: Browser): Promise<Connector[]> {
  console.log('Crawling Anthropic connectors (claude.com/connectors)...');

  const page = await browser.newPage();
  try {
    await page.goto(CONNECTORS_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Dismiss cookie banner if present
    const acceptCookies = await page.$('button:has-text("Accept all cookies")');
    if (acceptCookies) {
      await acceptCookies.click();
      await page.waitForTimeout(500);
    }

    // Click "View more" pagination button until all pages are loaded
    let clickCount = 0;
    const maxClicks = 50;
    while (clickCount < maxClicks) {
      const viewMore = await page.$('a.w-pagination-next');
      if (!viewMore) break;
      const isVisible = await viewMore.isVisible().catch(() => false);
      if (!isVisible) break;
      await viewMore.click();
      clickCount++;
      await page.waitForTimeout(1500);
    }
    if (clickCount > 0) {
      console.log(`  Paginated ${clickCount} times to load all connectors`);
    }

    // Extract all connector cards
    const rawConnectors = await page.evaluate(() => {
      const results: Array<{ name: string; description: string; link: string | null }> = [];
      const cards = document.querySelectorAll('a.connector_cms_pill');

      for (const card of cards) {
        // Name is in the H3 element
        const nameEl = card.querySelector('h3');
        const name = nameEl?.textContent?.trim() || '';
        if (!name || name.length < 2) continue;

        // Description is in the <p> inside .connector_card-text
        const descEl = card.querySelector('p');
        const description = descEl?.textContent?.trim() || '';

        const link = card.getAttribute('href') || null;

        if (!results.some(r => r.name === name)) {
          results.push({ name, description, link });
        }
      }

      return results;
    });

    if (rawConnectors.length === 0) {
      console.warn('  Warning: No connectors found on claude.com/connectors. Keeping existing data.');
      return [];
    }

    const seen = new Set<string>();
    const connectors: Connector[] = [];

    for (const raw of rawConnectors) {
      const categoryId = categorizeMcpServer(raw.name, raw.description);
      let id = `a-${slugify(raw.name)}`;
      let counter = 1;
      while (seen.has(id)) {
        id = `a-${slugify(raw.name)}-${++counter}`;
      }
      seen.add(id);

      let sourceUrl: string | undefined;
      if (raw.link) {
        sourceUrl = raw.link.startsWith('http') ? raw.link : `https://claude.com${raw.link}`;
      }

      connectors.push({
        id,
        vendorId: 'anthropic',
        name: raw.name,
        description: raw.description.length > 200
          ? raw.description.slice(0, 197) + '...'
          : (raw.description || `${raw.name} connector for Claude.`),
        categoryId,
        type: 'official',
        status: 'stable',
        ...(sourceUrl ? { sourceUrl } : {}),
      });
    }

    const outPath = path.join(CONNECTORS_DIR, 'anthropic.json');
    writeJsonFile(outPath, connectors);
    console.log(`  Found ${connectors.length} Anthropic connectors`);
    return connectors;
  } catch (err) {
    console.warn(`  Warning: Failed to crawl Anthropic connectors: ${err}`);
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
      const connectors = await crawlAnthropic(browser);
      console.log(`Done. Total Anthropic connectors: ${connectors.length}`);
    } finally {
      await browser.close();
    }
  })().catch(console.error);
}
