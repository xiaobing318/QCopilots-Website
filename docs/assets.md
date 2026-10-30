# 素材与归属 / Assets and attribution

[中文](#中文) · [English](#english) · [真实截图登记](#真实截图登记) · [Real screenshot register](#real-screenshot-register) · [Search 图标 MIT 声明 / Search icon MIT notice](#search-图标的-mit-声明--mit-notice-for-the-search-icon)

## 中文

### 当前素材

| 素材                                              | 来源                                                                                                               | 用途与许可                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `public/images/qcopilots-icon.svg`                | QGIS fork 中的 `src/plugins/qcopilots/icons/qcopilots-plugin.svg`，提交 `1400035ddd394f5e4c8daf43609be8bc1f28becd` | QCopilots 产品图标与网站图标。保留原始 SVG 和来源注释，见下文                         |
| `public/images/search-icon.png`                   | QCopilots-Search 仓库中的 `resources/icons/qcs-512.png`，提交 `625ec5d3f446484c51c29e50e952a006c75356f3`           | QCopilots Search 产品图标。MIT，Copyright (c) 2026 xbyang                             |
| `public/images/og-zh.png`、`og-en.png`            | 由 `scripts/render-og.mjs` 生成                                                                                    | 分享链接时的预览图，1200 × 630                                                        |
| `src/components/demos/geometry/germany-states.ts` | Natural Earth，随 QGIS 发布的 `world_map.gpkg` 中的 `states_provinces` 图层，由 `scripts/demo-geometry.mjs` 生成   | QCopilots 界面示意中的德国各州地图。公有领域，致谢见[真实截图登记](#真实截图登记)下方 |
| `src/assets/real-runs/`                           | 产品真实运行时的截图                                                                                               | 产品页“一次真实运行”区块，逐张登记在[真实截图登记](#真实截图登记)中                   |
| Newsreader Variable                               | npm 包 `@fontsource-variable/newsreader`，The Newsreader Project Authors                                           | 英文标题。SIL Open Font License 1.1                                                   |
| Noto Serif SC Variable                            | npm 包 `@fontsource-variable/noto-serif-sc`，Google Noto                                                           | 中文标题。SIL Open Font License 1.1                                                   |
| Noto Sans SC Variable                             | npm 包 `@fontsource-variable/noto-sans-sc`，Google Noto                                                            | 正文。SIL Open Font License 1.1                                                       |
| Phosphor Icons                                    | npm 包 `@phosphor-icons/core`                                                                                      | 界面图标，构建时以内联 SVG 写入页面。MIT                                              |

字体和图标都随网站自托管，构建时复制进 `dist/`，访客不会请求 Google Fonts 或其他 CDN。

### 用代码绘制的视觉

网站上没有 AI 生成的图片。产品截图只出现在产品页的“一次真实运行”区块中，标注“真实截图 / Real screenshots”，见[真实截图登记](#真实截图登记)。

- **产品界面示意**（`src/components/demos/`）：用 HTML、CSS 和 SVG 画出的产品窗口。页面标注“界面示意 / Illustrative preview”。其中的文字来自内容文件，跟随页面语言。示例文件名和查询用于说明用途，部分取自真实测试，不代表真实用户文件。QCopilots 示意中的德国各州地图用 Natural Earth 数据生成，面积和分级来自真实计算，窗口本身仍是示意。
- **线稿插图**（`src/components/LineArt.astro`）：首页和 404 页使用的原创 SVG 线稿，不代表真实地理数据。
- **分享预览图**：`scripts/render-og.mjs` 用网站自己的字体、颜色、线稿和 QCopilots 图标，在本机浏览器中渲染生成。修改首页标题后重新运行 `site run render:og`。

### 真实截图登记

每张真实截图都要在这里登记一行。文件路径相对于 `src/assets/real-runs/`。新截图入库后，按[隐私检查清单](../src/assets/real-runs/README.md#提交前的隐私检查)逐张核对，再把“隐私检查”填为“是”。录制方法见[内容维护](maintenance.zh.md#真实运行与截图)，截图中的数字和说法记录在[产品事实来源](product-evidence.md)中。

| 文件                              | 尺寸        | 产品版本                                                                         | 录制日期   | 来源                                                                                    | 隐私检查 |
| --------------------------------- | ----------- | -------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- | -------- |
| `qcopilots-search/zh-1-pdf.png`   | 1468 × 1002 | QCopilots Search 0.3.0，Windows x64 CPU 便携版                                   | 2026-10-29 | 中文样例文件夹，查询“图书馆开放时间通知”，命中社区通讯 PDF 第 2 页                      | 是       |
| `qcopilots-search/zh-2-sign.png`  | 1468 × 1002 | 同上                                                                             | 2026-10-29 | 中文样例文件夹，查询“保持安全出口畅通的标牌”，命中告示图片中的文字                      | 是       |
| `qcopilots-search/zh-3-video.png` | 1468 × 1002 | 同上                                                                             | 2026-10-29 | 中文样例文件夹，查询“户外大雨”，命中雨景视频的片段                                      | 是       |
| `qcopilots-search/en-1-pdf.png`   | 1468 × 1002 | 同上                                                                             | 2026-10-29 | 英文样例文件夹，查询 “A library notice about opening hours”，命中 PDF 第 2 页           | 是       |
| `qcopilots-search/en-2-sign.png`  | 1468 × 1002 | 同上                                                                             | 2026-10-29 | 英文样例文件夹，查询 “A sign asking people to keep an exit clear”，命中告示图片中的文字 | 是       |
| `qcopilots-search/en-3-video.png` | 1468 × 1002 | 同上                                                                             | 2026-10-29 | 英文样例文件夹，查询 “Heavy rain falling outdoors”，命中雨景视频的片段                  | 是       |
| `qcopilots/1-map.png`             | 2548 × 1178 | QCopilots 开发版：QGIS 4.2 fork，提交 `dffa89d4a25`，2026-10-27 打包，Windows 11 | 2026-10-29 | 德国 16 个州的面积分级图，以及“面积最大的五个州”的回答                                  | 是       |
| `qcopilots/2-layout.png`          | 2480 × 3507 | 同上                                                                             | 2026-10-29 | QCopilots 导出的 A4 地图 `germany_states_area.png`                                      | 是       |
| `qcopilots/3-check.png`           | 2548 × 1178 | 同上                                                                             | 2026-10-29 | 第一轮的自检结果，以及移除两个临时图层前的预览                                          | 是       |

Search 每种语言各有一组截图，画面中出现的路径只有测试用的 `C:/QCopilots-Demo/…`。QCopilots 只录了一次中文运行，三张截图由两种语言共用，英文页面显示译成英文的输入，不另加“译文”标注。截图保持原始分辨率，未做遮挡或修饰，画面中可以看到模型名称。模型服务运行在同一网络中的另一台电脑上，本记录不写它的地址。

**地图数据致谢**：QCopilots 的界面示意和真实运行都使用 Natural Earth 的一级行政区划数据（Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com），取自 QGIS 自带的 `world_map.gpkg`。Natural Earth 为公有领域，不需要许可文本。

**Search 样例素材**：两个样例文件夹（中文 `搜索示例`、英文 `Search samples`）各有 13 个文件。第三方素材取自 QCopilots-Search 仓库的 `tests/acceptance/fixtures/media/`（提交 `625ec5d`，归属见同目录的 `NOTICE.md`），下载后没有改动。

| 样例文件（中文 / 英文）                     | 作者与来源                                                                                             | 许可                       | 说明                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------- |
| `蓝色星球.jpg` / `Blue marble.jpg`          | NASA 图像，Reto Stöckli 根据 NASA 和 NOAA 数据制作，Wikimedia Commons “Blue Marble Eastern Hemisphere” | 美国联邦政府作品，公有领域 | 仓库中的 `photo-001.jpg`                                               |
| `午后阵雨.webm` / `Afternoon downpour.webm` | Salvadormello30，Wikimedia Commons “Lluvia intensa”                                                    | CC0 1.0                    | 仓库中的 `video-001.webm`，360p 转码                                   |
| `院子里的声音.ogg` / `Backyard sounds.ogg`  | Amada44，Wikimedia Commons “Barking of a dog”                                                          | CC BY-SA 3.0               | 仓库中的 `environment-001.ogg`。截图中只出现文件名，网站不发布这段音频 |
| `车站广播.wav` / `Station announcement.wav` | QCopilots-Search 仓库中的系统语音合成录音                                                              | MIT                        | 仓库中的 `speech-001.wav`                                              |
| 告示图片、社区通讯 PDF、笔记和其余文档      | 为本次测试制作。种子收纳笔记取自 QCopilots-Search 的测试文本                                           | 自制。测试文本为 MIT       | 不含真实个人或客户信息                                                 |

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
4. 真实截图放进 `src/assets/real-runs/`，不放 `public/images/`。按 `src/assets/real-runs/README.md` 命名并做隐私检查，再在[真实截图登记](#真实截图登记)中加一行。不要把示意图称为截图。

## English

### Current assets

| Asset                                             | Source                                                                                                                         | Use and license                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `public/images/qcopilots-icon.svg`                | `src/plugins/qcopilots/icons/qcopilots-plugin.svg` in the QGIS fork, commit `1400035ddd394f5e4c8daf43609be8bc1f28becd`         | QCopilots product icon and site icon. Original SVG and source comment kept, see below                                         |
| `public/images/search-icon.png`                   | `resources/icons/qcs-512.png` in the QCopilots-Search repository, commit `625ec5d3f446484c51c29e50e952a006c75356f3`            | QCopilots Search product icon. MIT, Copyright (c) 2026 xbyang                                                                 |
| `public/images/og-zh.png`, `og-en.png`            | Generated by `scripts/render-og.mjs`                                                                                           | Previews for shared links, 1200 × 630                                                                                         |
| `src/components/demos/geometry/germany-states.ts` | Natural Earth, the `states_provinces` layer of `world_map.gpkg` that ships with QGIS, generated by `scripts/demo-geometry.mjs` | Germany's states in the QCopilots demo. Public domain, credit under the [Real screenshot register](#real-screenshot-register) |
| `src/assets/real-runs/`                           | Screenshots from real product runs                                                                                             | The “A real run” block on product pages, each listed in the [Real screenshot register](#real-screenshot-register)             |
| Newsreader Variable                               | npm package `@fontsource-variable/newsreader`, The Newsreader Project Authors                                                  | English headings. SIL Open Font License 1.1                                                                                   |
| Noto Serif SC Variable                            | npm package `@fontsource-variable/noto-serif-sc`, Google Noto                                                                  | Chinese headings. SIL Open Font License 1.1                                                                                   |
| Noto Sans SC Variable                             | npm package `@fontsource-variable/noto-sans-sc`, Google Noto                                                                   | Body text. SIL Open Font License 1.1                                                                                          |
| Phosphor Icons                                    | npm package `@phosphor-icons/core`                                                                                             | Interface icons, inlined as SVG at build time. MIT                                                                            |

Fonts and icons are self-hosted. The build copies them into `dist/`, so visitors never request Google Fonts or another CDN.

### Visuals drawn in code

The site has no AI-generated images. Product screenshots appear only in the “A real run” block on product pages, labelled “Real screenshots / 真实截图”. See the [Real screenshot register](#real-screenshot-register).

- **Product demos** (`src/components/demos/`): product windows drawn with HTML, CSS and SVG. Pages label them “Illustrative preview / 界面示意”. Their text comes from the content files and follows the page language. Sample file names and queries are illustrative, some taken from real tests. They are not real user files. The map of Germany's states in the QCopilots demo is generated from Natural Earth data, and its areas and classes are real calculations. The window around it is still an illustration.
- **Line art** (`src/components/LineArt.astro`): original SVG line drawings on the home and 404 pages. They do not show real geographic data.
- **Social preview images**: `scripts/render-og.mjs` renders them in a local browser from the site's own fonts, colours, line art and QCopilots icon. Run `site run render:og` again after changing the home headline.

### Real screenshot register

Register every real screenshot here, one row each. Paths are relative to `src/assets/real-runs/`. After committing a new screenshot, go through the [privacy check](../src/assets/real-runs/README.md#privacy-check-before-committing) image by image, then set “Privacy checked” to “yes”. How to record a run is in [Maintenance](maintenance.en.md#real-runs-and-screenshots). The numbers and claims in the screenshots are recorded in the [product evidence](product-evidence.md).

| File                              | Size        | Product version                                                                                   | Recorded   | Source                                                                                                         | Privacy checked |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | --------------- |
| `qcopilots-search/zh-1-pdf.png`   | 1468 × 1002 | QCopilots Search 0.3.0, Windows x64 CPU portable build                                            | 2026-10-29 | Chinese sample folder, query “图书馆开放时间通知”, matching page 2 of the newsletter PDF                       | yes             |
| `qcopilots-search/zh-2-sign.png`  | 1468 × 1002 | Same                                                                                              | 2026-10-29 | Chinese sample folder, query “保持安全出口畅通的标牌”, matching the text in the sign image                     | yes             |
| `qcopilots-search/zh-3-video.png` | 1468 × 1002 | Same                                                                                              | 2026-10-29 | Chinese sample folder, query “户外大雨”, matching a moment in the rain video                                   | yes             |
| `qcopilots-search/en-1-pdf.png`   | 1468 × 1002 | Same                                                                                              | 2026-10-29 | English sample folder, query “A library notice about opening hours”, matching page 2 of the PDF                | yes             |
| `qcopilots-search/en-2-sign.png`  | 1468 × 1002 | Same                                                                                              | 2026-10-29 | English sample folder, query “A sign asking people to keep an exit clear”, matching the text in the sign image | yes             |
| `qcopilots-search/en-3-video.png` | 1468 × 1002 | Same                                                                                              | 2026-10-29 | English sample folder, query “Heavy rain falling outdoors”, matching a moment in the rain video                | yes             |
| `qcopilots/1-map.png`             | 2548 × 1178 | QCopilots development build: QGIS 4.2 fork, commit `dffa89d4a25`, packaged 2026-10-27, Windows 11 | 2026-10-29 | Area classes for Germany's 16 states, and the answer listing the five largest                                  | yes             |
| `qcopilots/2-layout.png`          | 2480 × 3507 | Same                                                                                              | 2026-10-29 | The A4 map QCopilots exported, `germany_states_area.png`                                                       | yes             |
| `qcopilots/3-check.png`           | 2548 × 1178 | Same                                                                                              | 2026-10-29 | The first turn's self-check, and the preview before removing two temporary layers                              | yes             |

Search has one set of screenshots per language, and the only paths they show are the test folder `C:/QCopilots-Demo/…`. QCopilots was recorded once, in Chinese, so both languages share its three screenshots. The English page shows the prompts translated into English, with no “translated” label. The screenshots are shown at full resolution, unedited, and the model name is visible. The model service ran on another computer on the same network. This record does not give its address.

**Map data credit**: the QCopilots demo and real run both use Natural Earth first-level administrative boundaries (Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com), taken from the `world_map.gpkg` that ships with QGIS. Natural Earth is in the public domain and needs no license text.

**Search sample material**: the two sample folders (Chinese `搜索示例`, English `Search samples`) hold 13 files each. Third-party files come from `tests/acceptance/fixtures/media/` in the QCopilots-Search repository (commit `625ec5d`, attribution in `NOTICE.md` in the same folder) and were not modified.

| Sample file (Chinese / English)                            | Author and source                                                                                      | License                                   | Notes                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `蓝色星球.jpg` / `Blue marble.jpg`                         | NASA image by Reto Stöckli from NASA and NOAA data, Wikimedia Commons “Blue Marble Eastern Hemisphere” | US federal government work, public domain | `photo-001.jpg` in that repository                                                                          |
| `午后阵雨.webm` / `Afternoon downpour.webm`                | Salvadormello30, Wikimedia Commons “Lluvia intensa”                                                    | CC0 1.0                                   | `video-001.webm` there, a 360p transcode                                                                    |
| `院子里的声音.ogg` / `Backyard sounds.ogg`                 | Amada44, Wikimedia Commons “Barking of a dog”                                                          | CC BY-SA 3.0                              | `environment-001.ogg` there. Only its file name appears in screenshots. The site does not publish the audio |
| `车站广播.wav` / `Station announcement.wav`                | Text-to-speech recording from the QCopilots-Search repository                                          | MIT                                       | `speech-001.wav` there                                                                                      |
| Sign images, the newsletter PDF, notes and other documents | Made for this test. The seed storage note is QCopilots-Search test text                                | Own work. The test text is MIT            | No real personal or customer data                                                                           |

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
4. Real screenshots go in `src/assets/real-runs/`, not `public/images/`. Name and privacy-check them as `src/assets/real-runs/README.md` describes, then add a row to the [Real screenshot register](#real-screenshot-register). Never call an illustration a screenshot.

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
