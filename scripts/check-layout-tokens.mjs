import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const tokens = readFileSync(new URL('../src/app/tokens.css', import.meta.url), 'utf8');
const literals = [...css.matchAll(/\b((?:margin|padding|scroll-margin|scroll-padding)(?:-[a-z]+)*|(?:row-|column-)?gap)\s*:\s*([^;{}]+);/g)]
  .filter(match => /-?\d+(?:\.\d+)?px\b/.test(match[2]));
const defined = new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
const missing = [...css.matchAll(/var\((--(?:space-[\w-]+|page-gutter|page-start|section-gap|card-gap|card-padding|card-radius|control-height))\)/g)]
  .map(match => match[1]).filter(name => !defined.has(name));
if (literals.length || missing.length) {
  throw new Error(JSON.stringify({ untrackedSpacing: literals.map(match => match[0]), undefinedTokens: [...new Set(missing)] }, null, 2));
}
console.log('Layout spacing uses defined shared tokens. Artwork offsets and type metrics remain separate.');
