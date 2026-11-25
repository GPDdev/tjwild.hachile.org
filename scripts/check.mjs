import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { features, columns, featureRoute, columnRoute, featureSources, validateFeatures, esc } from './features.mjs';
import { articles, sources, grades, publicAssets, checkCatalog } from './catalog.mjs';

validateFeatures();
checkCatalog(features.flatMap(featureSources));
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
const longPages=['lore/',...columns.map(columnRoute),...features.map(featureRoute)].map(route=>route+'index.html');
const expected=[...longPages,'index.html','archive/index.html','wild/index.html','sources/index.html','404.html','CNAME','.nojekyll','robots.txt','sitemap.xml',...publicAssets.map(n=>'assets/'+n),...articles.map(a=>'stories/'+a.slug+'/index.html')];
assert.deepEqual((await inventory(output)).sort(),expected.sort(),'Unexpected files in the Pages artifact');
const files=new Set(expected);
const html=new Map();
for(const name of expected.filter(n=>n.endsWith('.html'))) html.set(name,await readFile(join(output,name),'utf8'));
for (const [name,page] of html) {
  const footer = page.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1] ?? '';
  const footerText = footer.replace(/<[^>]*>/g,'').replace(/\s+/g,' ');
  assert.ok(footerText.includes('同济大学校史、精神与文化交流群 同舟共济会QQ群1101135584'), name+' is missing the QQ group in its footer');
  assert.equal((page.match(/<h1[ >]/g)||[]).length,1,name);
  const anchors = [...page.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(anchors).size,anchors.length,'Repeated anchor in '+name);
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
for(const feature of features) {
  const route = featureRoute(feature);
  const page = html.get(route+'index.html');
  const ids = featureSources(feature);
  assert.ok(html.get(columnRoute(columns.find(c=>c.id===feature.category))+'index.html').includes(route));
  assert.ok(html.get('archive/index.html').includes(route));
  for(const id of ids) assert.ok(page.includes(esc(sources[id].url)), feature.slug+' '+id);
  for(const [si,section] of feature.sections.entries()) {
    for(const [pi,paragraph] of section.paragraphs.entries()) {
      assert.ok(page.includes(esc(paragraph.text)),feature.slug+' '+section.id);
      for(const id of paragraph.sources) {
        const n = ids.indexOf(id)+1;
        const reference = page.match(new RegExp('<li id="ref-'+n+'">([\\s\\S]*?)</li>'))?.[1];
        assert.ok(reference?.includes('href="#p-'+(si+1)+'-'+(pi+1)+'"'),feature.slug+' citation return');
      }
    }
    for(const id of section.events) assert.ok(html.get('stories/'+id+'/index.html').includes(route+'#'+section.id),'Missing event backlink '+id);
  }
}
const saved=articles[0].publication;
try {
  articles[0].publication='hold';
  assert.throws(checkCatalog,/Only reviewed public entries/);
} finally { articles[0].publication=saved; }
assert.equal((await readFile(join(output,'CNAME'),'utf8')).trim(),'tjwild.hachile.org');
console.log('Verified '+html.size+' HTML pages, internal links, fragments, sources and the public file allowlist.');
