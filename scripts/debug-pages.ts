import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // Debug Anthropic page
  console.log('=== Anthropic ===');
  const page1 = await browser.newPage();
  await page1.goto('https://claude.com/connectors#connectors', { waitUntil: 'networkidle', timeout: 60000 });
  await page1.waitForTimeout(3000);
  await page1.screenshot({ path: '/tmp/anthropic-page.png', fullPage: true });
  
  const anthropicHTML = await page1.evaluate(() => {
    const moreElements: string[] = [];
    const allButtons = document.querySelectorAll('button, a, [role="button"]');
    for (const el of allButtons) {
      const text = el.textContent?.trim().toLowerCase() || '';
      if (text.includes('more') || text.includes('all') || text.includes('load') || text.includes('show') || text.includes('next') || text.includes('expand')) {
        moreElements.push(`<${el.tagName} class="${el.className}"> "${el.textContent?.trim().slice(0, 60)}"`);
      }
    }
    // Count cards
    const cards = document.querySelectorAll('[class*="connector"], [class*="card"], [class*="grid"] > div, [class*="integration"]');
    return { moreElements, url: window.location.href, title: document.title, cardCount: cards.length };
  });
  console.log('URL:', anthropicHTML.url);
  console.log('Title:', anthropicHTML.title);
  console.log('Card-like elements:', anthropicHTML.cardCount);
  console.log('"More" elements:', JSON.stringify(anthropicHTML.moreElements, null, 2));
  await page1.close();

  // Debug OpenAI page
  console.log('\n=== OpenAI ===');
  const page2 = await browser.newPage();
  try {
    await page2.goto('https://chatgpt.com/apps', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page2.waitForTimeout(5000);
    await page2.screenshot({ path: '/tmp/openai-page.png', fullPage: true });
    
    const openaiHTML = await page2.evaluate(() => {
      const moreElements: string[] = [];
      const allButtons = document.querySelectorAll('button, a, [role="button"]');
      for (const el of allButtons) {
        const text = el.textContent?.trim().toLowerCase() || '';
        if (text.includes('more') || text.includes('all') || text.includes('load') || text.includes('show') || text.includes('next') || text.includes('expand') || text.includes('see')) {
          moreElements.push(`<${el.tagName} class="${el.className}"> "${el.textContent?.trim().slice(0, 60)}"`);
        }
      }
      const cards = document.querySelectorAll('[class*="app"], [class*="card"], [class*="plugin"], [role="listitem"], a[href*="/g/"]');
      return { moreElements, url: window.location.href, title: document.title, bodyLength: document.body.innerHTML.length, cardCount: cards.length };
    });
    console.log('URL:', openaiHTML.url);
    console.log('Title:', openaiHTML.title);
    console.log('Body length:', openaiHTML.bodyLength);
    console.log('Card-like elements:', openaiHTML.cardCount);
    console.log('"More" elements:', JSON.stringify(openaiHTML.moreElements, null, 2));
  } catch (e: any) {
    console.log('OpenAI error:', e.message);
  }
  await page2.close();

  await browser.close();
}

main().catch(console.error);
