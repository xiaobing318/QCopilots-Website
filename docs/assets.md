# 素材与归属 / Assets and attribution

[中文](#中文) · [English](#english) · [Search 图标 MIT 声明 / Search icon MIT notice](#search-图标的-mit-声明--mit-notice-for-the-search-icon)

## 中文

### 当前素材

| 素材                                   | 来源                                                                                                               | 用途与许可                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `public/images/qcopilots-icon.svg`     | QGIS fork 中的 `src/plugins/qcopilots/icons/qcopilots-plugin.svg`，提交 `1400035ddd394f5e4c8daf43609be8bc1f28becd` | QCopilots 产品图标与网站图标。保留原始 SVG 和来源注释，见下文 |
| `public/images/search-icon.png`        | QCopilots-Search 仓库中的 `resources/icons/qcs-512.png`，提交 `625ec5d3f446484c51c29e50e952a006c75356f3`           | QCopilots Search 产品图标。MIT，Copyright (c) 2026 xbyang     |
| `public/images/og-zh.png`、`og-en.png` | 由 `scripts/render-og.mjs` 生成                                                                                    | 分享链接时的预览图，1200 × 630                                |
| Newsreader Variable                    | npm 包 `@fontsource-variable/newsreader`，The Newsreader Project Authors                                           | 英文标题。SIL Open Font License 1.1                           |
| Noto Serif SC Variable                 | npm 包 `@fontsource-variable/noto-serif-sc`，Google Noto                                                           | 中文标题。SIL Open Font License 1.1                           |
| Noto Sans SC Variable                  | npm 包 `@fontsource-variable/noto-sans-sc`，Google Noto                                                            | 正文。SIL Open Font License 1.1                               |
| Phosphor Icons                         | npm 包 `@phosphor-icons/core`                                                                                      | 界面图标，构建时以内联 SVG 写入页面。MIT                      |

字体和图标都随网站自托管，构建时复制进 `dist/`，访客不会请求 Google Fonts 或其他 CDN。

### 用代码绘制的视觉

网站上没有 AI 生成的图片，也没有产品截图。

- **产品界面示意**（`src/components/demos/`）：用 HTML、CSS 和 SVG 画出的产品窗口。页面标注“界面示意 / Illustrative preview”。其中的文字来自内容文件，跟随页面语言。示例文件名和查询是说明用途的虚构内容，不代表真实用户文件或可复现的产品输出。
- **线稿插图**（`src/components/LineArt.astro`）：首页和 404 页使用的原创 SVG 线稿，不代表真实地理数据。
- **分享预览图**：`scripts/render-og.mjs` 用网站自己的字体、颜色、线稿和 QCopilots 图标，在本机浏览器中渲染生成。修改首页标题后重新运行 `site run render:og`。

### 已移除的素材

旧版视觉中的以下文件已在“温暖编辑风”改版中删除，仍可在 Git 历史中找到：

| 文件                                | 原来的内容                                  |
| ----------------------------------- | ------------------------------------------- |
| `public/images/hero-map.webp`       | 用 ImageGen 生成的首页地图展示图            |
| `public/images/qcopilots-map.webp`  | 用 ImageGen 生成的 QCopilots 空间分析示意图 |
| `public/images/search-preview.webp` | 用 ImageGen 生成的 Search 检索示意图        |
| `docs/design/selected-homepage.png` | 旧版视觉方向的 ImageGen 设计稿              |

`site run test:built` 会检查构建结果中没有 `/images/*.webp`，防止这些图片被重新引用。

### 许可文本

| 位置               | 内容                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `public/licenses/` | 随网站发布：Newsreader OFL、Noto Serif SC OFL、Noto Sans SC OFL、Phosphor MIT、QCopilots Search 图标 MIT |
| `docs/licenses/`   | 仓库内的副本：Newsreader OFL、Noto Serif SC OFL、Noto Sans SC OFL、Phosphor MIT                          |
| 网站许可页         | `/zh/licenses/` 和 `/en/licenses/`，链接到 `public/licenses/` 中的每个文件，页脚可进入                   |

升级字体或图标包时，用包内的 `LICENSE` 更新这两处副本。新增素材时，把许可文本放进 `public/licenses/`，并在 `src/pages/[lang]/licenses.astro` 的列表中加一行。

### QCopilots 图标说明

QCopilots SVG 中现有的注释为 `SVG created with Arrow, by QuiverAI (https://quiver.ai)`。该文件没有单独的许可证头。QGIS 源码的项目许可证不能直接当作这个图标的独立授权。本记录只保留来源，不替素材所有者新增授权条款。修改或替换该图标时，请保留这段注释并更新本表。

### 新增或替换素材

1. 文件放进 `public/images/`，在内容中用 `/images/…` 引用。
2. 在本文档的表格中登记来源、提交或版本，以及许可。
3. 产品图标保持原始比例，在产品文件的 `icon` 中写明原始宽高。
4. 改用真实截图时，记录产品版本和来源，确认截图中没有私人文件或连接凭据，并修改页面说明。不要把示意图称为截图。

## English

### Current assets

| Asset                                  | Source                                                                                                                 | Use and license                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `public/images/qcopilots-icon.svg`     | `src/plugins/qcopilots/icons/qcopilots-plugin.svg` in the QGIS fork, commit `1400035ddd394f5e4c8daf43609be8bc1f28becd` | QCopilots product icon and site icon. Original SVG and source comment kept, see below |
| `public/images/search-icon.png`        | `resources/icons/qcs-512.png` in the QCopilots-Search repository, commit `625ec5d3f446484c51c29e50e952a006c75356f3`    | QCopilots Search product icon. MIT, Copyright (c) 2026 xbyang                         |
| `public/images/og-zh.png`, `og-en.png` | Generated by `scripts/render-og.mjs`                                                                                   | Previews for shared links, 1200 × 630                                                 |
| Newsreader Variable                    | npm package `@fontsource-variable/newsreader`, The Newsreader Project Authors                                          | English headings. SIL Open Font License 1.1                                           |
| Noto Serif SC Variable                 | npm package `@fontsource-variable/noto-serif-sc`, Google Noto                                                          | Chinese headings. SIL Open Font License 1.1                                           |
| Noto Sans SC Variable                  | npm package `@fontsource-variable/noto-sans-sc`, Google Noto                                                           | Body text. SIL Open Font License 1.1                                                  |
| Phosphor Icons                         | npm package `@phosphor-icons/core`                                                                                     | Interface icons, inlined as SVG at build time. MIT                                    |

Fonts and icons are self-hosted. The build copies them into `dist/`, so visitors never request Google Fonts or another CDN.

### Visuals drawn in code

The site has no AI-generated images and no product screenshots.

- **Product demos** (`src/components/demos/`): product windows drawn with HTML, CSS and SVG. Pages label them “Illustrative preview / 界面示意”. Their text comes from the content files and follows the page language. Sample file names and queries are illustrative. They are not real user files or reproducible product output.
- **Line art** (`src/components/LineArt.astro`): original SVG line drawings on the home and 404 pages. They do not show real geographic data.
- **Social preview images**: `scripts/render-og.mjs` renders them in a local browser from the site's own fonts, colours, line art and QCopilots icon. Run `site run render:og` again after changing the home headline.

### Removed assets

The warm editorial redesign deleted these files from the previous design. They remain in Git history:

| File                                | What it was                                       |
| ----------------------------------- | ------------------------------------------------- |
| `public/images/hero-map.webp`       | ImageGen home page map illustration               |
| `public/images/qcopilots-map.webp`  | ImageGen QCopilots spatial analysis illustration  |
| `public/images/search-preview.webp` | ImageGen Search results illustration              |
| `docs/design/selected-homepage.png` | ImageGen mock-up of the previous visual direction |

`site run test:built` checks that the build contains no `/images/*.webp`, so they cannot quietly return.

### License texts

| Location           | Contents                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `public/licenses/` | Published with the site: Newsreader OFL, Noto Serif SC OFL, Noto Sans SC OFL, Phosphor MIT, QCopilots Search icon MIT |
| `docs/licenses/`   | Repository copies: Newsreader OFL, Noto Serif SC OFL, Noto Sans SC OFL, Phosphor MIT                                  |
| Licenses page      | `/zh/licenses/` and `/en/licenses/`, linking each file in `public/licenses/`, reachable from the footer               |

When upgrading font or icon packages, refresh both copies from the package `LICENSE`. When adding an asset, put its license text in `public/licenses/` and add a row to the list in `src/pages/[lang]/licenses.astro`.

### About the QCopilots icon

The QCopilots SVG contains the existing comment `SVG created with Arrow, by QuiverAI (https://quiver.ai)` and no separate license header. The QGIS project license cannot simply be treated as a separate grant for this icon. This record preserves provenance and does not invent license terms on the owner's behalf. Keep the comment and update this table if the icon is changed or replaced.

### Adding or replacing assets

1. Put files in `public/images/` and reference them as `/images/…` in content.
2. Record the source, commit or version, and license in the tables above.
3. Keep product icon proportions, and give the natural width and height in the product file's `icon`.
4. If you switch to a real screenshot, record the product version and source, make sure it shows no private files or connection credentials, and update the caption. Never call an illustration a screenshot.

## Search 图标的 MIT 声明 / MIT notice for the Search icon

以下为 QCopilots-Search 仓库的许可文本，适用于从该仓库复用的图标，不代表整个网站采用此许可。

The license text of the QCopilots-Search repository below applies to the icon reused from it. It is not a license for the whole website.

```text
MIT License

Copyright (c) 2026 xbyang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
