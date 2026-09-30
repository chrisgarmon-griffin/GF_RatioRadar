import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('workflow step controls reveal the corresponding action and context',async({page})=>{
 await page.goto('/how-it-works');
 await expect(page.getByRole('heading',{name:'Start with a property.'})).toBeVisible();
 await page.getByRole('button',{name:/02 Model/}).click();
 await expect(page.getByRole('heading',{name:'Make the assumptions yours.'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Open DSCR calculator'})).toHaveAttribute('href','/calculators/dscr');
 await page.getByRole('button',{name:/03 Evaluate/}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Look beyond the payment.'})).toBeVisible();
 await page.getByRole('button',{name:/04 Review/}).click();await expect(page.locator('#workflow-detail')).toContainText('Calculators do not issue approvals or denials');
});
test('ratio lab reacts to keyboard input and resets; guide topics expand',async({page})=>{
 await page.goto('/dscr-guide');await expect(page.getByLabel('Illustrative DSCR')).toHaveText('1.20×');
 await page.locator('#lab-rent').focus();await page.keyboard.press('ArrowRight');await expect(page.getByLabel('Illustrative DSCR')).toHaveText('1.22×');
 await page.locator('#lab-rent').fill('1500');await expect(page.getByLabel('Illustrative DSCR')).toHaveText('0.60×');await expect(page.locator('.ratio-lab-result')).toContainText('falls short');
 await page.getByRole('button',{name:'Reset example'}).click();await expect(page.getByLabel('Illustrative DSCR')).toHaveText('1.20×');
 await page.getByText('Short-term rentals',{exact:true}).click();await expect(page.locator('.resource-topic[open]')).toContainText('not an investor guideline');
});
for(const width of [390,1440])test(`resource pages render accessibly at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['calculators','how-it-works','dscr-guide']){await page.goto('/'+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);await page.screenshot({path:`verification/resource-${route}-${width}.png`,fullPage:true})}
 expect(errors).toEqual([]);
});
test('smallest layout and reduced motion remain usable without a video',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:900});
 for(const route of ['calculators','calculators/dscr','calculators/cash-flow','how-it-works','dscr-guide']){await page.goto('/'+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.radar-sweep')).toHaveCSS('animation-name','none');await expect(page.locator('video')).toHaveCount(0)}
});
