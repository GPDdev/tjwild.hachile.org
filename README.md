# 同济野史

<div align="center"><img alt="Pages 构建检查" src="https://github.com/GPDdev/tjwild.hachile.org/actions/workflows/pages.yml/badge.svg"> <img alt="Code MIT" src="https://img.shields.io/badge/code-MIT-green"> <img alt="Version 1.0.0" src="https://img.shields.io/badge/version-1.0.0-blue"> <img alt="简体中文" src="https://img.shields.io/badge/language-简体中文-b4533e"></div>

同济大学民间资料站。目前收录 119 篇文章，其中 113 篇校园野史，共引用 128 份公开资料。读者可按年代和置信度查找条目，顺着段末编号核对中、英、德文来源。[访问同济野史](https://tjwild.hachile.org/)

[本地运行](#本地运行) / [公开资料](#公开资料) / [补充与勘误](#补充与勘误) / [发布](#发布) / [授权](#授权)

## 本地运行

使用 Node.js 22 或更新版本，无需安装第三方依赖。预览命令使用 Python 3。

```sh
npm test
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

打开 `http://127.0.0.1:8000/`。条目、目录及来源索引均生成独立 HTML；启用 JavaScript 后可作全文筛选、切换亮暗色，或按 Ctrl/⌘ K 搜索。

## 公开资料

| 路径 | 内容 |
| --- | --- |
| `content/articles.json` | 已核准公开的条目、正文、分段来源及置信度说明 |
| `content/sources.json` | 来源名称、发布者、原文语言和链接 |
| `scripts/catalog.mjs` | 资料格式验证、重大事件与选读、图片署名 |
| `scripts/build.mjs` | 生成首页、全部条目、野史目录、来源页和各文章页 |
| `scripts/check.mjs` | 检查发布文件清单、链接、锚点、引文和可见范围 |
| `assets/` | 本地样式、交互、图标和已授权的三张照片 |

正文有两套独立标注。校史、野史描述内容类型；正史、较可信、当事人回忆、有争议说明材料能支持到哪一步。条目使用稳定地址，例如 [李庄电报考证](https://tjwild.hachile.org/stories/sixteen-character-telegram/)。

本次增补 100 篇，既有老校友讲述的[学生邮局](https://tjwild.hachile.org/stories/student-post-office/)，也有开发者自己留下创作手记的[限时小程序](https://tjwild.hachile.org/stories/six-minutes-past-ten/)。网页保留材料能支持的时间范围，读者可在每篇正文末尾查阅证据说明。

## 补充与勘误

同济大学校史、精神与文化交流群 同舟共济会QQ群1101135584

请将条目名称、建议更改处和可核对的来源发送至 anontjer@outlook.com。普通公开勘误也可提交 PR。私人资料请勿贴入公开 Issue、PR 或提交历史。暂缓材料保存在维护者本地的仓库外目录。确认可公开后，另写有来源的正文，再加入公开条目文件。

## 发布

推送至 `main` 后，GitHub Actions 运行 `npm test`，将新生成的 `_site/` 作为唯一的 Pages 发布目录。PR 运行相同检查。构建只读取两个指定的内容文件并复制明确列出的资源；非公开状态会使构建失败。自定义域名为 `tjwild.hachile.org`。

## 授权

站点代码采用 [MIT](LICENSE)，原创条目文字采用 [CC BY-NC-SA 4.0](content/LICENSE.md)。报道和馆藏原文保留各自权利。以下校园照片在本地缩放、转为 WebP，页内封面适配窗口裁切，仍遵循各自的原许可。

| 照片及原件 | 作者 | 许可 |
| --- | --- | --- |
| [文远楼正面](https://commons.wikimedia.org/wiki/File:Wenyuan_Building_Front.jpg) | Qiu Chaofan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| [三好坞的鹅](https://commons.wikimedia.org/wiki/File:三好坞的鹅_-_panoramio.jpg) | LGN | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| [冰霜覆盖的大礼堂](https://commons.wikimedia.org/wiki/File:冰霜覆盖的大礼堂_-_panoramio.jpg) | LGN | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
