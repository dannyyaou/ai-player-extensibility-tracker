/**
 * Crawl ChatGPT apps page for OpenAI integrations/plugins using Playwright.
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { categorizeMcpServer } from './lib/category-map';

interface Connector {
  id: string;
  vendorId: 'openai';
  name: string;
  description: string;
  categoryId: string;
  type: 'official' | 'third-party';
  status: 'stable';
  sourceUrl?: string;
}

const URLS_TO_TRY = [
  { url: 'https://openai.com/chatgpt/plugins/', label: 'OpenAI plugins marketing page' },
  { url: 'https://platform.openai.com/docs/plugins/', label: 'OpenAI platform docs' },
  { url: 'https://chatgpt.com/apps', label: 'ChatGPT apps page' },
];

export async function crawlOpenAI(browser: Browser): Promise<Connector[]> {
  console.log('Crawling OpenAI integrations...');

  const page = await browser.newPage();
  try {
    let rawApps: Array<{ name: string; description: string; link: string | null; category: string }> = [];

    for (const { url, label } of URLS_TO_TRY) {
      console.log(`  Trying ${label} (${url})...`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector(
          '[class*="app"], [class*="card"], [class*="plugin"], [role="listitem"], h2, h3',
          { timeout: 10000 }
        ).catch(() => {});
        await page.waitForTimeout(3000);

        rawApps = await page.evaluate(() => {
          const results: Array<{ name: string; description: string; link: string | null; category: string }> = [];

          // Strategy 1: Look for app/card elements
          const cards = document.querySelectorAll(
            '[class*="app"], [class*="card"], [class*="plugin"], [role="listitem"], [class*="grid"] > a, [class*="grid"] > div'
          );

          for (const card of cards) {
            const heading = card.querySelector('h2, h3, h4, [class*="title"], [class*="name"]');
            const name = heading?.textContent?.trim() || '';
            if (!name || name.length < 2 || name.length > 100) continue;

            const desc = card.querySelector('p, [class*="description"], [class*="desc"], [class*="subtitle"]');
            const description = desc?.textContent?.trim() || '';

            const categoryEl = card.querySelector('[class*="category"], [class*="tag"], [class*="badge"]');
            const category = categoryEl?.textContent?.trim() || '';

            const linkEl = card.tagName === 'A' ? card : card.querySelector('a[href]');
            const link = linkEl?.getAttribute('href') || null;

            if (!results.some(r => r.name === name)) {
              results.push({ name, description, link, category });
            }
          }

          // Strategy 2: Link-based listings
          if (results.length === 0) {
            const links = document.querySelectorAll('a[href*="/g/"], a[href*="/app/"], a[href*="/gpt"], a[href*="/plugin"]');
            for (const link of links) {
              const name = link.textContent?.trim() || '';
              if (!name || name.length < 2 || name.length > 100) continue;
              if (!results.some(r => r.name === name)) {
                results.push({
                  name,
                  description: '',
                  link: link.getAttribute('href'),
                  category: '',
                });
              }
            }
          }

          return results;
        });

        if (rawApps.length > 0) {
          console.log(`  Success: Found ${rawApps.length} entries from ${label}`);
          break;
        }
        console.log(`  No results from ${label}, trying next source...`);
      } catch (err) {
        console.log(`  Failed to load ${label}: ${err}`);
      }
    }

    if (rawApps.length === 0) {
      console.warn('  Warning: All OpenAI sources failed or returned no data. Keeping existing openai.json data.');
      return [];
    }

    const seen = new Set<string>();
    const connectors: Connector[] = [];

    for (const raw of rawApps) {
      const categoryId = categorizeMcpServer(raw.name, raw.description || raw.category);
      let id = `oai-${slugify(raw.name)}`;
      let counter = 1;
      while (seen.has(id)) {
        id = `oai-${slugify(raw.name)}-${++counter}`;
      }
      seen.add(id);

      let sourceUrl: string | undefined;
      if (raw.link) {
        sourceUrl = raw.link.startsWith('http') ? raw.link : `https://chatgpt.com${raw.link}`;
      }

      connectors.push({
        id,
        vendorId: 'openai',
        name: raw.name,
        description: raw.description.length > 200
          ? raw.description.slice(0, 197) + '...'
          : (raw.description || `${raw.name} app for ChatGPT.`),
        categoryId,
        type: 'official',
        status: 'stable',
        ...(sourceUrl ? { sourceUrl } : {}),
      });
    }

    const outPath = path.join(CONNECTORS_DIR, 'openai.json');
    writeJsonFile(outPath, connectors);
    console.log(`  Found ${connectors.length} OpenAI apps`);
    return connectors;
  } catch (err) {
    console.warn(`  Warning: Failed to crawl OpenAI apps: ${err}`);
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
      const connectors = await crawlOpenAI(browser);
      console.log(`Done. Total OpenAI apps: ${connectors.length}`);
    } finally {
      await browser.close();
    }
  })().catch(console.error);
}
