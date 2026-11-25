import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { articles, sources, grades } from './catalog.mjs';

const read = name => JSON.parse(readFileSync(new URL('../content/'+name+'.json', import.meta.url),'utf8'));
export const columns = read('columns');
export const features = read('features');
export const columnOf = new Map(columns.flatMap(c => c.events.map(id => [id,c])));
const notes = new Map(articles.map(a => [a.slug,a]));
const columnIds = new Map(columns.map(c => [c.id,c]));
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const story = (base, id) => base+'stories/'+id+'/';
export const featureRoute = f => 'lore/'+f.category+'/'+f.slug+'/';
export const columnRoute = c => 'lore/'+c.id+'/';
export const featureSources = f => [...new Set(f.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.sources)))];
const words = f => f.sections.reduce((sum,s)=>sum+s.paragraphs.reduce((count,p)=>count+Array.from(p.text.replace(/\s/g,'')).length,0),0);
const metric = f => Math.max(1,Math.ceil(words(f)/400))+' 分钟阅读';
const featureLink = (base,f) => base+featureRoute(f);
const link = (url,label) => '<a href="'+esc(url)+'">'+esc(label)+'</a>';

export function validateFeatures(){
  assert.equal(new Set(columns.map(c=>c.id)).size,columns.length);
  assert.equal(columns.flatMap(c=>c.events).length,articles.length,'Assign each event to exactly one column');
  assert.equal(columnOf.size,articles.length);
  for(const c of columns){
    assert.match(c.id,idPattern);
    assert.ok(c.title && c.description && c.events.length);
    for(const id of c.events) assert.ok(notes.has(id),id);
    assert.ok(features.some(f=>f.category===c.id),'Empty column '+c.id);
  }
  assert.equal(new Set(features.map(f=>f.slug)).size,features.length);
  for(const f of features){
    assert.equal(f.publication,'public');
    assert.ok(Object.hasOwn(grades,f.confidence),f.slug+' is missing an evidence grade');
    assert.ok(columnIds.has(f.category)); assert.match(f.slug,idPattern);
    for (const k of ['title','period','deck','evidence']) assert.ok(typeof f[k]==='string' && f[k].trim(),f.slug+' '+k);
    assert.ok(f.sections.length>1 && featureSources(f).length>1);
    assert.equal(new Set(f.sections.map(s=>s.id)).size,f.sections.length);
    for(const s of f.sections){
      assert.match(s.id,idPattern);
      assert.ok(s.heading && s.paragraphs.length && Array.isArray(s.events) && s.events.length);
      for(const id of s.events) assert.ok(notes.has(id),'Unknown article '+id);
      for(const p of s.paragraphs){
        assert.ok(p.text.trim() && p.sources.length);
        for(const id of p.sources) assert.ok(Object.hasOwn(sources,id),'Unknown source '+id);
      }
    }
  }
}

export function leadCard(base,f, searchable=false) {
  const searchWords = [f.title,f.deck,f.period,columnIds.get(f.category).title,f.confidence,f.evidence,
    ...f.sections.flatMap(s=>[s.heading,...s.paragraphs.map(p=>p.text)])];
  const idx=searchable?' class="essay-card listing-feature" data-grade="'+esc(f.confidence)+'" data-index="'+esc(searchWords.join(' '))+'"':' class="essay-card"';
  return '<article'+idx+'><p class="essay-stats">'+esc(f.period)+' <span>/</span> '+metric(f)+' / '+esc(f.confidence)+'</p><h3>'+link(featureLink(base,f),f.title)+'</h3><p>'+esc(f.deck)+'</p></article>';
}

export function columnStrip(base){
  return '<div class="column-strip" aria-label="专题栏目">'+columns.map(c=>'<a href="'+base+columnRoute(c)+'">'+esc(c.title)+' <span aria-hidden="true">↗</span></a>').join('')+'</div>';
}

export function columnContents(base,c){
  const list=features.filter(f=>f.category===c.id);
  return '<section class="journal-section" id="'+c.id+'"><header><h2>'+link(base+columnRoute(c),c.title)+'</h2><p>'+esc(c.description)+'</p><a class="text-link" href="'+base+columnRoute(c)+'">'+list.length+' 篇长文 / '+c.events.length+' 则条目 →</a></header><div class="essay-list">'+list.map(f=>leadCard(base,f)).join('')+'</div></section>';
}
export function directory(base){
  return '<header class="journal-heading"><h1>专题野史</h1><p>按栏目读长文。文中的注号通往原始资料，各节末尾可以回查相关事件。</p></header>'+columnStrip(base)+columns.map(c=>columnContents(base,c)).join('');
}
export function columnPage(base,c){
  const list=features.filter(f=>f.category===c.id);
  const items=c.events.map(id=>notes.get(id)).sort((a,b)=>a.year-b.year || a.title.localeCompare(b.title,'zh-CN'));
  return '<p class="journal-crumb">'+link(base+'lore/','专题野史')+' / '+esc(c.title)+'</p><header class="journal-heading"><h1>'+esc(c.title)+'</h1><p>'+esc(c.description)+'</p></header><div class="column-essays">'+list.map(f=>leadCard(base,f)).join('')+'</div><section class="column-archive" id="events"><h2>本栏事件条目</h2><ul>'+items.map(a=>'<li><span>'+esc(a.date)+'</span>'+link(story(base,a.slug),a.title)+'<small>'+esc(a.confidence)+'</small></li>').join('')+'</ul></section>';
}
export function backlinks(base,id){
  const related=features.flatMap(f=>f.sections
    .filter(section=>section.events.includes(id))
    .map(section=>link(featureLink(base,f)+'#'+section.id,f.title+' / '+section.heading)));
  const c=columnOf.get(id);
  return '<section class="article-column"><h2>放回主题里读</h2>'+link(base+columnRoute(c),c.title)+'<ul>'+related.map(l=>'<li>'+l+'</li>').join('')+'</ul></section>';
}
const pairings={
  'westward-classroom':'playing-for-tongji','wusong-in-photographs':'engineering-homework','canteen-table':'campus-and-neighbours','campus-message':'stage-belongs-to-students',
  'stage-belongs-to-students':'campus-message','playing-for-tongji':'westward-classroom','engineering-homework':'wusong-in-photographs','campus-and-neighbours':'canteen-table'
};
export function featurePage(base,f){
  const c=columnIds.get(f.category);
  const ids=featureSources(f);
  const citedAt=new Map(ids.map(id=>[id,[]]));
  const toc=f.sections.map(s=>link('#'+s.id,s.heading)).join('')+link('#evidence','材料怎样互证')+link('#sources','原始出处');
  const sections=f.sections.map((s,si)=>{
    const paras=s.paragraphs.map((p,pi)=>{
      const anchor='p-'+(si+1)+'-'+(pi+1);
      const signs=p.sources.map(id=>{
        const n=ids.indexOf(id)+1;
        citedAt.get(id).push(link('#'+anchor,'第'+(si+1)+'节第'+(pi+1)+'段'));
        return '<a href="#ref-'+n+'" aria-label="来源 '+n+'">['+n+']</a>';
      }).join(' ');
      return '<p id="'+anchor+'">'+esc(p.text)+' <sup>'+signs+'</sup></p>';
    }).join('');
    const events=s.events.map(id=>{const a=notes.get(id);return '<li>'+link(story(base,id),a.title)+' <small>'+esc(a.confidence)+'</small></li>';}).join('');
    return '<section class="prose-section deep-section" id="'+s.id+'"><h2>'+esc(s.heading)+'</h2>'+paras+'<details class="event-links"><summary>查阅本节事件（'+s.events.length+'）</summary><ul>'+events+'</ul></details></section>';
  }).join('');
  const refs=ids.map((id,i)=>{const s=sources[id];return '<li id="ref-'+(i+1)+'">'+link(s.url,s.title)+'<small>'+esc(s.publisher)+' / '+({zh:'中文',de:'德文',en:'英文'})[s.language]+'　'+'返回引文 '+citedAt.get(id).join('、')+'</small></li>';}).join('');
  const related=features.filter(x=>x!==f && (x.category===c.id || x.slug===pairings[f.slug]));
  return '<p class="journal-crumb">'+link(base+'lore/','专题野史')+' / '+link(base+columnRoute(c),c.title)+'</p>'
    +'<header class="reading-head"><p class="essay-stats">'+esc(f.period)+' / '+metric(f)+' / '+ids.length+' 份出处 / '+esc(f.confidence)+'</p><h1>'+esc(f.title)+'</h1><p class="standfirst">'+esc(f.deck)+'</p></header>'
    +'<details class="compact-toc"><summary>本文目录</summary><div>'+toc+'</div></details>'
    +'<div class="reading-grid"><article>'+sections
    +'<section class="evidence" id="evidence"><h2>材料怎样互证</h2><p>'+esc(f.evidence)+'</p></section>'
    +'<section class="refs" id="sources"><h2>原始出处</h2><ol>'+refs+'</ol></section></article><aside><div class="toc"><strong>本文目录</strong>'+toc+'</div></aside></div>'
    +'<section class="read-next"><h2>接着读</h2><div class="column-essays">'+related.map(next=>leadCard(base,next)).join('')+'</div></section>';
}
