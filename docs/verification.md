# 实施与验证记录 / Implementation verification

## 2026-10-29 合作方式、版权与真实运行 / Contact, copyright and real runs

### 改动 / What changed

- 首页新增“合作方式”章节（试用与内测申请、部署与模型支持、定制开发、商务与渠道合作），页脚新增联系邮箱和“© 2026 北京星球时空智能科技有限公司 版权所有”，QCopilots 下载区新增“申请试用”。邮箱和公司名只在 `src/content/site.ts` 维护。
- QCopilots 的模型说明改为通俗写法：模型可部署在服务器、工作站或本机，都在“QCopilots”菜单的“Configure QCopilots URL”中填入网址。`127.0.0.1:8282`、引擎名称、令牌等技术用语由 `src/lib/plain-language.mjs` 统一拦截。
- 两个产品页新增“一次真实运行”区块，截图保持原始分辨率、未做遮挡。QCopilots 的界面示意改为与真实运行一致的德国各州面积图。
- 三个只读审查子代理（视觉、文案、无障碍与 CI）的意见已逐条处理，详见下文。

### 真实运行 / Real runs

| 产品 / Product   | 方式 / How                                                                                          | 结果 / Result                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| QCopilots        | `launch4Release` 启动发布包，在 QGIS 的 QCopilots 面板中用中文提问 4 轮，模型服务在另一台电脑上     | 4 轮全部完成。分级着色这一轮补了 3 句提示。16 州合计 357,574 km²，导出 A4 PDF 与 PNG，详见[产品事实记录](product-evidence.md) |
| QCopilots Search | 下载 v0.3.0 Windows CPU 便携包（SHA256 已核对）和语义模型，中英文两套各 13 个示例文件，独立配置目录 | 12/12 个测试查询把目标文件排在第一，中英文界面各截 3 张图                                                                     |

实测中发现的产品问题（`apply_layer_style` 无法加载 SLD、输出写到 QGIS 程序目录、实时投影转换失败、缺少分级样式工具）记录在[产品事实记录](product-evidence.md)中。

### 本机检查 / Local checks

| 检查 / Check                                                | 结果 / Result                              |
| ----------------------------------------------------------- | ------------------------------------------ |
| Prettier、ESLint、`astro check`、内容检查、单元测试         | 全部通过，0 错误                           |
| 构建与 `test:built`，`BASE_PATH=/` 和 `/QCopilots-Website/` | 两种路径都通过，各 10 个 HTML 文档         |
| Playwright e2e，Chromium                                    | `/` 53 通过，`/QCopilots-Website/` 50 通过 |

### CI 与线上访问 / CI and the live site

| 提交 / Commit                  | 结果 / Result                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `4d7b233` 功能，`824c4bf` 文档 | 运行 #20 全部通过，用时 9 分 54 秒：三个系统的质量检查、两种路径各 150 个浏览器测试、容器、依赖审计、Pages 构建 50 个、部署，线上访问 18 个 |

在内置浏览器中走查线上站点：`build-info.json` 为 `824c4bf`。中文首页 `#contact` 直接落位，四类合作和邮件链接正确，页脚版权与联系方式正确。QCopilots 页的真实截图以 AVIF 加载，“查看原图”打开 2548 × 1178 和 2480 × 3507 的原图，下载区的试用链接主题正确，正文没有技术用语。手机宽度下英文 Search 页没有横向滚动，图片全部加载，页脚公司名带 `lang="zh-CN"`。

测试结束后已关闭 QGIS 及其工具服务、qcs-gui、qcs-service、qcs-worker 和本地预览服务。

## 2026-10-26 暖色编辑风格改版 / Warm editorial redesign

环境：Windows 11 Pro 10.0.26200 x64。本机没有预装 Node、npm 或 gh，全部命令通过 `scripts\site.cmd` 自动下载的便携版 Node 24.22.1 运行，这也验证了“在另一台机器上一键准备环境”的路径。

Environment: Windows 11 Pro 10.0.26200 x64 with no Node, npm or gh installed. Every command ran through the portable Node 24.22.1 that `scripts\site.cmd` downloads, which exercises the "set up on another machine" path.

### 改动 / What changed

- 视觉改为暖色编辑风格：象牙色底、衬线标题、每个产品一种强调色，字体全部自托管。
- 用代码绘制的中英文界面示意取代旧的 AI 插图。
- 内容拆成每个产品一个文件，新增产品只需新增文件并注册。
- 产品事实按两个源码仓库重新核对，修正了确认流程、图层顺序、显卡和时间格式等说法，见[产品事实记录](product-evidence.md)。
- CI 在主分支检查通过后自动发布 Pages，随后 `pages-smoke` 任务以桌面和手机两种方式访问线上站点。
- 新增 `scripts\site.cmd`，双击即可准备环境并打开预览。新增 `site run` 与 `site browsers` 命令。

### 本机检查 / Local checks

| 检查 / Check                                                | 结果 / Result                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Prettier、ESLint、`astro check`、内容检查                   | 全部通过，0 错误                                                    |
| 单元测试 `npm test`                                         | 通过                                                                |
| 构建与 `test:built`，`BASE_PATH=/` 和 `/QCopilots-Website/` | 两种路径都通过，各 10 个 HTML 文档                                  |
| Playwright e2e，Chromium 与 WebKit                          | 84 通过，10 个平台相关跳过                                          |
| Playwright e2e，Firefox                                     | 本机无法启动 Firefox（Windows 并行配置错误），由 CI 在 Linux 上运行 |
| 线上访问测试 `test:live`，旧版站点                          | 改版前的通用用例全部通过                                            |

### CI 与线上访问 / CI and the live site

| 提交 / Commit                        | 结果 / Result                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `7004d65` CI 与工具                  | 全部任务通过，Pages 自动发布，`pages-smoke` 通过。Dependabot 随后关闭了 PR #1 至 #7                     |
| `e62b495` 改版                       | Firefox 字体测试失败一次。日志需要登录，因此加入 Playwright `github` 报告器，失败信息改为公开的运行注释 |
| `9617a67` 字体测试改为检查已加载字体 | 全部通过。线上语言切换测试首次超时、重试通过                                                            |
| `a94607c` 章节链接修复               | 全部通过且没有不稳定用例：两种路径各 135 个浏览器测试，Pages 产物 45 个，线上 16 个                     |

在应用内置浏览器中模拟用户访问线上站点，发现并修复了一个真实问题：页面加载期间的平滑滚动被字体和示意图的布局变化打断，带 `#faq`、`#downloads` 的分享链接以及从章节切换语言时会停在页面顶部。现在平滑滚动在加载完成后才开启。修复上线后复查：中文和英文页面都直接落在对应章节，语言切换保留产品、查询参数和章节，404 页面提供两种语言的首页与产品链接，Search 下载按钮指向 GitHub 最新发布。

A walkthrough of the live site in the app's built-in browser found one real issue. Smooth scrolling during load was cancelled while fonts and demos settled, so shared links with `#faq` or `#downloads`, and language switches from a chapter, opened at the top. Smooth scrolling now starts after load. After the fix went live, both languages land on the right chapter, language switches keep the product, query and chapter, the 404 page offers both homes and every product, and the Search download button points to the latest GitHub release.

### 并行审查 / Parallel reviews

三个只读子代理分别审查视觉与体验、产品事实、代码与 CI。主代理逐条核对后修复了：手机菜单同时显示两个图标、中文标题在词中断行、英文页面引号显示为全角、手机首屏被装饰图占据、确认流程措辞过度、底图位置描述错误、`aria-current` 取值无效、`site.ps1` 转发参数出错等问题。

Three read-only subagents reviewed visual design, product facts, and code with CI. The main agent verified each finding and fixed them, including the double menu icon, mid-word Chinese heading breaks, full-width quotes on English pages, the decorative phone hero, overstated confirmation copy, the basemap position claim, an invalid `aria-current` value and argument forwarding in `site.ps1`.

## 2026-10-23 首次交付（历史记录） / First delivery (historical)

以下内容描述旧版设计，素材已在改版中移除。

日期：2026-10-23。实际执行环境为 Windows 11 Pro，版本 10.0.26200，x64。运行时为 Node 24.22.1、npm 11.19.1，原生服务器为 Caddy 2.11.7。

本文记录首次本地交付时的实现与验证状态。下文的测试数量、归档校验值、未提交状态及进程清理记录均属于该次交付，不代表后续提交的实时状态。此后已按用户要求提交并推送代码，启动远端 CI，并开展真实 Chrome 用户流程审查。后续结果与修复见 [Chrome 用户体验审查与远端 CI 记录](chrome-audit.md)。

## 已完成的实现

官网采用用户选定的第 1 套视觉方向。包含两种语言的品牌首页、QCopilots 产品页和 QCopilots-Search 产品页，共 6 个内容页面，另有默认语言入口、404、sitemap、robots、健康检查与构建信息。

内容、下载配置和素材独立保存在本仓库。初始化和构建不读取 QGIS、QCopilots-Search 或 llama.cpp 仓库，不依赖 Codex 内置运行时。字体与图标自托管，产品窗口明确标为示意。

原生部署、Linux Compose 和 GitHub Pages 的配置及脚本均已实现。普通初始化不会注册系统服务，开机服务需在目标机器显式安装。

## 本机已执行的检查

| 检查                             | 结果与范围                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Prettier、ESLint                 | 通过，生成目录与工具缓存排除在源码检查之外                                                          |
| Astro 与双语内容检查             | 16 个 Astro/TypeScript 检查文件，零错误、零警告，产品及翻译字段、素材和下载配置通过                 |
| URL 辅助函数单元测试             | 3 项通过                                                                                            |
| 原生部署单元测试                 | 15 项通过                                                                                           |
| 双路径静态完整性                 | `/` 与 `/QCopilots-Website/` 均通过，验证 8 个 HTML 文件及本地资源、锚点、双语 SEO、下载空状态      |
| Chromium、Firefox、WebKit 根路径 | 50 项功能检查通过，另有 1 项截图采集通过                                                            |
| Chromium、Firefox、WebKit 子路径 | 50 项功能检查通过                                                                                   |
| 页面可访问性                     | 两种部署路径下的 6 个内容页面分别在 3 种引擎检查，无 serious/critical axe 问题                      |
| 桌面与手机视觉                   | 六个内容页面均保存 1280 px 和 390 px 截图，首页另以 941 px 与原稿比较，人工检查无重叠和主要内容截断 |
| npm audit                        | 0 个已知漏洞，包含开发依赖                                                                          |
| GitHub Actions 语法              | 官方 actionlint 1.7.12 检查通过，Actions 引用固定 SHA                                               |
| Caddy 生产配置                   | 根路径 HTTP、子路径 HTTPS 及原生公开域名配置通过实际 Caddy 配置验证                                 |
| 静态打包                         | 根路径与项目子路径均生成可搬迁归档、SHA256 与版本 JSON，归档条目校验通过                            |

根路径 Playwright 报告合计 51 passed、3 skipped、0 failed。子路径合计 50 passed、4 skipped、0 failed。合计有 100 个功能检查通过。

跳过项须单独理解。每种路径各有 1 项 Windows WebKit 原生 Tab 遍历测试跳过，原因是该引擎默认不把普通链接纳入 Tab 遍历，独立简单 HTML 中可复现。显式聚焦跳过导航链接再按 Enter 的行为在三种引擎均通过，Chromium 与 Firefox 的真实 Tab 遍历通过。Linux CI 继续执行 WebKit 的 Tab 测试。其余跳过均为非必要的重复截图采集。

## 独立初始化与真实原生部署

在包含空格和中文的独立目录，仅复制 Git 非忽略源码。没有复制 `.tools`、`node_modules` 或其他产品仓库。通过 PowerShell 5.1 完成官方 Node 下载、SHA256 校验、便携安装、`npm ci`、内容检查、正式构建及构建产物验证。

实际 Caddy 生命周期覆盖首次部署、重复启动、更新、失败更新恢复、版本与部署路径配置回滚、404、重复停止、外来 PID、占用端口及未获验证的管理端点。测试不按进程名终止其他服务。

另用真实官网产物部署至本机临时端口，六个中英文内容页面均返回 200，不存在的页面返回 404。验证结束停止实例，状态为 stopped、process 为 null。未注册 Windows Service、systemd 或 launchd 服务，没有修改主机 ACL。

## 首次本地交付时尚未执行的检查

- 首次本地交付已配置 GitHub Actions 的 Windows、Linux、macOS 干净安装与构建、原生生命周期、打包、三浏览器和 Linux 容器矩阵。当时尚未提交或推送代码，未声称远端 Actions 已运行成功。后续已实际运行，结果见 [Chrome 审查记录](chrome-audit.md)。
- 本机没有 Docker Engine，首次本地交付未执行真实 Linux 容器生命周期。当时仅完成生产 Caddyfile 验证，后续容器冒烟测试已在 Linux CI 中执行。
- Windows 10、其他 Windows 11 版本、Linux/macOS 目标机器和系统重启后的开机服务仍需对应设备验收。本机 Windows 11 的结果不替代这些平台。
- GitHub Pages 的实际发布需要用户设置 Pages 来源。自定义域名需要真实 DNS 和服务权限，源码提交本身不完成这些外部步骤。

## 修复与独立审查

并行子代理分别完成产品事实与翻译、三个展示素材、原生初始化部署、服务账户、容器与 CI、浏览器测试及独立只读审查。主代理汇总并核验。

本轮发现并修复了浅绿色背景上的小字对比度、首页标题断句、原生回滚缺失历史路径配置、部署目标拼写错误可能选择错误实例、Windows 代理变量回退，以及测试写死下载空状态等问题。可选下载元信息现在会显示，未来新增产品使用完整标识匹配。

## 产物与进程

根路径静态包 SHA256：

```text
4909961903027a0616193f4f04b7812de9be21b34d6487bc3f4340a0b85a5bd1
```

项目子路径静态包 SHA256：

```text
d9b8ad54a8f978760de63d517363eacff8610f36868472bd2a3d25e3dda30094
```

两个首次交付归档各含 123 个静态文件，约 5.1 MB。归档版本记录中的 dirty 为 true，表示生成这些归档时实现尚未提交，不将仓库原有 HEAD 冒称为实现提交。这些历史归档及校验值不代表后续提交的构建产物。

本轮启动的预览服务器、Caddy 测试实例及 Playwright 浏览器均已退出。没有启动 QGIS、llama-server 或容器。早期失败测试有约 9.3 KB 的诊断文件残留，自动审批以 blocked by policy 拒绝递归清理且未给出更详细原因。相关进程已经关闭，未绕过该拒绝。

## English verification summary

The selected light visual direction is implemented as a bilingual static Astro site. Six content routes, accurate download states, local assets, cross-platform bootstrap, native Caddy deployment, Linux Compose, GitHub Pages workflows and maintenance documentation are included.

On Windows 11 Pro x64, formatting, lint, type/content validation, 18 unit tests, real native deployment lifecycle and a clean-source bootstrap/build passed. Root and project-subpath builds passed static integrity checks. Chromium, Firefox and WebKit completed 100 functional checks across both prefixes. Windows WebKit's native Tab-to-links behavior is an explicitly skipped platform exception. Focused-link Enter behavior passed in all engines, and Linux CI retains the Tab test.

This document is the historical record of the initial local handoff. At that point the source changes were uncommitted, remote CI and Docker lifecycle tests had not run, and the test processes from that handoff had been stopped. Code has since been committed and pushed, and real GitHub Actions and Chrome visitor-flow testing have been performed. See the [Chrome audit and remote CI record](chrome-audit.md) for the follow-up results. Windows 10, Linux/macOS device acceptance and OS-service reboot acceptance remain outside the verified scope.
