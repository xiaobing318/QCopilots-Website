# 实施与验证记录 / Implementation verification

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
