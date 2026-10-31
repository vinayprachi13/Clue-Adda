import assert from 'node:assert/strict';
import {categories,subcategories} from './game.js';
assert.equal(categories.length,7);assert.equal(subcategories.length,35);
for(const c of categories){const subs=subcategories.filter(s=>s.categoryId===c.id);assert.equal(subs.length,5);for(const s of subs){for(const difficulty of ['Easy','Medium','Hard']){const words=s.pools[difficulty];assert(words.length>=35);assert.equal(new Set(words).size,words.length);}}}
console.log('PASS: 7 categories, 35 subcategories, 105 difficulty pools, >=35 unique words per pool');
