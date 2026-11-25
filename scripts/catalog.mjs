import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const content = new URL('../content/', import.meta.url);
export const articles = JSON.parse(readFileSync(new URL('articles.json', content), 'utf8'));
export const sources = JSON.parse(readFileSync(new URL('sources.json', content), 'utf8'));
export const grades = {
  '正史': '档案、公告或同时期的公开记录可核对主体事实。',
  '较可信': '有采访或多份材料支撑，部分细节仍靠回顾。',
  '当事人回忆': '保留讲述者的经历、时间和观察范围。',
  '有争议': '对同一事实有不同解释，文中并列依据和分歧。'
};

export const photos = {
  'lizhuang-student-radio': { file: 'lizhuang-yuwang.jpg', caption: '四川李庄禹王宫，同济大学西迁时期校本部旧址', year: '2025', author: 'N509FZ', size: [1280,853], page: 'File:Lizhuang_Yuwang_Temple_(20250118093723).jpg', license: '4.0' },
  'wenyuan-entrance': { file: 'wenyuan.webp', caption: '四平路校区，文远楼', year: '2018', author: 'Qiu Chaofan', size: [1360,1120], page: 'File:Wenyuan_Building_Front.jpg', license: '4.0' },
  'sanhaowu-geese': { file: 'geese.webp', caption: '三好坞的鹅', year: '2002', author: 'LGN', size: [800,592], page: 'File:三好坞的鹅_-_panoramio.jpg', license: '3.0' },
  'glass-hall-cinema': { file: 'auditorium.webp', caption: '冬天的四平路校区大礼堂', year: '2008', author: 'LGN', size: [1450,1088], page: 'File:冰霜覆盖的大礼堂_-_panoramio.jpg', license: '3.0' }
};

export const milestones = [
  ['1907','德文医学堂开课','before-the-lecture'],
  ['1912','德文工学堂开课','workshop-six'],
  ['1940','同济迁入四川李庄','lizhuang-lights'],
  ['1946','从李庄回迁上海','lizhuang-lights'],
  ['2004','嘉定校区开始教学','beian-bus']
];

export const publicAssets = ['app.js','site.css','icon.png',...Object.values(photos).map(p => p.file)];

export function checkCatalog(featureSourceIds = []) {
  const ids = new Set();
  const cited = new Set(featureSourceIds);
  const exact = (value, keys) => assert.deepEqual(Object.keys(value).sort(), keys.split(' ').sort());
  const string = value => assert.ok(typeof value === 'string' && value.trim().length > 0);
  for (const [id, source] of Object.entries(sources)) {
    assert.match(id, /^[a-z0-9-]+$/);
    exact(source, 'publisher title language url');
    string(source.title);
    string(source.publisher);
    assert.ok(['zh','de','en'].includes(source.language));
    assert.equal(new URL(source.url).protocol, 'https:');
  }
  for (const article of articles) {
    exact(article, 'slug publication year date kind confidence place title summary sections evidence');
    assert.equal(article.publication, 'public', 'Only reviewed public entries belong in this file');
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(article.slug), 'Duplicate article ' + article.slug);
    ids.add(article.slug);
    assert.ok(['校史','野史'].includes(article.kind) && Object.hasOwn(grades, article.confidence));
    assert.ok(Number.isInteger(article.year));
    [article.date,article.place,article.title,article.summary,article.evidence].forEach(string);
    assert.ok(article.sections.length >= 2);
    for (const section of article.sections) {
      exact(section, 'heading text sources');
      string(section.heading);
      string(section.text);
      assert.ok(section.sources.length > 0);
      for (const id of section.sources) {
        assert.ok(Object.hasOwn(sources, id), 'Unknown source ' + id);
        cited.add(id);
      }
    }
  }
  assert.equal(cited.size, Object.keys(sources).length, 'Source list must contain only cited records');
  for (const slug of [...Object.keys(photos),...milestones.map(row=>row[2])]) assert.ok(ids.has(slug), 'Missing article ' + slug);
}
