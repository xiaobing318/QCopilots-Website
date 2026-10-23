# Chrome 用户体验审查与远端 CI 记录

日期：2026-10-23。此次审查延续 [首次本地验证](verification.md)，根据用户要求将官网提交至远端 `main` 分支，运行 GitHub Actions，并通过真实 Chrome 模拟访客浏览。主代理负责 Chrome 操作与证据核验，并行子代理分别检查 CI、交互边界和验证记录。

本记录区分浏览器实际观察、自动化回归和仍需目标设备验收的内容。截图与操作证据随本次交付报告提供，不依赖开发者电脑的绝对路径。

## 真实 Chrome 用户流程

Chrome 使用本地 Caddy 提供的正式静态产物进行浏览，分别覆盖根路径和 `/QCopilots-Website/` 项目子路径。产品页面以普通访客的任务顺序检查，既验证内容和导航，也检查失败后的恢复路径。

| 场景               | 操作与观察                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| 初次了解产品       | 从首页进入 QCopilots 和 QCopilots-Search，阅读功能、使用流程与常见问题，能够区分空间数据工作与本机内容检索 |
| 产品页内浏览       | 通过章节导航访问功能、流程、FAQ 和下载区域，检查锚点位置与键盘焦点可见性                                   |
| 中英文切换         | 在产品页和章节位置切换语言，保留当前产品及可匹配的章节锚点                                                 |
| 带参数的分享入口   | 检查带查询参数与章节锚点的根入口和未补尾斜杠的项目入口，发现查询参数在跳转时丢失，已纳入修复与新增回归     |
| QCopilots 下载状态 | 三个平台的下载入口均显示尚未开放，按钮不可触发，不生成空链接或虚假的下载地址                               |
| Search 获取与返回  | 打开 GitHub Releases 下载入口，确认到达当时的 v0.3.0 发布页，再后退返回原页面位置                          |
| 移动菜单与键盘     | 使用 Enter 打开菜单、Tab 遍历菜单项、Escape 关闭并返回菜单按钮，验证修复后的焦点顺序                       |
| JavaScript 不可用  | 禁用 JavaScript 后查看静态导航，实际点击并完成跨产品浏览                                                   |
| 错误地址恢复       | 打开不存在的地址，使用 404 页的 English home 入口恢复至英文首页                                            |
| 项目子路径         | 在项目部署前缀下完成首页、产品、语言、章节和下载流程，确认路由与资源路径保持前缀                           |
| 响应式完整性       | 检查中英文六个内容页面，在 320、768、1440 px 宽度下未发现页面横向溢出、空链接或已加载图片损坏              |
| 减少动态效果       | 启用减少动态效果偏好，确认页面对应样式生效                                                                 |
| 受限网络           | 在 100 KB/s、150 ms 延迟条件下加载页面，检查到的网络资源没有加载失败                                       |

测试宽度通过桌面 Chrome 模拟，不等同于真实手机的触摸、浏览器工具栏或系统辅助功能验证。上述限速结果也不代表所有网络条件下的性能保证。

## 发现的问题与修复

| 问题与用户影响                                                                                                       | 修复与回归                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 使用键盘打开移动菜单后，下一次 Tab 原先会跳过菜单内容，访客难以继续导航                                              | 打开菜单时聚焦首个菜单项，支持 Tab 遍历，Escape 关闭时将焦点返回按钮。真实 Chrome 复测，并增加菜单键盘回归                                                 |
| JavaScript 禁用时，移动菜单按钮无法展开导航，移动访客会失去主要页面入口                                              | 改为渐进增强，静态 HTML 默认提供可用导航，脚本加载后才启用折叠菜单。真实 Chrome 禁用脚本后完成跨产品跳转，并增加中英文无脚本回归                           |
| 768 px 英文产品章节导航居中时，首项可能溢出并被裁切。键盘聚焦末项时，部分焦点边缘也可能不可见                        | 使用安全居中避免首项被截断，聚焦章节时滚动到可见位置，并采用内嵌焦点样式。补充 390、768 px 导航回归并进行 Chrome 核验                                      |
| 构建与原生部署对 `BASE_PATH` 的规则不一致，可能产生能构建却无法按相同配置部署的结果，非法 XML 字符也可能影响 sitemap | 统一部署前缀校验规则，在构建入口拒绝无效值，并补充对应自动化检查                                                                                           |
| 带查询参数的分享链接经过语言首页跳转或项目路径补尾斜杠时丢失参数，章节锚点虽保留，链接上下文却不完整                 | 根入口脚本与语言切换同步保留查询参数和锚点，原生与容器 Caddy 的项目路径重定向保留查询参数，并增加 E2E 回归。最终验证以修复提交关联的 CI 与 Chrome 复测为准 |
| 初次容器 CI 的 HTTP 探测复用旧 keep-alive 连接，导致部署切换后的冒烟测试失败                                         | 修正生命周期探测的连接处理方式。后续 CI 的根路径和项目子路径容器测试均已通过                                                                               |

这些修复保持第 1 套视觉方向与产品内容结构，重点消除导航、可访问性和部署边界上的实际障碍。

## 远端提交与 CI 证据

代码已推送到 [QCopilots-Website 的 main 分支](https://github.com/xiaobing318/QCopilots-Website/tree/main)。以下记录对应已观察到的运行状态，后续提交的最终结果应查看其关联的 Actions 运行，不能将较早运行的通过状态套用到新提交。

| 提交与运行                                                                                                                                                                | 已核实的结果                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`a4db633`](https://github.com/xiaobing318/QCopilots-Website/commit/a4db633)，[CI 39929219084](https://github.com/xiaobing318/QCopilots-Website/actions/runs/39929219084) | Windows、Linux、macOS 质量与原生生命周期检查通过，根路径与项目子路径的三浏览器矩阵通过，依赖检查通过。两个容器冒烟任务失败，失败记录保留作为修复依据                          |
| [`feea5b8`](https://github.com/xiaobing318/QCopilots-Website/commit/feea5b8)，[CI 39930105120](https://github.com/xiaobing318/QCopilots-Website/actions/runs/39930105120) | 两种路径的容器冒烟测试以及其他非浏览器任务均通过。新增章节导航 E2E 暴露焦点目标未完整滚入可见区域的问题，已在 Chrome 中继续修正，等待后续提交回归，不将此次运行表述为全部通过 |

GitHub Actions 已实际执行，与首次本地交付时“仅配置、未运行”的状态不同。远端托管 runner 的通过结果不替代所有目标操作系统版本的真机验收。CI 成功与 GitHub Pages 正式发布也是不同状态，Pages 仍需仓库来源与发布配置满足要求。

## 验证边界与进程管理

- 此次 Chrome 操作在 Windows 本机执行，尚未在 Windows 10 客户端、Linux/macOS 桌面浏览器或真实手机上完成同样的人工流程。
- 当前 Chrome CDP 入口不支持本次拟用的存储阻断脚本注入方式，因此不宣称已经验证禁用存储场景。
- 未完成真实浏览器缩放和屏幕阅读器操作验证，不能用响应式宽度模拟或自动化可访问性检查替代。
- GitHub 托管 runner 已覆盖跨平台构建及部署自动化，系统服务在目标设备上的安装、重启与开机自启仍需独立验收。
- 本次浏览使用独立的临时 Caddy 实例。结束时仅关闭本次启动的测试服务与浏览器会话，最终清理状态随交付报告提供。

## English summary

The website was committed and pushed to `main`, and GitHub Actions were run. A real Chrome session exercised both root and project-subpath deployments, covering product discovery, product sections, FAQs, language switching with route and section preservation, accurate download states, the Search release page and browser back navigation, 404 recovery, keyboard navigation, disabled JavaScript, responsive widths, reduced motion and constrained network loading.

The audit found and addressed mobile-menu keyboard focus, unavailable navigation without JavaScript, clipped English section navigation at intermediate widths, inconsistent deployment-prefix validation, and lost query parameters on shared entry links. Query strings and section fragments are preserved through language selection and deployment-prefix redirects by the follow-up changes. A container smoke-test failure caused by reusing an old keep-alive connection was also fixed. Both container paths and the other non-browser jobs passed in the second CI run, while new section-navigation E2E coverage exposed an additional focus-scrolling issue. Further corrections were made in Chrome and require the subsequent commit's regression results. The complete status of newer changes must be read from their associated Actions run, rather than inferred from earlier successful jobs.

Screenshots and operation evidence accompany the delivery report. This record does not claim real-phone, screen-reader, browser-zoom, blocked-storage, Windows 10 client, Linux/macOS desktop, or OS-service reboot acceptance. Temporary test-process cleanup is reported with the final handoff.
