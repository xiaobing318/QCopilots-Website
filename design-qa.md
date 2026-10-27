# 设计参考：温暖编辑风 / Design reference: warm editorial

[中文](#中文) · [English](#english)

## 中文

本文是网站当前视觉方向“温暖编辑风”的设计参考，供修改样式、添加组件或产品时对照。设计值以 `src/styles/tokens.css` 和 `src/styles/base.css` 为准，本文与代码不一致时，以代码为准并更新本文。

### 设计原则

1. **像一本排版考究的刊物。** 象牙色纸面、暖色墨水、宽松的留白、衬线标题。安静，不喧闹。
2. **内容优先。** 所有文字都是真实的 HTML。插图只做辅助，不承载关键信息。
3. **一次只用一种强调色。** 全站使用陶土色（clay），产品页和产品卡片使用该产品自己的主题色。
4. **视觉诚实。** 产品画面是用代码绘制并明确标注的示意，不冒充截图，不虚构运行结果。
5. **中英文同等对待。** 中文不是英文排版的附属品，有自己的字体、行高和标点规则。
6. **轻快、独立。** 字体自托管，不依赖 CDN。只有浅色主题。动效可有可无，关掉后内容完整。

### 颜色

原始颜色值只能写在 `src/styles/tokens.css`，组件中只引用变量。产品颜色来自产品文件中的 `theme`。

| 变量          | 值        | 用途                                            |
| ------------- | --------- | ----------------------------------------------- |
| `--ivory-50`  | `#faf9f5` | 页面底色（`--bg`）                              |
| `--ivory-100` | `#f4f2eb` | 色带、窗口标题栏、悬停底色                      |
| `--oat-200`   | `#ece7db` | 更深一层的色带                                  |
| `--oat-300`   | `#ddd5c4` | 控件描边、标签外框                              |
| `--line`      | `#e4ded2` | 细分隔线、卡片边框                              |
| `--paper`     | `#ffffff` | 卡片、示意窗口（`--surface`）                   |
| `--ink-900`   | `#1f1e1b` | 标题、主按钮（`--text-strong`）                 |
| `--ink-700`   | `#3b3832` | 正文（`--text`）                                |
| `--ink-500`   | `#67625a` | 次要文字（`--text-muted`）                      |
| `--clay-50`   | `#f6eae2` | 浅陶土底色、文字选中底色                        |
| `--clay-500`  | `#c4643f` | 装饰强调色（`--accent`）：线稿、图标            |
| `--clay-600`  | `#9e4a2b` | 文字强调色与焦点框（`--accent-ink`、`--focus`） |

产品变量 `--product-accent`、`--product-accent-ink`、`--product-wash` 默认等于陶土色，在产品页和卡片上被产品 `theme` 覆盖。当前取值：

| 产品             | accent    | accentInk | wash      |
| ---------------- | --------- | --------- | --------- |
| QCopilots        | `#2e8572` | `#1f6656` | `#e7f0ec` |
| QCopilots Search | `#3a62c4` | `#2b4fa8` | `#e8edf8` |

对比度：

- `--ink-500` 在象牙底色上为 5.7:1，在 `--oat-200` 上为 4.9:1，可以用于小字。
- `--clay-600` 在象牙底色上为 5.7:1，在 `--oat-200` 上为 4.9:1，可以用于链接和小标题。
- `--clay-500` 在象牙底色上只有 3.8:1，只能用于装饰、图标和大号文字，不能用于正文。
- 产品 `accentInk` 必须在 `#faf9f5`、`#ffffff` 和自己的 `wash` 上达到 4.5:1，`site check` 会检查。

只提供浅色主题。`html` 设置了 `color-scheme: light`，不要添加深色模式样式。阴影保持轻微，只用 `--shadow-1` 和 `--shadow-2`。

### 字体与字号

| 用途     | 字体                                                     |
| -------- | -------------------------------------------------------- |
| 英文标题 | Newsreader Variable（`--font-display`）                  |
| 中文标题 | Noto Serif SC Variable，接在 Newsreader 之后作为中文字形 |
| 正文     | Noto Sans SC Variable（`--font-body`），中英文共用       |
| 代码     | 系统等宽字体（`--font-mono`）                            |

| 变量         | 大小    | 用途                 |
| ------------ | ------- | -------------------- |
| `--text-xs`  | 13px    | 说明文字、标签、眉题 |
| `--text-sm`  | 15px    | 按钮、导航、次要文字 |
| `--text-md`  | 17px    | 正文                 |
| `--text-lg`  | 18–22px | 引言段落 `.lead`     |
| `--text-xl`  | 22–26px | h3、卡片标题         |
| `--text-2xl` | 30–44px | h2                   |
| `--text-3xl` | 40–68px | h1                   |
| `--text-4xl` | 44–88px | 首页大标题           |

带范围的字号随屏幕宽度平滑变化。两种语言的排版参数由 `base.css` 按 `lang` 分别设置：

| 参数         | 英文 `lang="en"`  | 中文 `lang="zh-CN"`   |
| ------------ | ----------------- | --------------------- |
| 大标题行高   | 1.08              | 1.3                   |
| 小标题行高   | 1.2               | 1.4                   |
| 正文行高     | 1.6               | 1.85                  |
| 引言行高     | 1.55              | 1.8                   |
| 大标题字距   | -0.02em           | +0.02em               |
| 大标题字重   | 440               | 600                   |
| 小标题字重   | 500               | 600                   |
| 每行最大宽度 | 36em              | 38em                  |
| 眉题         | 大写，字距 0.08em | 不转大写，字距 0.12em |

中文排版规则：

- **中文永远不用负字距。** 负字距只用于纯拉丁文字，例如英文标题和品牌名 “QCopilots”。
- **中文不用斜体。** 中文强调用字重或颜色。Newsreader 的斜体只用于英文。
- **行高更松。** 中文字形更密，行高要比英文大，见上表。
- **不要用 `<br>` 手动断行。** 标题使用 `text-wrap: balance`，段落使用 `text-wrap: pretty`。需要固定断句时，在内容中拆成多段，例如首页标题 `home.title` 的两段。
- **标点挤压。** 中文标题开启 `text-spacing-trim`，行首的全角标点会自动收紧。
- **语言标注。** 英文页面中出现的中文（例如语言切换中的“简体中文”）必须放在 `lang="zh-CN"` 元素里，构建检查会验证。
- **中英混排。** 中文与英文单词、数字之间留一个半角空格，使用全角标点。

### 间距与布局

| 变量                        | 值                                      |
| --------------------------- | --------------------------------------- |
| `--space-1` 至 `--space-10` | 4、8、12、16、24、32、48、64、96、128px |
| `--section-y`               | 区块上下留白，64–128px                  |
| `--gutter`                  | 页面左右边距，20–56px                   |
| `--container`               | 内容最大宽度 1200px                     |
| `--container-narrow`        | 阅读宽度 760px                          |

- 区块内部的元素间距用 `--space-4` 到 `--space-6`，元素组之间用 `--space-7` 到 `--space-8`，区块之间用 `--section-y`。
- 典型的区块结构：眉题、标题、引言，然后是内容。
- 圆角：`--radius-s` 6px，`--radius-m` 12px，`--radius-l` 20px，`--radius-xl` 28px，按钮和标签用 `--radius-pill`。
- 断点：767px 及以下为手机布局，顶栏收起为菜单按钮，高度从 72px 变为 64px。首页首屏在 900px 及以下改为单栏。

### 组件

| 组件       | 要点                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 顶栏       | 吸顶，半透明象牙底色，滚动后出现底线。手机上收起为菜单。没有 JavaScript 时直接显示链接       |
| 章节导航   | 产品页吸顶的章节链接                                                                         |
| 主按钮     | `.button`：胶囊形，深墨底色、象牙色文字，最小高度 48px                                       |
| 次按钮     | `.button-secondary`：透明底、燕麦色描边                                                      |
| 不可用按钮 | 使用 `disabled` 或 `aria-disabled="true"`，浅色底、次要文字色                                |
| 文字链接   | `.text-link`：强调文字色，悬停时出现下划线，箭头右移 3px                                     |
| 眉题       | `.eyebrow`：标题上方的小标签，使用强调文字色                                                 |
| 卡片       | 白色底、`--line` 描边、大圆角、`--shadow-1`                                                  |
| 色带       | `.band`（`--ivory-100`）和 `.band-oat`（`--oat-200`）。示意底色和示例行使用 `--product-wash` |
| 常见问题   | 原生 `details` / `summary`，展开时加号旋转                                                   |
| 图标       | Phosphor：内容用 Light 风格，界面控件用 Regular 风格。大小 1.25em，`aria-hidden`，总是配文字 |
| 线稿       | `LineArt.astro`，陶土色细线，纯装饰                                                          |

样式规则：

- 通用样式放在 `base.css`，组件样式写在各自的 `.astro` 文件中。
- 不写以产品命名的选择器（例如 `.search-…`），产品差异全部来自 `theme` 数据，构建检查会拦下。

### 动效

- **默认关闭，按需开启。** 只有系统未要求“减少动态效果”时，`<html>` 才会加上 `motion-ok` 类。所有动画都写在 `.motion-ok` 之下。
- **内容不依赖动效。** 元素的默认状态就是最终状态，动画只负责“从无到有”的过程。没有 JavaScript 或关闭动效时，页面完整可读。
- **时长与缓动。** `--dur-1` 160ms 用于悬停，`--dur-2` 320ms 用于状态切换，`--dur-3` 640ms 用于淡入。统一使用 `--ease-out`。
- **平滑滚动** 只在未要求减少动态效果时开启。
- **减少动态效果时**，全局规则把动画和过渡缩短到几乎为零。
- **界面示意** 只在至少 35% 进入屏幕时播放，每个场景 9 秒，提供暂停按钮。减少动态效果时停在第一个场景，并隐藏暂停按钮。
- 不使用视差、自动播放视频或接管滚动。

### 无障碍

- 正文对比度至少 4.5:1。装饰色不用于文字。
- 焦点框使用 `:focus-visible`，2px `--focus` 描边，外移 3px，任何组件都不能去掉。
- 每页有跳到正文的链接，且只有一个 `h1`，标题层级不跳级。
- `<html lang>` 为 `zh-CN` 或 `en`，页面中的另一种语言片段单独标注 `lang`。
- 主要按钮至少 48px 高，其他可点击目标至少 24px。
- 图片都有 `alt`，纯装饰的元素设为 `aria-hidden`。
- 不把重要内容藏在悬停之后。
- 没有 JavaScript 时，导航链接、常见问题和下载入口都可以使用。
- 浏览器测试用 axe 按 WCAG 2.1 A / AA 检查每个页面。

### 界面示意准则

技术约定见[内容维护中的产品界面示意](docs/maintenance.zh.md#产品界面示意)。设计上：

- **展示一个真实的使用瞬间。** 简化产品界面，保留可辨认的结构，不必像素级复刻。
- **只展示产品真实具备的能力。** 以[产品事实来源](docs/product-evidence.md)为准，示例查询尽量取自真实测试。
- **文字简短。** 窗口宽度一般为 46–60em。外框会按比例缩放，首页缩略图中的文字可以小到无法阅读，因为它只是装饰。
- **配色克制。** 白色窗口、象牙色标题栏，高亮只用产品强调色，不引入新颜色。
- **不虚构。** 不展示假的成功率、私人风格的文件路径或真实用户数据。
- **标签始终可见。** “界面示意 / Illustrative preview”由外框自动添加，不要遮挡。
- **两种语言都要好看。** 英文通常更长，中文更短，布局要同时容纳。

### 视觉检查清单

用 `site dev` 打开网站，在 Chrome 中按 `F12` 打开开发者工具。

**宽度**：按 `Ctrl+Shift+M`（macOS 为 `Cmd+Shift+M`）切换设备模式，分别把宽度设为 **390**、**768**、**1440** px。

**页面**：每个宽度下检查中文和英文的首页、每个产品页、许可页（`/zh/licenses/`）和 404 页（随便输入一个不存在的地址）。

- [ ] 没有横向滚动条，文字没有重叠或被截断
- [ ] 中文标题没有只剩一个字的末行
- [ ] 顶栏：390px 为菜单按钮，768px 和 1440px 为完整导航，菜单能用 `Esc` 关闭
- [ ] 界面示意完整显示在外框内，标签可见
- [ ] 每个产品页和卡片使用自己的主题色
- [ ] 按 `Tab` 时焦点框清晰可见，顺序合理
- [ ] 标题是衬线字体，正文是无衬线字体。开发者工具的 Network 面板中，字体都来自本站地址
- [ ] 英文页面除语言切换外没有中文
- [ ] 下载区状态正确：QCopilots 显示“即将开放下载”，Search 链接可以打开

**减少动态效果**：按 `Ctrl+Shift+P`，输入 “Rendering” 打开渲染面板，把 “Emulate CSS media feature prefers-reduced-motion” 设为 `reduce`，刷新页面。

- [ ] 页面没有任何移动，界面示意停在第一个场景，暂停按钮隐藏

**没有 JavaScript**：按 `Ctrl+Shift+P`，输入 “Disable JavaScript” 并执行，刷新页面。检查结束后用 “Enable JavaScript” 恢复。

- [ ] 全部内容可见，导航链接可用，常见问题能展开，界面示意显示第一个场景

**分享图**：修改过首页标题时，确认 `public/images/og-zh.png` 和 `og-en.png` 已重新生成。

需要留存截图时，设置环境变量 `E2E_SCREENSHOT_DIR` 为一个文件夹，再运行 `site run test:e2e`，Chromium 会在 390、768、1440px 三种宽度下把每页的整页截图保存到该文件夹。

## English

This is the design reference for the site's current “warm editorial” direction. Use it when changing styles or adding components or products. The values in `src/styles/tokens.css` and `src/styles/base.css` are the source of truth. If this document disagrees with the code, the code wins and this document should be updated.

### Principles

1. **Like a well-set publication.** Ivory paper, warm ink, generous white space, serif headlines. Calm, not loud.
2. **Content first.** All text is real HTML. Illustrations support the text and never carry essential information.
3. **One accent at a time.** The site uses clay. Product pages and product cards use that product's own theme colour.
4. **Honest visuals.** Product windows are labelled illustrations drawn in code. They never pose as screenshots or invent results.
5. **Both languages are first class.** Chinese is not an afterthought to English layout. It has its own fonts, line heights and punctuation rules.
6. **Light and self-contained.** Fonts are self-hosted with no CDN. Light theme only. Motion is optional, and content is complete without it.

### Colour

Raw colour values belong only in `src/styles/tokens.css`. Components reference variables. Product colours come from the product file's `theme`.

| Variable      | Value     | Used for                                               |
| ------------- | --------- | ------------------------------------------------------ |
| `--ivory-50`  | `#faf9f5` | Page background (`--bg`)                               |
| `--ivory-100` | `#f4f2eb` | Bands, window title bars, hover backgrounds            |
| `--oat-200`   | `#ece7db` | A deeper band                                          |
| `--oat-300`   | `#ddd5c4` | Control outlines, label borders                        |
| `--line`      | `#e4ded2` | Hairlines, card borders                                |
| `--paper`     | `#ffffff` | Cards, demo windows (`--surface`)                      |
| `--ink-900`   | `#1f1e1b` | Headings, primary buttons (`--text-strong`)            |
| `--ink-700`   | `#3b3832` | Body text (`--text`)                                   |
| `--ink-500`   | `#67625a` | Secondary text (`--text-muted`)                        |
| `--clay-50`   | `#f6eae2` | Pale clay background, text selection                   |
| `--clay-500`  | `#c4643f` | Decorative accent (`--accent`): line art, icons        |
| `--clay-600`  | `#9e4a2b` | Accent text and focus ring (`--accent-ink`, `--focus`) |

The product variables `--product-accent`, `--product-accent-ink` and `--product-wash` default to clay. Product pages and cards override them from the product `theme`. Current values:

| Product          | accent    | accentInk | wash      |
| ---------------- | --------- | --------- | --------- |
| QCopilots        | `#2e8572` | `#1f6656` | `#e7f0ec` |
| QCopilots Search | `#3a62c4` | `#2b4fa8` | `#e8edf8` |

Contrast:

- `--ink-500` is 5.7:1 on ivory and 4.9:1 on `--oat-200`, so it works for small text.
- `--clay-600` is 5.7:1 on ivory and 4.9:1 on `--oat-200`, fine for links and small headings.
- `--clay-500` is only 3.8:1 on ivory. Use it for decoration, icons and large text only, never body text.
- A product `accentInk` must reach 4.5:1 on `#faf9f5`, `#ffffff` and its own `wash`. `site check` enforces this.

There is only a light theme. `html` sets `color-scheme: light`. Do not add dark mode styles. Keep shadows subtle, using only `--shadow-1` and `--shadow-2`.

### Type

| Use              | Font                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| English headings | Newsreader Variable (`--font-display`)                                    |
| Chinese headings | Noto Serif SC Variable, after Newsreader in the stack, for Chinese glyphs |
| Body text        | Noto Sans SC Variable (`--font-body`), for both languages                 |
| Code             | System monospace (`--font-mono`)                                          |

| Variable     | Size    | Used for                            |
| ------------ | ------- | ----------------------------------- |
| `--text-xs`  | 13px    | Captions, labels, eyebrows          |
| `--text-sm`  | 15px    | Buttons, navigation, secondary text |
| `--text-md`  | 17px    | Body text                           |
| `--text-lg`  | 18–22px | Lead paragraphs (`.lead`)           |
| `--text-xl`  | 22–26px | h3, card titles                     |
| `--text-2xl` | 30–44px | h2                                  |
| `--text-3xl` | 40–68px | h1                                  |
| `--text-4xl` | 44–88px | Home headline                       |

Sizes with a range scale smoothly with screen width. `base.css` sets the typesetting values per `lang`:

| Setting             | English `lang="en"` | Chinese `lang="zh-CN"` |
| ------------------- | ------------------- | ---------------------- |
| Display line height | 1.08                | 1.3                    |
| Heading line height | 1.2                 | 1.4                    |
| Body line height    | 1.6                 | 1.85                   |
| Lead line height    | 1.55                | 1.8                    |
| Display tracking    | -0.02em             | +0.02em                |
| Display weight      | 440                 | 600                    |
| Heading weight      | 500                 | 600                    |
| Measure             | 36em                | 38em                   |
| Eyebrow             | Uppercase, 0.08em   | No case change, 0.12em |

Rules for Chinese:

- **Never use negative tracking on Chinese.** Negative tracking is for Latin-only text, such as English headings and the “QCopilots” wordmark.
- **No italics in Chinese.** Emphasise with weight or colour. Newsreader italics are for English only.
- **Looser line height.** Chinese glyphs are denser, so lines need more room than English. See the table.
- **No manual `<br>` breaks.** Headings use `text-wrap: balance` and paragraphs `text-wrap: pretty`. When a phrase must break in a fixed place, split it in content, like the two parts of `home.title`.
- **Punctuation trimming.** Chinese headings enable `text-spacing-trim`, which tightens full-width punctuation at the start of a line.
- **Mark the language.** Chinese text on an English page, such as “简体中文” in the language switch, must sit inside a `lang="zh-CN"` element. The build check verifies this.
- **Mixed text.** Put a half-width space between Chinese and Latin words or numbers, and use full-width punctuation.

### Spacing and layout

| Variable                    | Value                                   |
| --------------------------- | --------------------------------------- |
| `--space-1` to `--space-10` | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px |
| `--section-y`               | Vertical section padding, 64–128px      |
| `--gutter`                  | Side margins, 20–56px                   |
| `--container`               | Content width, up to 1200px             |
| `--container-narrow`        | Reading width, up to 760px              |

- Use `--space-4` to `--space-6` between elements inside a section, `--space-7` to `--space-8` between groups, and `--section-y` between sections.
- A typical section reads: eyebrow, heading, lead, then content.
- Radii: `--radius-s` 6px, `--radius-m` 12px, `--radius-l` 20px, `--radius-xl` 28px. Buttons and labels use `--radius-pill`.
- Breakpoints: at 767px and below the layout is mobile. The header collapses into a menu button and shrinks from 72px to 64px. The home hero becomes one column at 900px and below.

### Components

| Component          | Notes                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Header             | Sticky, translucent ivory, gains a bottom line after scrolling. A menu on phones. Without JavaScript the links show directly |
| Chapter navigation | Sticky chapter links on product pages                                                                                        |
| Primary button     | `.button`: pill shape, dark ink background, ivory text, at least 48px tall                                                   |
| Secondary button   | `.button-secondary`: transparent with an oat outline                                                                         |
| Unavailable button | `disabled` or `aria-disabled="true"`, pale background, secondary text colour                                                 |
| Text link          | `.text-link`: accent text colour, underline on hover, arrow moves 3px right                                                  |
| Eyebrow            | `.eyebrow`: a small label above headings, in accent text colour                                                              |
| Card               | White background, `--line` border, large radius, `--shadow-1`                                                                |
| Band               | `.band` (`--ivory-100`) and `.band-oat` (`--oat-200`). Demo stages and example rows use `--product-wash`                     |
| FAQ                | Native `details` / `summary`, the plus icon rotates when open                                                                |
| Icons              | Phosphor: Light weight for content, Regular for interface controls. 1.25em, `aria-hidden`, always with text                  |
| Line art           | `LineArt.astro`, thin clay lines, decoration only                                                                            |

Style rules:

- Shared styles go in `base.css`. Component styles live in each `.astro` file.
- No selectors named after products (such as `.search-…`). Product differences come only from `theme` data. The build check blocks them.

### Motion

- **Off by default, on when welcome.** `<html>` gets the `motion-ok` class only when the system does not ask for reduced motion. Every animation is scoped under `.motion-ok`.
- **Content never depends on motion.** The default state of every element is its final state. Animations only add the journey there. Without JavaScript or with motion off, pages are complete.
- **Durations and easing.** `--dur-1` 160ms for hover, `--dur-2` 320ms for state changes, `--dur-3` 640ms for reveals. Always `--ease-out`.
- **Smooth scrolling** is on only when reduced motion is not requested.
- **With reduced motion**, a global rule cuts animations and transitions to almost zero.
- **Demos** play only while at least 35% on screen, 9 seconds per scene, with a pause button. With reduced motion they stay on the first scene and the pause button is hidden.
- No parallax, autoplaying video or scroll hijacking.

### Accessibility

- Body text contrast is at least 4.5:1. Decorative colours are never used for text.
- Focus uses `:focus-visible` with a 2px `--focus` outline offset by 3px. No component may remove it.
- Every page has a skip link to the main content and exactly one `h1`. Heading levels do not skip.
- `<html lang>` is `zh-CN` or `en`. Snippets in the other language carry their own `lang`.
- Primary buttons are at least 48px tall. Other click targets are at least 24px.
- Every image has `alt`. Purely decorative elements are `aria-hidden`.
- Nothing important hides behind hover.
- Without JavaScript, navigation links, FAQ and downloads all work.
- Browser tests run axe against WCAG 2.1 A / AA on every page.

### Demo guidelines

The technical contract is in [Product demos in Maintenance](docs/maintenance.en.md#product-demos). For design:

- **Show one real moment of use.** Simplify the product's interface but keep its recognisable structure. A pixel-perfect copy is not the goal.
- **Show only what the product really does.** Follow the [product evidence](docs/product-evidence.md). Take example queries from real tests where possible.
- **Keep text short.** Windows are usually 46–60em wide. The frame scales them, so text in home card thumbnails may become too small to read. That is fine, because thumbnails are decoration.
- **Restrained colour.** White window, ivory title bar, highlights only in the product accent. No new colours.
- **Invent nothing.** No fake success rates, private-looking file paths or real user data.
- **The label stays visible.** The frame adds “Illustrative preview / 界面示意” automatically. Do not cover it.
- **Good in both languages.** English usually runs longer and Chinese shorter. The layout must fit both.

### Visual QA checklist

Open the site with `site dev` and press `F12` in Chrome to open DevTools.

**Widths**: press `Ctrl+Shift+M` (`Cmd+Shift+M` on macOS) for device mode and set the width to **390**, **768** and **1440** px in turn.

**Pages**: at each width, check the Chinese and English home page, every product page, the licenses page (`/en/licenses/`) and the 404 page (type any address that does not exist).

- [ ] No sideways scrolling, and no overlapping or clipped text
- [ ] No Chinese heading ends with a single character on its last line
- [ ] Header: a menu button at 390px, full navigation at 768px and 1440px. `Esc` closes the menu
- [ ] Demos fit inside their frame, with the label visible
- [ ] Each product page and card uses its own theme colour
- [ ] Pressing `Tab` shows a clear focus ring in a sensible order
- [ ] Headings are serif and body text is sans-serif. In the DevTools Network panel, every font comes from the site's own address
- [ ] English pages show no Chinese apart from the language switch
- [ ] Downloads are right: QCopilots shows “Download coming soon” and the Search links open

**Reduced motion**: press `Ctrl+Shift+P`, type “Rendering” to open the Rendering panel, set “Emulate CSS media feature prefers-reduced-motion” to `reduce`, then reload.

- [ ] Nothing moves. Demos stay on the first scene and the pause button is hidden

**No JavaScript**: press `Ctrl+Shift+P`, run “Disable JavaScript”, then reload. Run “Enable JavaScript” when you are done.

- [ ] All content shows, navigation links work, FAQ answers expand and demos show their first scene

**Share images**: if the home headline changed, confirm `public/images/og-zh.png` and `og-en.png` were regenerated.

To keep screenshots, set the environment variable `E2E_SCREENSHOT_DIR` to a folder and run `site run test:e2e`. Chromium saves full-page screenshots of each page at 390, 768 and 1440px there.
