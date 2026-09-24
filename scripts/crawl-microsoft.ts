/**
 * Crawl Microsoft Learn Graph Connectors gallery pages and Power Platform connectors.
 * Merges both sources into a unified Microsoft connector list.
 */
import type { Browser } from 'playwright';
import * as path from 'path';
import { slugify, writeJsonFile, CONNECTORS_DIR } from './lib/utils';
import { mapMsCategory, categorizePowerPlatformConnector } from './lib/category-map';

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
  sourcePlatform?: 'graph-connectors' | 'power-platform' | 'both';
  tier?: 'standard' | 'premium';
}

interface PowerPlatformRaw {
  name: string;
  docsUrl: string;
  isPremium: boolean;
  isPreview: boolean;
  isDeprecated: boolean;
  isMcpServer: boolean;
}

const MS_BUILT_URL = 'https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connectors-gallery-microsoft';
const PARTNER_BUILT_URL = 'https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connectors-gallery-partners';
const POWER_PLATFORM_URL = 'https://learn.microsoft.com/en-us/connectors/connector-reference/connector-reference-microsoft-connectors';

// --- Graph Connectors crawl (unchanged) ---

async function parseGalleryPage(browser: Browser, url: string, type: 'official' | 'third-party'): Promise<Connector[]> {
  console.log(`  Fetching ${url}...`);
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
        sourcePlatform: 'graph-connectors' as const,
        ...(docsUrl ? { docsUrl } : {}),
        ...(c.publisher && connectorType === 'third-party' ? { publisher: c.publisher } : {}),
      };
    });
  } finally {
    await page.close();
  }
}

// --- Power Platform crawl ---

async function crawlPowerPlatform(browser: Browser): Promise<PowerPlatformRaw[]> {
  console.log(`  Fetching Power Platform connectors...`);
  const page = await browser.newPage();
  try {
    await page.goto(POWER_PLATFORM_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});

    const connectors = await page.evaluate(() => {
      const results: Array<{
        name: string;
        docsUrl: string;
        isPremium: boolean;
        isPreview: boolean;
        isDeprecated: boolean;
        isMcpServer: boolean;
      }> = [];

      const rows = document.querySelectorAll('table tbody tr, table tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) continue;

        const nameCell = cells[0];
        const linkEl = nameCell.querySelector('a');
        if (!linkEl) continue;

        let name = linkEl.textContent?.trim() || '';
        if (!name || name === 'Name') continue;

        const isDeprecated = name.includes('[DEPRECATED]') || name.includes('[Deprecated]');
        name = name.replace(/\s*\[DEPRECATED\]/gi, '').trim();

        const href = linkEl.getAttribute('href') || '';
        let docsUrl = href;
        if (href.startsWith('/')) {
          docsUrl = `https://learn.microsoft.com${href}`;
        }

        // Check icon images for tier/status indicators
        const allImages = row.querySelectorAll('img');
        let isPremium = false;
        let isPreview = false;
        let isMcpServer = false;

        for (const img of allImages) {
          const alt = (img.getAttribute('alt') || '').toLowerCase();
          const src = (img.getAttribute('src') || '').toLowerCase();
          if (alt.includes('premium') || src.includes('premium')) isPremium = true;
          if (alt.includes('preview') || src.includes('preview')) isPreview = true;
          if (alt.includes('mcp') || src.includes('mcpserver')) isMcpServer = true;
        }

        results.push({ name, docsUrl, isPremium, isPreview, isDeprecated, isMcpServer });
      }
      return results;
    });

    return connectors;
  } finally {
    await page.close();
  }
}

// --- Grouping: collapse regional variants and version suffixes ---

function normalizeConnectorName(name: string): string {
  return name
    // Remove parenthetical qualifiers: (Canada), (UAE), (US Gov.), (on-premises), etc.
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Remove version suffixes: V2, V3
    .replace(/\s+V\d+$/i, '')
    // Trim
    .trim()
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

interface GroupedConnector {
  representative: PowerPlatformRaw;
  normalizedName: string;
  variantCount: number;
}

function groupByDataSource(connectors: PowerPlatformRaw[]): GroupedConnector[] {
  const groups = new Map<string, PowerPlatformRaw[]>();

  for (const c of connectors) {
    const normalized = normalizeConnectorName(c.name);
    const key = normalized.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(c);
  }

  // For groups with many variants sharing a prefix, merge further
  const result: GroupedConnector[] = [];
  const prefixGroups = new Map<string, { key: string; connectors: PowerPlatformRaw[] }[]>();

  for (const [key, variants] of groups) {
    const firstWord = key.split(' ')[0];
    if (!prefixGroups.has(firstWord)) {
      prefixGroups.set(firstWord, []);
    }
    prefixGroups.get(firstWord)!.push({ key, connectors: variants });
  }

  for (const [prefix, subGroups] of prefixGroups) {
    // If more than 3 variants share the same first-word prefix, merge them
    const totalVariants = subGroups.reduce((sum, g) => sum + g.connectors.length, 0);
    if (subGroups.length > 3 && prefix.length > 3) {
      // Merge all under the prefix name
      const allConnectors = subGroups.flatMap(g => g.connectors);
      // Pick the non-deprecated, shortest-name entry as representative
      const representative = allConnectors
        .filter(c => !c.isDeprecated)
        .sort((a, b) => a.name.length - b.name.length)[0] || allConnectors[0];

      result.push({
        representative,
        normalizedName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
        variantCount: totalVariants,
      });
    } else {
      // Keep individual groups
      for (const { connectors: variants } of subGroups) {
        const representative = variants
          .filter(c => !c.isDeprecated)
          .sort((a, b) => a.name.length - b.name.length)[0] || variants[0];

        result.push({
          representative,
          normalizedName: normalizeConnectorName(representative.name),
          variantCount: variants.length,
        });
      }
    }
  }

  return result;
}

// --- Merge Graph Connectors + Power Platform ---

function mergeGraphAndPowerPlatform(
  graphConnectors: Connector[],
  ppGrouped: GroupedConnector[]
): Connector[] {
  // Build a lookup of Graph connectors by normalized slug
  const graphBySlug = new Map<string, Connector>();
  for (const gc of graphConnectors) {
    graphBySlug.set(slugify(gc.name), gc);
  }

  const merged: Connector[] = [];
  const matchedGraphSlugs = new Set<string>();

  for (const pp of ppGrouped) {
    const ppSlug = slugify(pp.normalizedName);
    const matchingGraph = graphBySlug.get(ppSlug);

    if (matchingGraph) {
      // Exists in both — use Graph description, mark as 'both'
      matchedGraphSlugs.add(ppSlug);
      merged.push({
        ...matchingGraph,
        sourcePlatform: 'both',
        tier: pp.representative.isPremium ? 'premium' : 'standard',
      });
    } else {
      // Power Platform only
      const status = pp.representative.isDeprecated
        ? 'deprecated' as const
        : pp.representative.isPreview
          ? 'preview' as const
          : 'stable' as const;

      merged.push({
        id: `ms-pp-${slugify(pp.normalizedName)}`,
        vendorId: 'microsoft',
        name: pp.normalizedName,
        description: `${pp.normalizedName} connector for Microsoft Power Platform.`,
        categoryId: categorizePowerPlatformConnector(pp.normalizedName),
        type: 'official',
        status,
        sourcePlatform: 'power-platform',
        tier: pp.representative.isPremium ? 'premium' : 'standard',
        docsUrl: pp.representative.docsUrl,
      });
    }
  }

  // Add remaining Graph-only connectors
  for (const gc of graphConnectors) {
    const gcSlug = slugify(gc.name);
    if (!matchedGraphSlugs.has(gcSlug)) {
      merged.push({
        ...gc,
        sourcePlatform: 'graph-connectors',
      });
    }
  }

  return merged;
}

// --- Main export ---

export async function crawlMicrosoft(browser: Browser): Promise<Connector[]> {
  console.log('Crawling Microsoft connectors...');

  // 1. Crawl Graph Connectors (existing)
  let microsoftBuilt: Connector[] = [];
  let partnerBuilt: Connector[] = [];

  try {
    microsoftBuilt = await parseGalleryPage(browser, MS_BUILT_URL, 'official');
    console.log(`  Found ${microsoftBuilt.length} Microsoft-built Graph connectors`);
  } catch (err) {
    console.warn(`  Warning: Could not fetch Microsoft-built page: ${err}`);
  }

  try {
    partnerBuilt = await parseGalleryPage(browser, PARTNER_BUILT_URL, 'third-party');
    console.log(`  Found ${partnerBuilt.length} partner-built Graph connectors`);
  } catch (err) {
    console.warn(`  Warning: Could not fetch partner-built page: ${err}`);
  }

  const graphConnectors = [...microsoftBuilt, ...partnerBuilt];

  // 2. Crawl Power Platform connectors
  let ppRaw: PowerPlatformRaw[] = [];
  try {
    ppRaw = await crawlPowerPlatform(browser);
    console.log(`  Found ${ppRaw.length} raw Power Platform connectors`);
  } catch (err) {
    console.warn(`  Warning: Could not fetch Power Platform page: ${err}`);
  }

  // 3. Group Power Platform by data source
  const ppGrouped = groupByDataSource(ppRaw);
  console.log(`  Grouped into ${ppGrouped.length} Power Platform data sources`);

  // 4. Merge Graph + Power Platform
  const allConnectors = mergeGraphAndPowerPlatform(graphConnectors, ppGrouped);
  console.log(`  Merged total: ${allConnectors.length} connectors`);

  // 5. Deduplicate by ID
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
