import { cp, lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles, sources, grades, photos, milestones, selections, publicAssets, checkCatalog } from './catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.resolve(root, '_site');
const origin = 'https://tjwild.hachile.org/';
const lookup = new Map(articles.map(entry => [entry.slug, entry]));
const wild = articles.filter(entry => entry.kind === '野史');
const byDate = (a,b) => b.year - a.year || a.title.localeCompare(b.title, 'zh-CN');
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const story = (base,slug) => base+'stories/'+slug+'/';
const gradeClass = {'正史':'record','较可信':'supported','当事人回忆':'memory','有争议':'disputed'};
const badge = value => '<span class="grade '+gradeClass[value]+'">'+esc(value)+'</span>';
const marked = active => active ? ' aria-current="page"' : '';
const photoUrl = image => 'https://commons.wikimedia.org/wiki/'+encodeURI(image.page);

function img(base, image, eager = false) {
  return '<img src="'+base+'assets/'+image.file+'" width="'+image.size[0]+'" height="'+image.size[1]+'" alt="'+esc(image.caption)+'" '+(eager?'fetchpriority="high"':'loading="lazy"')+'>';
}
function credit(image) {
  return '<span class="credit" title="照片已缩放并转为 WebP，封面按窗口裁切">摄影 <a href="'+esc(photoUrl(image))+'">'+esc(image.author)+'</a> / <a href="https://creativecommons.org/licenses/by-sa/'+image.license+'/">CC BY-SA '+image.license+'</a></span>';
}

function shell({base,route,title,description,main,active=''}) {
  const nav = [['','首页','home'],['archive/','条目库','archive'],['wild/','野史','wild'],['sources/','史料与编例','sources']].map(([link,label,key])=>'<a href="'+base+link+'"'+marked(key===active)+'>'+label+'</a>').join('');
  const pageTitle = title === '同济野史' ? title : title+' | 同济野史';
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title><meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(pageTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${route}"><meta property="og:type" content="${route.startsWith('stories/')?'article':'website'}">
<link rel="canonical" href="${origin}${route}"><link rel="icon" type="image/png" href="${base}assets/icon.png">
<script>try{const t=localStorage.getItem('tjwild-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch{}</script>
<link rel="stylesheet" href="${base}assets/site.css"><script src="${base}assets/app.js" defer></script></head>
<body><a class="skip" href="#main">跳到正文</a>
<header class="mast"><div class="wrap top"><a class="brand" href="${base}"><span class="seal" aria-hidden="true">野</span><span>同济野史<small>TONGJI WILD</small></span></a>
<nav aria-label="主导航">${nav}</nav><div class="actions"><a class="search-link" data-search-link href="${base}archive/#query" aria-label="搜索条目" title="搜索条目 (Ctrl / ⌘ K)"><i class="glass" aria-hidden="true"></i><span>搜索</span></a><button data-theme-toggle class="theme" type="button" aria-label="暗色模式" aria-pressed="false" title="切换亮暗模式"><span aria-hidden="true">◐</span></button></div></div></header>
<main id="main" class="wrap" tabindex="-1">${main}</main>
<footer class="wrap foot"><div><strong>同济野史</strong><span class="foot-tag">同济大学民间资料站</span></div><div><a href="${base}sources/">资料与勘误</a><a href="https://ghc.hachile.org/">国豪野史 ↗</a><a href="https://github.com/GPDdev/tjwild.hachile.org">GitHub ↗</a></div></footer></body></html>`;
}

function home() {
  const feature = lookup.get('wenyuan-entrance');
  const image = photos[feature.slug];
  const shelf = selections.map(slug => {
    const a = lookup.get(slug);
    return `<article class="pick"><div class="meta">${esc(a.date)} <span>/</span> ${badge(a.confidence)}</div><h3><a href="${story('./',slug)}">${esc(a.title)}</a></h3><p>${esc(a.summary)}</p><span class="pick-arrow" aria-hidden="true">↗</span></article>`;
  }).join('');
  const timeline = milestones.map(([year,label,id])=>`<li><time>${year}</time><a href="${story('./',id)}">${label}</a></li>`).join('');
  const counts = [articles.length+' 篇条目',wild.length+' 篇野史',Object.keys(sources).length+' 份来源'];
  return shell({base:'./',route:'',title:'同济野史',description:'同济大学民间资料站。循着档案、校友回忆和中外馆藏，查阅同济校史与校园轶事。',active:'home',
    main:`<section class="hero"><div class="hero-copy"><p class="overline"><i></i> TONGJI CAMPUS HISTORIES</p><h1>同济<span>野史</span></h1><p class="intro">同济大学民间资料站</p><p class="dek">从白克路的二十张病床，到四平路的一张晨跑卡。跟着留下记录的人，重走同济的校园。</p><div class="hero-links"><a class="button" href="wild/">读校园野史 <b aria-hidden="true">↗</b></a><a class="text-link" href="archive/">浏览条目库 <span aria-hidden="true">→</span></a></div><p class="counts">${counts.map(c=>'<span>'+c+'</span>').join('')}</p></div>
<figure class="cover"><a class="cover-link" href="${story('./',feature.slug)}">${img('./',image,true)}<div class="cover-story"><small>本期封面 / 校园建筑</small><strong>${esc(feature.title)}</strong></div></a><figcaption><span>文远楼，${image.year}</span>${credit(image)}</figcaption></figure></section>
<section class="shelf"><div class="section-head"><div><p class="overline">CAMPUS STORIES</p><h2>野史选读</h2></div><a class="text-link" href="wild/">全部野史 <span aria-hidden="true">→</span></a></div><div class="picks">${shelf}</div></section>
<section class="years" id="timeline"><div class="section-head"><div><p class="overline">CHRONOLOGY</p><h2>校史大事记</h2></div></div><ol>${timeline}</ol></section>`});
}

function archive(onlyWild) {
  const base='../', route=onlyWild?'wild/':'archive/';
  const items = [...(onlyWild?wild:articles)].sort(byDate);
  const cards = items.map(a=>{
    const words=[a.title,a.place,a.kind,a.confidence,a.date,a.summary,a.evidence,...a.sections.flatMap(s=>[s.heading,s.text,...s.sources.map(id=>sources[id].publisher)])].join(' ');
    return `<article class="listing" data-grade="${a.confidence}" data-index="${esc(words)}"><div class="list-date">${esc(a.date)}<small>${esc(a.place)}</small></div><div class="list-body"><div class="meta">${a.kind} <span>/</span> ${badge(a.confidence)}</div><h2><a href="${story(base,a.slug)}">${esc(a.title)}</a></h2><p>${esc(a.summary)}</p></div><span class="list-arrow" aria-hidden="true">↗</span></article>`;
  }).join('');
  const opts=Object.keys(grades).map(g=>'<option>'+g+'</option>').join('');
  return shell({base,route,title:onlyWild?'校园野史':'条目库',description:onlyWild?'同济校园轶事与校友讲述。':'按关键词和置信度检索同济校史与轶事。',active:onlyWild?'wild':'archive',
    main:`<section class="index-head"><p class="overline">${onlyWild?'CAMPUS STORIES':'ARCHIVE INDEX'}</p><h1>${onlyWild?'校园野史':'条目库'}</h1><p>${onlyWild?'跟着校友、师生和在场记者，读校园里的另一种记忆。':'按年份倒序翻阅，也可检索地名、人名、年份与正文。'}</p></section>
<form id="filters" class="filters" role="search"><label>检索条目<input id="query" name="q" type="search" placeholder="例如：大排、德累斯顿、1997" autocomplete="off"></label><label>置信度<select name="grade"><option value="">全部置信度</option>${opts}</select></label><button id="clear-filters" type="button" hidden>清除筛选</button></form><noscript><p>全部文章已列出，可用浏览器的页内查找检索标题。</p><style>.filters{display:none}</style></noscript>
<div class="result-bar"><p id="result-count" aria-live="polite">共 ${items.length} 篇</p><span>按年代倒序</span></div><section class="list" aria-label="条目列表">${cards}</section><p id="empty" hidden>没有符合条件的条目。可缩短关键词，或清除筛选。</p>`});
}

function articlePage(a) {
  const base='../../', route='stories/'+a.slug+'/';
  const ids=[...new Set(a.sections.flatMap(s=>s.sources))];
  const image=photos[a.slug];
  const sourceRefs=ids.map((id,i)=>{const s=sources[id];return `<li id="ref-${i+1}"><a href="${esc(s.url)}">${esc(s.title)} ↗</a><small>${esc(s.publisher)} / ${{en:'英文',de:'德文',zh:'中文'}[s.language]}</small></li>`;}).join('');
  const sections=a.sections.map((s,i)=>{
    const notes=s.sources.map(id=>{const n=ids.indexOf(id)+1;return '<a aria-label="来源 '+n+'" href="#ref-'+n+'">['+n+']</a>';}).join(' ');
    return `<section class="prose-section" id="part-${i+1}"><h2>${esc(s.heading)}</h2><p>${esc(s.text)} <sup>${notes}</sup></p></section>`;
  }).join('');
  const toc=a.sections.map((s,i)=>'<a href="#part-'+(i+1)+'">'+esc(s.heading)+'</a>').join('');
  return shell({base,route,title:a.title,description:a.summary,main:`<div class="article-grid"><article><p class="crumb"><a href="../../">首页</a> / <a href="${base}${a.kind==='野史'?'wild/':'archive/'}">${a.kind==='野史'?'野史':'条目库'}</a></p><div class="meta">${esc(a.date)} <span>/</span> ${esc(a.place)} <span>/</span> ${badge(a.confidence)}</div><h1 class="story-title">${esc(a.title)}</h1><p class="standfirst">${esc(a.summary)}</p>${image?`<figure class="inline-photo">${img(base,image)}<figcaption><span>${esc(image.caption)}，${image.year}</span>${credit(image)}</figcaption></figure>`:''}${sections}<section class="evidence" id="evidence"><h2>这条记载有多可靠？</h2><p>${badge(a.confidence)} ${esc(a.evidence)}</p></section><section class="refs" id="sources"><h2>史料出处</h2><ol>${sourceRefs}</ol></section><a class="text-link" href="../../wild/">继续读校园野史 →</a></article><aside><div class="toc"><p class="overline">本文目录</p>${toc}<a href="#evidence">置信度说明</a><a href="#sources">史料出处</a></div></aside></div>`});
}

function sourcePage() {
  const gradeList=Object.entries(grades).map(([k,v])=>'<li>'+badge(k)+'<span>'+v+'</span></li>').join('');
  const lists=Object.entries(sources).map(([id,s])=>{const cited=articles.filter(a=>a.sections.some(p=>p.sources.includes(id))).map(a=>'<a href="'+story('../',a.slug)+'">'+esc(a.title)+'</a>').join(' / ');return `<li><a class="source-title" href="${esc(s.url)}">${esc(s.title)} ↗</a><small>${esc(s.publisher)} / ${{zh:'中文',de:'德文',en:'英文'}[s.language]}</small><div class="source-use">见 ${cited}</div></li>`;}).join('');
  return shell({base:'../',route:'sources/',active:'sources',title:'史料与编例',description:'查阅同济野史的来源、证据标注和勘误渠道。',main:`<section class="index-head"><p class="overline">SOURCES &amp; EDITORIAL NOTES</p><h1>史料与编例</h1><p>同济大学民间资料站，独立编写。每篇文章都可从段末的编号回到原始出处。</p></section><div class="policy"><section><h2>如何读置信度</h2><ul class="grades">${gradeList}</ul></section><section><h2>补充与勘误</h2><p>有亲历记录、原件出处，或发现年份和地点有误，请写信说明条目名称、需要修改的段落及可核对的依据。</p><p><a class="text-link" href="mailto:anontjer@outlook.com">anontjer@outlook.com ↗</a></p><p>涉及个人隐私、未经核实的指认或转载授权存疑的材料，留待核实。公开条目采用原创叙述，照片分别注明作者与授权。</p></section></div><section class="source-directory"><div class="section-head"><h2>来源索引</h2><span>${Object.keys(sources).length} 份</span></div><ol>${lists}</ol></section>`});
}

export async function build() {
  checkCatalog();
  // This fixed directory contains generated public files only.
  const previous=await lstat(out).catch(error=>{if(error.code!=='ENOENT')throw error;});
  if (previous) {
    if (previous.isSymbolicLink() || !previous.isDirectory() || path.dirname(out)!==path.resolve(root)) throw new Error('Unsafe output directory');
    await rm(out,{recursive:true,force:true});
  }
  await mkdir(path.join(out,'assets'),{recursive:true});
  for (const file of publicAssets) await cp(path.join(root,'assets',file),path.join(out,'assets',file));
  const pages=new Map([['',home()],['archive/',archive(false)],['wild/',archive(true)],['sources/',sourcePage()]]);
  for (const a of articles) pages.set('stories/'+a.slug+'/',articlePage(a));
  for (const [route,html] of pages) {
    const dir=path.join(out,route);
    await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,'index.html'),html+'\n');
  }
  const urls=[...pages.keys()].map(p=>'<url><loc>'+origin+p+'</loc></url>').join('\n');
  await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n');
  await writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'sitemap.xml\n');
  await writeFile(path.join(out,'CNAME'),'tjwild.hachile.org\n');
  await writeFile(path.join(out,'.nojekyll'),'');
  await writeFile(path.join(out,'404.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>没有找到这篇条目 | 同济野史</title><main><h1>没有找到这篇条目</h1><p><a href="'+origin+'archive/">回同济野史条目库</a></p></main></html>\n');
  console.log('Built '+articles.length+' articles and '+Object.keys(sources).length+' cited sources.');
}
await build();
