# 同济野史

<div align="center"><img alt="Pages 构建检查" src="https://github.com/GPDdev/tjwild.hachile.org/actions/workflows/pages.yml/badge.svg"> <img alt="Code MIT" src="https://img.shields.io/badge/code-MIT-green"> <img alt="Version 1.0.0" src="https://img.shields.io/badge/version-1.0.0-blue"> <img alt="简体中文" src="https://img.shields.io/badge/language-简体中文-b4533e"></div>

同济大学民间资料站。四个栏目收录 8 篇专题长文，另有 119 则事件条目，其中 113 则为校园野史。全站引用 141 份公开资料。[阅读专题野史](https://tjwild.hachile.org/lore/)

[本地运行](#本地运行) / [公开资料](#公开资料) / [补充与勘误](#补充与勘误) / [发布](#发布) / [授权](#授权)

## 本地运行

使用 Node.js 22 或更新版本，无需安装第三方依赖。预览命令使用 Python 3。

```sh
npm test
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

打开 `http://127.0.0.1:8000/`。首页、长文、栏目、事件和来源索引均生成独立 HTML。启用 JavaScript 后可作全文筛选、切换亮暗色，或按 Ctrl/⌘ K 搜索。

## 公开资料

| 路径 | 内容 |
| --- | --- |
| `content/articles.json` | 已核准公开的条目、正文、分段来源及置信度说明 |
| `content/features.json` | 专题长文、各段注释、章节关联事件与证据说明 |
| `content/columns.json` | 栏目名称、简介及全部事件的栏目归属 |
| `content/sources.json` | 来源名称、发布者、原文语言和链接 |
| `scripts/catalog.mjs` | 事件资料验证、重大事件与图片署名 |
| `scripts/features.mjs` | 栏目和长文的校验、段落注号、引文回跳与关联事件 |
| `scripts/build.mjs` | 生成首页、全部条目、野史目录、来源页和各文章页 |
| `scripts/check.mjs` | 检查发布文件清单、链接、锚点、引文和可见范围 |
| `assets/` | 本地样式、交互、图标和四张已授权照片 |

正文有两套独立标注。校史、野史描述内容类型；正史、较可信、当事人回忆、有争议说明材料能支持到哪一步。条目使用稳定地址，例如 [李庄电报考证](https://tjwild.hachile.org/stories/sixteen-character-telegram/)。

专题按「迁校与旧址」「食住与通信」「社团与舞台」「课堂与街坊」编排。例如，通信篇把学生邮局、电话亭和限时小程序放在同一条线上。点击段末注号可核对原文，展开章节末尾的事件可查看旧条目及其置信度，事件页也能返回引用它的章节。[阅读通信专题](https://tjwild.hachile.org/lore/everyday/campus-message/)

## 补充与勘误

同济大学校史、精神与文化交流群 同舟共济会QQ群1101135584

请将条目名称、建议更改处和可核对的来源发送至 anontjer@outlook.com。普通公开勘误也可提交 PR。私人资料请勿贴入公开 Issue、PR 或提交历史。暂缓材料保存在维护者本地的仓库外目录。确认可公开后，另写有来源的正文，再加入公开条目文件。

## 发布

推送至 `main` 后，GitHub Actions 运行 `npm test`，将新生成的 `_site/` 作为唯一的 Pages 发布目录。PR 运行相同检查。构建只读取指定的公开内容文件并复制明确列出的资源，非公开文章会使构建失败。自定义域名为 `tjwild.hachile.org`。

## 授权

站点代码采用 [MIT](LICENSE)，原创条目文字采用 [CC BY-NC-SA 4.0](content/LICENSE.md)。报道和馆藏原文保留各自权利。前三张校园照片已缩放并转为 WebP。李庄照片采用共享资源提供的 JPEG 预览图。封面按屏幕宽度裁切，四张照片各自沿用原许可。

| 照片及原件 | 作者 | 许可 |
| --- | --- | --- |
| [文远楼正面](https://commons.wikimedia.org/wiki/File:Wenyuan_Building_Front.jpg) | Qiu Chaofan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| [三好坞的鹅](https://commons.wikimedia.org/wiki/File:三好坞的鹅_-_panoramio.jpg) | LGN | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| [冰霜覆盖的大礼堂](https://commons.wikimedia.org/wiki/File:冰霜覆盖的大礼堂_-_panoramio.jpg) | LGN | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| [李庄禹王宫](https://commons.wikimedia.org/wiki/File:Lizhuang_Yuwang_Temple_(20250118093723).jpg) | N509FZ | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
