import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import roster from '../src/lib/specialists.json';
test('sourced specialists, contact links and application boundary', async ({page})=>{
 await page.goto('/calculators');
 const section=page.getByRole('region',{name:'DSCR specialists'});
 await section.locator('summary').click();
 await expect(section.locator('.specialist-card')).toHaveCount(roster.length);
 for(const person of roster){
  const card=section.locator('.specialist-card').filter({has:page.getByRole('heading',{name:person.name,exact:true})});
  await expect(card.getByRole('link',{name:'Start Griffin application'})).toHaveAttribute('href','https://apply.griffinfunding.com/');
  await expect(card.getByRole('link',{name:'Email',exact:true})).toHaveAttribute('href',`mailto:${person.email}`);
 }
 await expect(section.getByRole('link',{name:/Read Griffin client reviews/})).toHaveAttribute('href','https://griffinfundingreviews.com/');
 await expect(section).toContainText('not transferred automatically');
 expect((await new AxeBuilder({page}).include('.specialists').analyze()).violations).toEqual([]);
});
test('compact resource heroes and mobile specialist cards',async({page})=>{
 for(const route of ['/calculators','/calculators/dscr','/calculators/cash-flow','/how-it-works','/dscr-guide']){
  await page.goto(route);
  expect((await page.locator('.resource-hero').boundingBox())!.height).toBeLessThanOrEqual(265);
 }
 await expect(page.locator('.hero-accent-red')).toHaveCSS('color','rgb(189, 12, 12)');
 await page.screenshot({path:'verification/specialists-desktop.png',fullPage:true});
 await page.setViewportSize({width:320,height:850});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'verification/specialists-mobile.png',fullPage:true});
});
test('property scenario offers specialist selection alongside the estimate',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'View scenario',exact:true}).first().click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Choose a DSCR specialist').selectOption('guy-troxler');
 await expect(dialog.getByRole('heading',{name:'Guy Troxler'})).toBeVisible();
 await expect(dialog.getByRole('link',{name:'Call Guy'})).toHaveAttribute('href','tel:+19803210580');
 await expect(dialog.locator('.scenario-ratio')).toBeVisible();
});

test('specialist launchpad is limited to explorer and calculator landing pages', async ({page}) => {
 for (const route of ['/', '/calculators']) {
  await page.goto(route);
  await expect(page.getByRole('region', {name:'DSCR specialists'})).toBeVisible();
 }
 for (const route of ['/how-it-works', '/dscr-guide', '/calculators/dscr', '/calculators/cash-flow']) {
  await page.goto(route);
  await expect(page.getByRole('region', {name:'DSCR specialists'})).toHaveCount(0);
  await expect(page.locator('.footer-contact-column')).toBeVisible();
 }
});
