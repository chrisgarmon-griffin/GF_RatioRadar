import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
 ...base,
 use: {baseURL:base.use?.baseURL, viewport:base.use?.viewport, trace:"retain-on-failure"},
 grep: /DSCR purchase|DSCR handoff|cash flow negative|property scenario reaches|workflow step controls|ratio lab reacts|property scenario offers/,
 reporter: [['list'], ['json', {outputFile:'verification/precision-interactions.json'}]],
 projects: [
  {name:'WebKit',use:{browserName:'webkit',channel:undefined}},
  {name:'Firefox',use:{browserName:'firefox',channel:undefined}},
 ],
});
