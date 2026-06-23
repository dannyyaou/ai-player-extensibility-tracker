/**
 * Crawl Google support page for Gemini extensions/connectors using Playwright.
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { categorizeMcpServer } from './lib/category-map';

interface Connector {
  id: string;
  vendorId: 'google';
  name: string;
  description: string;
  categoryId: string;
  type: 'official';
  status: 'stable';
  sourceUrl?: string;
}

const GOOGLE_URL = 'https://support.google.com/g/answer/16550932?hl=en';

export async function crawlGoogle(browser: Browser): Promise<Connector[]> {
  console.log('Crawling Google Gemini extensions...');

  const page = await browser.newPage();
  try {
    await page.goto(GOOGLE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    // Wait for article content to load
    await page.waitForSelector('article, [class*="article"], .hcfe-content', { timeout: 15000 }).catch(() => {});

    const rawConnectors = await page.evaluate(() => {
      const results: Array<{ name: string; description: string; link: string | null }> = [];

      // Strategy 1: Look for structured lists or tables within the article body
      const articleBody = document.querySelector('article, [class*="article"], .hcfe-content, [role="article"]') || document.body;

      // Look for headings followed by descriptions (common in support articles)
      const headings = articleBody.querySelectorAll('h2, h3, h4');
      for (const heading of headings) {
        const name = heading.textContent?.trim() || '';
        if (!name || name.length < 2 || name.length > 100) continue;
        // Skip non-extension headings
        if (name.toLowerCase().includes('related') || name.toLowerCase().includes('feedback') ||
            name.toLowerCase().includes('was this helpful') || name.toLowerCase().includes('need more help')) continue;

        // Get the next sibling paragraph or list as description
        let description = '';
        let nextEl = heading.nextElementSibling;
        while (nextEl && !['H2', 'H3', 'H4'].includes(nextEl.tagName)) {
          if (nextEl.tagName === 'P' || nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
            description += (description ? ' ' : '') + (nextEl.textContent?.trim() || '');
            if (description.length > 200) break;
          }
          nextEl = nextEl.nextElementSibling;
        }

        const linkEl = heading.querySelector('a[href]') || heading.nextElementSibling?.querySelector('a[href]');
        const link = linkEl?.getAttribute('href') || null;

        if (!results.some(r => r.name === name)) {
          results.push({ name, description, link });
        }
      }

      // Strategy 2: Look for list items with bold/strong names
      if (results.length === 0) {
        const listItems = articleBody.querySelectorAll('li');
        for (const li of listItems) {
          const bold = li.querySelector('b, strong');
          if (!bold) continue;
          const name = bold.textContent?.trim() || '';
          if (!name || name.length < 2) continue;

          // Rest of the li text is description
          const fullText = li.textContent?.trim() || '';
          const description = fullText.replace(name, '').replace(/^[\s:–—-]+/, '').trim();

          if (!results.some(r => r.name === name)) {
            results.push({ name, description, link: null });
          }
        }
      }

      // Strategy 3: Look for tables
      if (results.length === 0) {
        const tables = articleBody.querySelectorAll('table');
        for (const table of tables) {
          const rows = table.querySelectorAll('tbody tr, tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;
            const name = cells[0].textContent?.trim() || '';
            const description = cells[1].textContent?.trim() || '';
            if (name && name.length > 1) {
              const linkEl = cells[0].querySelector('a');
              const link = linkEl?.getAttribute('href') || null;
              results.push({ name, description, link });
            }
          }
        }
      }

      return results;
    });

    if (rawConnectors.length === 0) {
      console.warn('  Warning: No extensions found on Google support page. Keeping existing data.');
      return [];
    }

    const seen = new Set<string>();
    const connectors: Connector[] = [];

    for (const raw of rawConnectors) {
      const categoryId = categorizeMcpServer(raw.name, raw.description);
      let id = `g-${slugify(raw.name)}`;
      let counter = 1;
      while (seen.has(id)) {
        id = `g-${slugify(raw.name)}-${++counter}`;
      }
      seen.add(id);

      let sourceUrl: string | undefined;
      if (raw.link) {
        sourceUrl = raw.link.startsWith('http') ? raw.link : `https://support.google.com${raw.link}`;
      }

      connectors.push({
        id,
        vendorId: 'google',
        name: raw.name,
        description: raw.description.length > 200
          ? raw.description.slice(0, 197) + '...'
          : (raw.description || `${raw.name} extension for Google Gemini.`),
        categoryId,
        type: 'official',
        status: 'stable',
        ...(sourceUrl ? { sourceUrl } : {}),
      });
    }

    const outPath = path.join(CONNECTORS_DIR, 'google.json');
    writeJsonFile(outPath, connectors);
    console.log(`  Found ${connectors.length} Google extensions`);
    return connectors;
  } catch (err) {
    console.warn(`  Warning: Failed to crawl Google extensions: ${err}`);
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
      const connectors = await crawlGoogle(browser);
      console.log(`Done. Total Google extensions: ${connectors.length}`);
    } finally {
      await browser.close();
    }
  })().catch(console.error);
}
