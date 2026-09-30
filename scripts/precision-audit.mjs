import { chromium, webkit, firefox } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const widths=[1920,1600,1440,1280,1100,1024,900,768,430,390,360,320];
const routes=['/','/calculators','/calculators/dscr','/calculators/cash-flow','/how-it-works','/dscr-guide'];
const output=process.env.PRECISION_OUTPUT || '/private/tmp/revestor-precision';
await fs.mkdir(output,{recursive:true});
const report={cases:[],issues:[],accessibility:[],errors:[],limits:['macOS host only; native Windows, Safari and Edge applications not tested','Zoom checks use equivalent CSS viewport reflow and text enlargement, not native browser zoom UI','Automated checks do not establish full WCAG conformance']};
async function inspect(page,context){
 const result=await page.evaluate(()=>{
  const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  const clipped=[...document.querySelectorAll('h1,h2,h3,p,button,select,.result-hero,.specialist-card,.calc-field,.resource-hero-copy,.calc-toolbar,.rr-navigation')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({selector:e.className||e.tagName,text:e.textContent.slice(0,55),extra:e.scrollWidth-e.clientWidth}));
  const shells=[...document.querySelectorAll('.wrap')].filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:r.left+parseFloat(s.paddingLeft),right:r.right-parseFloat(s.paddingRight)}});
  const overlap=[];for(const grid of document.querySelectorAll('.property-grid,.specialist-grid,.workbench-tools,.calculator-layout,.rr-navigation')){const items=[...grid.children].filter(visible);for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i].getBoundingClientRect(),b=items[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlap.push(grid.className);}}
  return {overflow:document.documentElement.scrollWidth>innerWidth,clipped,overlap,shellSpread:shells.length?Math.max(...shells.map(s=>s.left))-Math.min(...shells.map(s=>s.left)):0};
 });
 report.cases.push({...context,...result});if(result.overflow||result.clipped.length||result.overlap.length||result.shellSpread>1)report.issues.push({...context,...result});
}
for(const [engine,type] of Object.entries({chromium,webkit,firefox})){
 const browser=await type.launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
 const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.errors.push({engine,message:e.message}));
 for(const route of routes){
  await page.goto((process.env.TEST_BASE_URL||'http://localhost:3123')+route);await page.evaluate(async()=>{await document.fonts.ready;const images=[...document.images];images.forEach(image=>image.loading='eager');await Promise.allSettled(images.map(image=>image.decode()));});
  if(route.includes('/calculators/'))await page.getByRole('button',{name:'Load example'}).click();
  const slug=route==='/'?'properties':route.slice(1).replaceAll('/','-');
  for(const width of widths){await page.setViewportSize({width,height:1000});await inspect(page,{engine,route,width,mode:'default'});// A fresh page avoids Chrome full-page capture tiling after repeated resizing.
  const capture=await context.newPage();await capture.setViewportSize({width,height:1000});await capture.goto((process.env.TEST_BASE_URL||'http://localhost:3123')+route);
  await capture.evaluate(async()=>{await document.fonts.ready;const images=[...document.images];images.forEach(image=>image.loading='eager');await Promise.allSettled(images.map(image=>image.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  if(route.includes('/calculators/'))await capture.getByRole('button',{name:'Load example'}).click();
  await capture.screenshot({path:`${output}/${engine}-${slug}-${width}.png`,fullPage:true,animations:'disabled'});await capture.close();}
  // Sweep intervening sizes; a layout that only works at named breakpoints fails.
  for(let width=340;width<=1920;width+=37){await page.setViewportSize({width,height:900});await inspect(page,{engine,route,width,mode:'width-sweep'});}
  for(const zoom of [1.1,1.25,1.5,2]){await page.setViewportSize({width:Math.round(1280/zoom),height:Math.round(900/zoom)});await inspect(page,{engine,route,zoom,mode:'zoom-equivalent-reflow'});}
  await page.setViewportSize({width:390,height:900});
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  report.accessibility.push({engine,route,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  await page.locator('.specialist-more summary').click();
  await page.evaluate(()=>{document.querySelectorAll('.specialist-identity h3').forEach(e=>e.textContent='Alexandra Montgomery-Sutherland');document.querySelectorAll('.specialist-bio').forEach(e=>e.textContent='DSCR and rental property financing. Review assumptions for a multi-property scenario with a longer description and supporting documentation.');const n=document.querySelector('.result-hero');if(n)n.textContent='−$999,999,999';});
  for(const width of [360,768,1100]){await page.setViewportSize({width,height:900});await inspect(page,{engine,route,width,mode:'long-content'});}
  await page.setViewportSize({width:640,height:900});
  await page.evaluate(()=>{const els=[...document.querySelectorAll('body *')];const sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>{if(e instanceof HTMLElement)e.style.fontSize=`${sizes[i]*2}px`;});});
  await inspect(page,{engine,route,width:640,mode:'200-percent-text'});
  await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));console.log(engine,route,'checked');
 }
 await browser.close();
}
await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({cases:report.cases.length,issues:report.issues.length,axeFailures:report.accessibility.filter(a=>a.violations.length).length,errors:report.errors.length,output}));

if(report.issues.length || report.errors.length || report.accessibility.some(a=>a.violations.length)) process.exitCode=1;
