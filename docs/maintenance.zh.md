# 内容与工程维护

[English](maintenance.en.md) · [返回 README](../README.md)

本文写给日常维护网站的人，不要求前端开发经验。文中的 `site` 代表：Windows 上的 `.\scripts\site.cmd`，Linux / macOS 上的 `bash scripts/site.sh`。

## 内容模型

网站上的文字和产品数据都放在 `src/content/`，页面组件只负责排版。日常维护基本只需要改这个目录。

| 文件                           | 作用                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `src/content/types.ts`         | 所有内容的字段定义，相当于结构说明书                                                                         |
| `src/content/products.ts`      | 产品注册表。逐个导入产品文件，再按 `order` 从小到大排序                                                      |
| `src/content/products/<id>.ts` | 一个产品的全部数据：双语文案、主题色、状态、图标、界面示意、链接和下载入口                                   |
| `src/content/ui.ts`            | 导航、首页、合作方式、产品页小标题、页脚等公共文案                                                           |
| `src/content/site.ts`          | 不翻译的发布方信息 `organization`：公司名称、版权年份和联系邮箱，见[联系方式与公司信息](#联系方式与公司信息) |
| `src/content/icons.ts`         | 文案中可以使用的图标名，对应 `src/components/Icon.astro` 中的图标                                            |
| `src/content/demos.ts`         | 界面示意的键名，对应 `src/components/demos/registry.ts` 中的组件                                             |
| `src/assets/real-runs/`        | 产品页“一次真实运行”使用的截图，见[真实运行与截图](#真实运行与截图)                                          |
| `docs/product-evidence.md`     | 网站文案所依据的产品事实和真实运行记录                                                                       |

产品文件的主要字段：

| 字段                        | 说明                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                        | 网址中的标识，例如 `/zh/products/qcopilots-search/`。只用小写字母、数字和连字符。上线后不要改，否则旧链接失效 |
| `order`                     | 排列顺序，数字小的在前，不能和其他产品重复                                                                    |
| `status`                    | `available` 表示已发布，`coming-soon` 表示即将推出                                                            |
| `icon`                      | 图标路径（以 `/images/` 开头）和图片的原始宽高                                                                |
| `theme`                     | 产品主题色，见[主题色与对比度](#主题色与对比度)                                                               |
| `demo`                      | 可选。界面示意的键名，不填时自动使用通用示意                                                                  |
| `links`                     | 可选。`releases`、`source`、`license` 三个 HTTPS 链接                                                         |
| `locales.zh` / `locales.en` | 两种语言的全部文案                                                                                            |
| `downloads`                 | 下载入口列表，至少一项                                                                                        |

`locales` 中包括名称、分类、标语、简介、SEO、首页卡片、功能亮点、使用示例、可选的数据亮点 `facts`、步骤、隐私说明、系统要求、常见问题、下载说明、界面示意文字 `demo`，以及可选的真实运行记录 `realRun`。每个字段的含义见 `types.ts` 中的注释，`demo` 和 `realRun` 的细节见[产品界面示意](#产品界面示意)和[真实运行与截图](#真实运行与截图)。

## 安全地修改文案

不确定某段文字在哪里时，在 `src/content/` 中搜索这段文字即可。修改时遵守以下规则：

1. **两种语言一起改。** `zh` 和 `en` 的字段、列表长度必须完全一致，`site check` 会逐项比对。
2. **不留空。** 空字符串和空列表都会被检查拦下。
3. **英文里不出现中文。** 英文一侧不能有汉字，也不能有全角标点，如 `，。：；（）、！？「」『』`。
4. **中文按中文习惯写。** 使用全角标点。中文与英文单词、数字之间留一个半角空格，例如“不到 1 GB 的模型”。
5. **英文按英文习惯写。** 意思一致即可，不要逐字翻译。
6. **写给普通用户。** 产品文案和 `ui.ts` 中不写用户看不懂的技术细节：网址、IP 地址、端口、`localhost`、模型引擎名称（例如 llama）、令牌和密钥、本地路径（例如 `C:\Users`、`AppData`）。说明模型怎样连接时，只写用户能照着做的话，例如：模型可以运行在服务器、工作站或你自己的电脑上，在 QGIS 的“QCopilots”菜单中选择“Configure QCopilots URL”，填入它的网址。下载和源码链接放在 `downloads` 和 `links` 中，不写进正文。`site check` 会检查产品文件的全部文案（包括 `demo` 和 `realRun`）和 `ui.ts`，`site run test:built` 再扫描每个页面的文字、`alt` 等属性和分享描述，许可页除外。技术细节记在[产品事实来源](product-evidence.md)中。
7. **保留占位符。** 例如 `ui.ts` 中的 `'了解 {name}'`，`{name}` 会被替换成产品名，两种语言都要保留。其他占位符：`footer.copyright` 中的 `{year}` 和 `{company}`，`product.trialSubject` 中的 `{name}`，`product.realRecorded` 中的 `{date}`。
8. **`ui.ts` 不留无用的键。** 页面上不再使用的文案要从 `ui.ts` 删除，否则 `site check` 会报 `is not used`。
9. **图标名只用 `icons.ts` 中列出的。** 需要新图标时，见[添加新图标](#添加新图标)。
10. **产品事实要有依据。** 修改版本、格式、系统要求等事实时，同步更新[产品事实来源](product-evidence.md)。
11. **看一眼窄屏。** 改完用 `site dev` 预览，把浏览器窗口拉窄到手机宽度，检查中英文的换行。

首页大标题在 `ui.ts` 的 `home.title`，分为前后两段。修改它或 `home.eyebrow` 之后，需要[重新生成分享图](#分享预览图)。

## 开放或更新下载

`downloads` 中的每一项如下：

```ts
{
  id: 'qcopilots-windows',
  platform: 'windows',          // windows | macos | linux | all
  label: { zh: 'Windows', en: 'Windows' },
  url: null,                    // 尚未开放时为 null
  requirements: { zh: '…', en: '…' },  // 可选
  architecture: 'x64',          // 可选
  version: '1.0.0',             // 可选
}
```

QCopilots 安装包准备好后，按以下步骤开放下载：

1. 把产品的 `status` 从 `'coming-soon'` 改为 `'available'`。
2. 把每个平台的 `url: null` 换成确认过的 HTTPS 地址。
3. 有发布说明作为依据时，再填写 `requirements`、`architecture` 和 `version`。
4. 同步更新两种语言的 `downloads.description`，以及[产品事实来源](product-evidence.md)。
5. 运行 `site check`。

`coming-soon` 状态的产品不能填写下载地址，检查会拦下。地址为 `null` 时，页面显示不可点击的“即将开放下载”，不会生成空链接或 `#`。

不要用上游 QGIS 的下载页代替 QCopilots 安装包，也不要用 QGIS 支持的平台推断 QCopilots 的兼容性。QCopilots Search 的入口指向 GitHub 上的最新发布页 `releases/latest`，这样网站不会因为文件名变化而失效。

`coming-soon` 状态的产品会在下载卡片下方自动显示一行“想在正式发布前试用？申请试用”，点击后用访客的邮件程序给联系邮箱写信，主题为“申请试用 {产品名}”。它不在卡片里面，产品改为 `available` 后自动消失。文字在 `ui.ts` 的 `product.trialPrompt`、`trialCta` 和 `trialSubject` 中。

## 联系方式与公司信息

联系邮箱、公司名称和版权年份只写在 `src/content/site.ts` 的 `organization` 中，不需要翻译：

```ts
export const organization = {
  name: '北京星球时空智能科技有限公司', // 公司名称
  nameLang: 'zh-CN', // 公司名称的语言
  copyrightYear: 2026, // 版权年份
  email: 'xiaobinghere@gmail.com', // 联系邮箱
} as const;
```

用到它们的地方：

| 位置                          | 内容                                                           | 文案在 `ui.ts` 中的位置                                                                    |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 首页“合作方式”区块 `#contact` | 四种合作方式、“写邮件给我们”按钮和完整的邮箱地址               | `contact` 的 `eyebrow`、`title`、`lead`、`types`、`emailCta`、`emailLabel`、`emailSubject` |
| 每一页的页脚                  | “联系我们”一栏：邮箱和指向首页 `#contact` 的链接。底部的版权行 | `contact.footerHeading`、`contact.footerLink`、`footer.copyright`                          |
| 即将推出产品的下载区          | “申请试用”邮件链接                                             | `product.trialPrompt`、`trialCta`、`trialSubject`                                          |

- **改邮箱**：只改 `email`。按钮、页脚和试用链接会一起更新。`site check` 会检查邮箱格式，构建检查要求页面上的每个 `mailto:` 链接都使用这个地址，所以不要在其他地方另写邮箱。
- **改公司名称**：只改 `name`。版权行是 `ui.ts` 中的 `footer.copyright`，中文为 `'© {year} {company} 版权所有'`，英文为 `'© {year} {company}. All rights reserved.'`。英文页面中的公司名称保持中文，放在 `lang="zh-CN"` 的元素里。如果改用英文名称，要同时修改 `nameLang` 和 `scripts/verify-build.mjs` 中的版权检查，因为它要求公司名称带中文语言标记。
- **改年份**：改 `copyrightYear`。
- **改合作方式**：编辑 `ui.ts` 中 `contact.types` 的每一项（`icon`、`title`、`description`），两种语言的条数要相同。图标名必须在 `icons.ts` 中。条数可以增减，检查会按内容计数。
- **邮件主题**：`contact.emailSubject` 和 `product.trialSubject` 会经过编码写进链接，空格不会变成加号。

## 添加新产品

以添加 `QCopilots-xxx` 为例：

1. **复制产品文件。** 把 `src/content/products/qcopilots-search.ts` 复制为 `src/content/products/qcopilots-xxx.ts`。
2. **修改基本信息。**
   - `id: 'qcopilots-xxx'`，它也是网址的一部分。
   - `order` 取一个没用过的数字，比如 `30`，决定它在导航和首页中的位置。
   - `status` 按实际情况选择 `'available'` 或 `'coming-soon'`。
3. **放入图标。** 把图标文件放进 `public/images/`，例如 `public/images/xxx-icon.svg`。填写 `icon: { src: '/images/xxx-icon.svg', width: …, height: … }`，宽高写图片的原始尺寸。在[素材记录](assets.md)中登记来源和许可。
4. **设置主题色。** 填写 `theme` 的三种颜色，要求见[主题色与对比度](#主题色与对比度)。
5. **写两种语言的文案。** 改写 `locales.zh` 和 `locales.en` 的全部内容。亮点的 `icon` 只能用 `icons.ts` 中的名称。
6. **界面示意（专属示意可选）。** 暂时没有专属示意时，删除 `demo` 这一行，页面会自动使用通用示意 `GenericDemo`，文字来自 `locales.*.demo`。需要专属示意，见[产品界面示意](#产品界面示意)。
7. **下载与链接。** 填写 `downloads`，至少一项。`coming-soon` 时 `url` 全部为 `null`，下载区下方会自动出现“申请试用”链接。`links` 可选，必须是 HTTPS。
8. **真实运行（可选）。** 复制来的文件如果带有 `realRun`，先删除它。有了真实运行记录后，再在两种语言中都填写 `realRun`，截图放进 `src/assets/real-runs/qcopilots-xxx/`，见[真实运行与截图](#真实运行与截图)。没有 `realRun` 时页面不显示这个区块。
9. **注册产品。** 在 `src/content/products.ts` 中加入：

   ```ts
   import qcopilotsXxx from './products/qcopilots-xxx.ts';

   export const products: readonly Product[] = [qcopilots, qcopilotsSearch, qcopilotsXxx].toSorted(
     (a, b) => a.order - b.order,
   );
   ```

10. **更新系列介绍。** 首页标题、`src/content/ui.ts` 中的 `meta.description` 和 OG 图片描述的是整个系列（“地图与文件”）。如果新产品改变了这个说法，请同时修改中英文，并运行 `site run render:og`。
11. **运行检查。** 按[发布前检查](#发布前检查)的顺序执行。

完成后，以下内容会自动包含新产品，不需要另外修改：

- 两种语言的产品页 `/zh/products/qcopilots-xxx/` 和 `/en/products/qcopilots-xxx/`
- 顶部导航、页脚、首页产品卡片和使用示例
- 产品页底部的“了解其他产品”
- `coming-soon` 时下载区下方的“申请试用”链接
- 站点地图 `sitemap.xml`
- 内容检查、构建检查和浏览器测试

### 添加新图标

1. 在 `src/content/icons.ts` 的 `iconNames` 中加入新名称。
2. 在 `src/components/Icon.astro` 中，从 `@phosphor-icons/core/assets/light/` 导入对应的 Light 风格 SVG，并加入 `icons` 对照表。
3. 运行 `site check`。

## 产品界面示意

产品页和首页卡片上的“窗口”是用 HTML、CSS 和 SVG 绘制的界面示意，不是截图。它们会标注“界面示意 / Illustrative preview”，文字跟随页面语言。真实截图放在单独的“一次真实运行”区块中，见[真实运行与截图](#真实运行与截图)。

示意的文字在产品文件的 `locales.*.demo` 中：`caption` 是示意下方的说明，`windowTitle` 和 `placeholder` 是窗口标题和输入框提示，`labels` 是按钮、图层名等零散文字，`scenes` 是依次播放的场景。每个场景有 `query`（用户的请求），按需再加：

| 字段      | 说明                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| `steps`   | 产品执行的步骤，逐条出现                                                     |
| `reply`   | 产品的回答                                                                   |
| `results` | 结果列表，例如 Search 的命中文件                                             |
| `rows`    | 一张小表，每行一个 `label` 和 `value`，例如 QCopilots 回答“面积最大的五个州” |
| `total`   | 示意只画出前几条结果时，真实的结果总数                                       |

示意中的数字尽量来自真实测试，并与[产品事实来源](product-evidence.md)一致。

添加一个专属示意：

1. 在 `src/content/demos.ts` 的 `demoKeys` 中加入键名，例如 `'xxx-window'`。
2. 在 `src/components/demos/` 中新建组件，例如 `XxxDemo.astro`。可以先复制 `GenericDemo.astro`。
3. 在 `src/components/demos/registry.ts` 中把键名对应到新组件。
4. 在产品文件中设置 `demo: 'xxx-window'`。

组件需要遵守的约定（也写在 `DemoFrame.astro` 的注释里）：

- **属性固定为 `{ copy, variant }`。** `copy` 是产品文件中的 `locales.*.demo`，`variant` 是 `'full'`（产品页）或 `'thumb'`（首页缩略图）。
- **只渲染一个 `.demo-window`，尺寸全部用 `em`。** 用 `--demo-width` 设置窗口宽度，单位是 em，默认 60。外框会自动缩放字号，让窗口在任何屏幕宽度下都完整显示。
- **场景用 `data-scene` 区分。** 第一个场景是 `data-scene="0"`，其余场景加 `hidden`。没有 JavaScript 时只显示第一个场景。
- **动画只用两个类。** `.d-in` 按 `--d` 的顺序（0、1、2…）淡入，`.d-type` 像打字一样从左到右显示。不播放动画时，它们直接停在最终状态。
- **不放可交互元素。** 不要用按钮、链接或输入框，用 `span` 或 `div` 画出样子即可。示意区域会被设为 `inert` 和 `aria-hidden`，读屏软件读到的是下方的说明文字。
- **所有文字来自内容。** 组件中不写死任何文字，按钮名称等放进 `copy.labels`，两种语言使用相同的键。
- **颜色只用变量。** 使用 `tokens.css` 中的变量和 `--product-accent`、`--product-wash`，不写颜色值。
- **类名不带产品名。** 构建检查会拒绝 `.search-…` 或以产品 `id` 命名的选择器，请用中性的短前缀。

播放逻辑在 `demo-motion.ts` 中：示意进入屏幕后每 9 秒切换一个场景。访客可以用说明文字旁的按钮暂停。系统开启“减少动态效果”时不播放，并隐藏暂停按钮。

### QCopilots 示意中的地图

QCopilots 示意画的是德国 16 个州的面积专题图。三个场景依次是：按面积分级着色并标注州名、排成 A4 地图页、列出面积最大的五个州。地图数据来自随 QGIS 发布的 `world_map.gpkg`（Natural Earth，公有领域），由 `scripts/demo-geometry.mjs` 调用 QGIS 的处理工具生成 `src/components/demos/geometry/germany-states.ts`。这个文件不要手工修改，需要调整时重新生成。

生成需要一份 QGIS 3.36 或更新的安装或发布包，里面要有 `qgis_process`。在仓库根目录用 `site setup` 下载的 Node 运行（Windows cmd 示例，`<QGIS>` 换成 QGIS 所在的文件夹）：

```bat
.tools\node-v24.22.1-win-x64\node.exe scripts\demo-geometry.mjs ^
  --qgis-process "<QGIS>\bin\qgis_process-qgis-qt6.bat" ^
  --data "<QGIS>\apps\qgis-qt6\resources\data\world_map.gpkg" ^
  --admin Germany --out src/components/demos/geometry/germany-states.ts
```

常用选项：`--admin` 选择国家，`--classes` 设定分级数（默认 5），`--mode` 选择 `equal`（等间距，与真实运行一致，默认）、`quantile`（等数量）或 `jenks`（自然断点），`--crs` 设定计算面积用的等积投影（默认 EPSG:3035），`--tolerance` 设定简化程度（默认 4000 米）。全部选项写在脚本开头的注释里。`world_map.gpkg` 只会被读取，不会被修改。

重新生成后，检查产品文件中 `demo` 的这些文字是否仍然对得上，两种语言都要改：

- `labels.class1` 到 `labels.class5`：图例中的面积范围，对应生成文件中的 `breaks`
- 第三个场景的 `rows` 和 `reply`：面积最大的五个州及其面积，顺序与生成文件中的 `areas` 一致
- 换了国家时：`caption`、`windowTitle`、`labels.layerResult`、`labels.mapTitle`、`labels.tableTitle` 和各场景的文字
- `labels.scaleBar` 写的是比例尺代表的实际距离，例如 `100 km`，比例尺长度会按它计算

数据来源记录在[素材记录](assets.md)中。

## 真实运行与截图

产品文件的每种语言可以有一个可选的 `realRun`，在产品页“使用示例”一章（`#use-cases`）的示例列表下方显示为“一次真实运行 / A real run”区块。它不增加新的章节导航。区块带有“真实截图 / Real screenshots”标签。宽屏时左侧是输入、步骤、数字和说明，右侧是截图，窄屏时上下排列。第一张截图大图显示，其余两张一行，点击打开原图。

| 字段         | 说明                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `title`      | 区块标题                                                                             |
| `intro`      | 一两句介绍：做了什么任务、用的什么数据                                               |
| `prompts`    | 实际输入的原话，按顺序                                                               |
| `steps`      | 产品实际做了什么，从运行过程归纳                                                     |
| `facts`      | 这次运行得到的真实数字，格式同 `facts.items`                                         |
| `images`     | 截图列表，每项有 `file`（相对于 `src/assets/real-runs/` 的路径）、`alt` 和 `caption` |
| `version`    | 运行时的产品版本和系统                                                               |
| `recordedOn` | 录制日期，格式 `YYYY-MM-DD`，两种语言相同                                            |
| `note`       | 数据来源、模型运行在哪里、截图做过哪些处理                                           |

`realRun` 必须两种语言都有或都没有。它的文字同样遵守[写给普通用户](#安全地修改文案)的规则，`note` 里不写服务器地址，只写“模型运行在同一网络中的另一台电脑上”这类说法。

### 录制

1. 使用已发布或已打包的版本，记下版本号、提交和系统，填进 `version`。
2. 只用公开素材或专门为测试制作的样例，不用私人或客户的数据。记下画面中出现的每个样例文件的来源和许可。
3. 最好每种语言各录一次，用该语言输入，截图的数量、顺序和画面一一对应。只录了一次时，另一种语言共用这些截图，`prompts` 写成该语言的译文，不另加“译文”标注，`alt` 和图片说明也各自翻译。
4. 照实记录输入的原话、产品做了什么，以及得到的数字。不补写没有发生的步骤。
5. 只截取相关的窗口，宽度最好不小于 1280 像素，界面截图用 PNG。

### 提交前的隐私检查

逐张检查，画面中不能有：

- 真实姓名、用户名、电脑名、邮箱或电话
- 用户文件夹和本地路径，例如 `C:\Users\…`、`AppData`
- 服务器地址、内网穿透地址、端口、密钥或令牌
- 通知弹窗、聊天窗口、任务栏或其他无关窗口
- 私人或客户的文件名、项目名和数据

截图保持原始分辨率，原样发布。确有隐私内容时才允许裁剪或遮盖，不修改运行结果。做过的处理写进 `realRun.note`。重新导出图片以去掉元数据。

### 文件命名

```text
src/assets/real-runs/<产品 id>/<语言>-<序号>-<名称>.png
```

例如 `src/assets/real-runs/qcopilots-search/zh-1-pdf.png` 和 `src/assets/real-runs/qcopilots-search/en-1-pdf.png`。只用 PNG 或 JPG（扩展名小写），不要提交 WebP。两种语言的图片数量相同、顺序一致，`<序号>` 与 `realRun.images` 中的顺序相同。

一次运行只录了一种语言时，两种语言共用同一组截图，文件名去掉语言前缀：

```text
src/assets/real-runs/<产品 id>/<序号>-<名称>.png
```

例如 QCopilots 的 `qcopilots/1-map.png`，中英文两边的 `realRun.images` 都引用它。完整规则见 `src/assets/real-runs/README.md`。

构建时 Astro 会生成 640 和 1280 像素宽的 AVIF 与原格式图片，原图保留给“查看原图”链接。不必自己压缩或转换格式。

### 记录与检查

- 在[素材记录](assets.md#真实截图登记)中登记每张截图：文件、产品版本、录制日期、来源和隐私检查结果。
- 在[产品事实来源](product-evidence.md)中记录这次运行和 `realRun` 中的每个数字与说法。
- `site check` 检查日期格式、两种语言的日期相同、文件存在且是 PNG 或 JPG。
- `site run test:built` 检查区块位于 `#use-cases` 中、标签、输入和步骤的条数、`alt` 和图片说明、图片由 Astro 生成，以及原图链接有效。
- `site run test:e2e` 在浏览器中确认每张截图都能加载，原图链接能打开。

## 主题色与对比度

每个产品在 `theme` 中有三种颜色，格式都是 `#rrggbb`：

| 字段        | 用途                         | 要求                                                                   |
| ----------- | ---------------------------- | ---------------------------------------------------------------------- |
| `accent`    | 装饰色：线条、图标、示意高亮 | 无文字对比要求                                                         |
| `accentInk` | 文字色：链接、小标题         | 在 `#faf9f5`（象牙底色）、`#ffffff` 和自己的 `wash` 上对比度至少 4.5:1 |
| `wash`      | 浅色背景：色带、示意底色     | 足够浅，让 `accentInk` 满足对比要求                                    |

`site check` 会计算对比度，不达标时报出是哪种背景。通常把 `accentInk` 再调深一些即可。

这些颜色以 `--product-accent`、`--product-accent-ink`、`--product-wash` 的形式作用于产品页、首页卡片和示意。全站通用的颜色只在 `src/styles/tokens.css` 中定义，其他样式只引用变量。完整的设计规则见[设计参考](../design-qa.md)。

## 字体

| 字体                   | 用途           |
| ---------------------- | -------------- |
| Newsreader Variable    | 英文标题       |
| Noto Serif SC Variable | 中文标题       |
| Noto Sans SC Variable  | 正文（中英文） |

字体通过 npm 包 `@fontsource-variable/*` 安装，在 `src/layouts/SiteLayout.astro` 中导入，字体族写在 `tokens.css` 的 `--font-display` 和 `--font-body` 中。构建时字体文件会复制进 `dist/`，与网站同域发布，不经过 Google Fonts 或其他 CDN，国内访问不受影响。中文字体被拆成许多按字符范围划分的小文件，浏览器只下载页面实际用到的部分。

升级字体包时，对照包内的 `LICENSE` 更新 `public/licenses/` 和 `docs/licenses/` 中的许可副本，并在中英文页面上检查标题效果。

## 分享预览图

`public/images/og-zh.png` 和 `public/images/og-en.png` 是分享链接时社交平台和聊天工具显示的预览图，尺寸为 1200 × 630。它们由 `scripts/render-og.mjs` 用 Playwright 生成，内容取自 `ui.ts` 中的 `home.title` 和 `home.eyebrow`、`LineArt.astro` 的线稿和 QCopilots 图标。

以下情况需要重新生成：

- 修改了首页大标题 `home.title` 或 `home.eyebrow`
- 修改了 `src/components/LineArt.astro` 或 `public/images/qcopilots-icon.svg`
- 调整了主色或标题字体

```bash
site browsers chromium    # 第一次需要
site run render:og
```

生成后把两个 PNG 一起提交。`site run test:built` 会检查它们存在且尺寸正确。

## 发布前检查

推送到 `main` 之前，按顺序执行：

1. `site check`：类型检查与内容检查
2. `site run format:check`：格式检查，不通过时运行 `site run format` 自动整理
3. `site run lint`：代码检查
4. `site run test`：单元测试
5. `site build`：生成 `dist/`
6. `site run test:built`：检查构建结果
7. `site browsers chromium`：仅第一次需要
8. `site run test:e2e`：浏览器与无障碍测试
9. 修改了首页标题时，运行 `site run render:og` 并提交新图片
10. 新增或替换了真实截图时，按[隐私检查](#提交前的隐私检查)逐张核对，并更新[素材记录](assets.md#真实截图登记)和[产品事实来源](product-evidence.md)
11. 按[设计参考](../design-qa.md#视觉检查清单)中的清单用 `site dev` 看一遍

各项检查分别能发现的问题：

| 命令                  | 检查内容                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site check`          | Astro 类型。`scripts/check-content.mjs`：中英文结构一致、英文中无中文、文案中没有地址、端口、密钥等技术词、主题色对比度、示意键和图标名有效（包括合作方式的图标）、`realRun` 的日期和截图文件、联系邮箱格式、`coming-soon` 产品没有下载地址、链接为 HTTPS、`ui.ts` 无未使用的键                                                                   |
| `site run test`       | 网址与路径工具函数的单元测试                                                                                                                                                                                                                                                                                                                      |
| `site run test:built` | `scripts/verify-build.mjs`：链接和资源都存在、响应式图片的每个候选文件都已发布、双语 SEO 与站点地图、英文页面在 `lang="zh-CN"` 元素之外没有中文、页面上没有技术词、每个 `mailto:` 都使用 `site.ts` 中的邮箱、每页页脚的邮箱、合作链接和版权行、首页合作方式、下载状态和试用链接、真实运行区块、示意结构、分享图尺寸、样式中没有按产品命名的选择器 |
| `site run test:e2e`   | Playwright 浏览器测试（`tests/e2e`）：导航、语言切换、FAQ、键盘焦点、手机布局、减少动态效果、无 JavaScript 时的可用性、首页合作方式与页脚联系、试用链接、真实截图加载，以及 axe 无障碍检查                                                                                                                                                        |
| `site run test:live`  | 访问线上网站的每一页，见[开发与部署](deployment.zh.md#确认线上版本)                                                                                                                                                                                                                                                                               |

浏览器测试默认只用 Chromium。想同时测试 Firefox 和 WebKit，先运行 `site browsers all`，再设置环境变量 `E2E_BROWSERS=all`。想按 GitHub Pages 的项目路径测试，构建和测试前设置 `BASE_PATH=/QCopilots-Website/`。Linux 第一次安装浏览器时加 `--with-deps`，例如 `site browsers all --with-deps`，它会安装浏览器需要的系统软件包。

环境变量只对当前终端窗口有效，设置方法：

```text
PowerShell   $env:E2E_BROWSERS = 'all'
cmd          set E2E_BROWSERS=all
Bash         export E2E_BROWSERS=all
```

推送后，CI 还会在三种操作系统、三种浏览器和两种部署路径下重复这些检查，并运行原生部署、Linux 容器和依赖安全审计。失败时先看 Actions 中的报告、截图和日志，不要反复改锁文件来碰运气。

自动化测试不等于真机验收。CI 通过不代表每一台 Windows 10 / 11、每个 Linux 发行版或每款 Mac 都已验证。开机服务和重启后的行为需要在目标机器上单独确认。

## 保持 Node 和 npm 版本一致

仓库固定使用 Node 24.22.1 和 npm 11.19.1。升级时，以下位置必须一起修改：

| 位置                                                                 | 要改的内容                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `.node-version`                                                      | Node 版本号                                                                                                  |
| `package.json`                                                       | `engines.node`、`engines.npm` 和 `packageManager`                                                            |
| `config/toolchain.json`                                              | `nodeVersion`、`npmVersion`、每个平台的 `node-*-url` 和 `node-*-sha256`、`nodeChecksumsSource`、`verifiedAt` |
| `.github/workflows/ci.yml`、`.github/workflows/dependency-audit.yml` | 每一处 `node-version:`                                                                                       |

注意事项：

- 校验值从 Node 官方的 `SHASUMS256.txt` 复制，Windows、Linux、macOS 的 x64 和 arm64 都要更新。
- `npmVersion` 必须等于新 Node 自带的 npm 版本，否则一键脚本会拒绝运行。
- Caddy 的版本也锁定在两处：`config/toolchain.json` 中的 `caddy*` 字段（原生部署）和 `Dockerfile` 中的镜像（容器部署）。升级时保持同一版本。
- 改完后在每台电脑上重新运行 `site setup`，新版 Node 会下载到 `.tools/`。推送后确认三个平台的 CI 都通过。

## 依赖更新

- 依赖使用精确版本，并提交 `package-lock.json`。日常安装用 `npm ci`（`site setup` 就是这样做的），只有升级依赖时才重新生成锁文件。
- 不要通过修改 `node_modules/` 来修复构建。
- Dependabot（`.github/dependabot.yml`）每周检查一次：
  - npm 依赖：开发工具类依赖合并成一个 PR。
  - GitHub Actions：所有 Action 的更新合并成一个 PR，因为 Pages 相关的几个 Action 需要一起升级。
  - Docker：更新 `Dockerfile` 中的 Caddy 镜像。
  - 忽略 TypeScript 和 `@types/node` 的大版本升级。`astro check` 和 `typescript-eslint` 还不支持 TypeScript 7，`@types/node` 要与固定的 Node 24 对应。
- Dependabot 的 PR 必须等 CI 全部通过后再合并。升级字体或图标包时，同时检查许可文本和页面效果。
- `.github/workflows/dependency-audit.yml` 每周运行一次 `npm audit`，也可以在 Actions 中手动触发。
