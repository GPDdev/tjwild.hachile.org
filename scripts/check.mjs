import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles, sources, grades, publicAssets, checkCatalog } from './catalog.mjs';

checkCatalog();
const output=fileURLToPath(new URL('../_site/',import.meta.url));
async function inventory(dir) {
  const files=[];
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const location=join(dir,entry.name);
    if(entry.isDirectory()) files.push(...await inventory(location));
    else { assert.ok(entry.isFile()); files.push(relative(output,location).replaceAll('\\','/')); }
  }
  return files;
}
const expected=['index.html','archive/index.html','wild/index.html','sources/index.html','404.html','CNAME','.nojekyll','robots.txt','sitemap.xml',...publicAssets.map(n=>'assets/'+n),...articles.map(a=>'stories/'+a.slug+'/index.html')];
assert.deepEqual((await inventory(output)).sort(),expected.sort(),'Unexpected files in the Pages artifact');
const files=new Set(expected);
const html=new Map();
for(const name of expected.filter(n=>n.endsWith('.html'))) html.set(name,await readFile(join(output,name),'utf8'));
for (const [name,page] of html) {
  assert.equal((page.match(/<h1[ >]/g)||[]).length,1,name);
  for (const link of page.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target=link[1].replaceAll('&amp;','&');
    if (/^(https:|mailto:)/.test(target)) continue;
    const url=new URL(target,'https://archive.test/'+name);
    const p=url.pathname.slice(1)+(url.pathname.endsWith('/')?'index.html':'');
    assert.ok(files.has(p),name+' -> '+p);
    if(url.hash) assert.ok(html.get(p)?.includes('id="'+url.hash.slice(1)+'"'),name+' -> '+p+url.hash);
  }
}
for(const a of articles) {
  const detail=html.get('stories/'+a.slug+'/index.html');
  assert.ok(detail.includes(a.confidence) && Object.hasOwn(grades,a.confidence));
  const refs=new Set(a.sections.flatMap(s=>s.sources));
  for(const id of refs) assert.ok(detail.includes(sources[id].url.replaceAll('&','&amp;')), id);
  assert.equal(html.get('wild/index.html').includes('href="../stories/'+a.slug+'/"'),a.kind==='野史');
}
const saved=articles[0].publication;
try {
  articles[0].publication='hold';
  assert.throws(checkCatalog,/Only reviewed public entries/);
} finally { articles[0].publication=saved; }
assert.equal((await readFile(join(output,'CNAME'),'utf8')).trim(),'tjwild.hachile.org');
console.log('Verified '+html.size+' HTML pages, internal links, fragments, sources and the public file allowlist.');
