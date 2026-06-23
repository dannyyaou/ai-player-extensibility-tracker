import * as fs from 'fs';
import * as path from 'path';

export const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'data');
export const CONNECTORS_DIR = path.join(DATA_DIR, 'connectors');

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function writeJsonFile(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`  Wrote ${filePath} (${Array.isArray(data) ? data.length + ' items' : 'object'})`);
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
