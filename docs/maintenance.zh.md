# 内容与工程维护

[English](maintenance.en.md) · [返回 README](../README.md)

## 修改产品与翻译

`src/content/products.ts` 是产品信息的唯一维护入口。每个产品的 `locales.zh` 和 `locales.en` 分别保存名称、标语、介绍、能力、步骤、使用场景、FAQ 和 SEO 文案。`src/content/ui.ts` 保存导航、首页和公共文案。

产品的 `homeHeadline` 为首页展示标题的两段文字，第二段使用强调色。`homeDescription` 是首页使用的简短介绍，产品详情仍使用 `tagline` 和 `description`。首页收尾标题的 `ui.home.closingParts` 依次是前缀、强调品牌名和标点，需与 `closingTitle` 的完整文字保持一致。修改时同步更新两种语言，并检查窄屏和英文较长单词的换行。

修改一项产品事实时，同时更新两种语言和[产品事实来源](product-evidence.md)。保持同一条目的顺序和含义一致，英文按自然表达重写，不机械逐字翻译。`name` 是展示名称，`id` 是稳定的路由标识，不要为了调整名称随意修改 `id`。

中文默认路由为 `/zh/`，英文为 `/en/`。两种语言生成独立 HTML。明确访问英文链接时保持英文，语言偏好仅用于根入口和访客主动切换。跨语言切换使用相同产品标识与稳定章节 ID，修改章节时检查对应关系。

## 开放或更新下载

产品的 `downloads` 数组包含平台、双语标签、URL，以及可选的系统要求、版本、架构和校验值。

```ts
{
  id: 'qcopilots-windows',
  platform: 'windows',
  label: { zh: 'Windows', en: 'Windows' },
  url: null,
}
```

把 `url: null` 替换为经过确认的 HTTPS 发布地址即可开放入口。仅在对应发行包说明有依据时填写 `requirements`、`architecture`、`version` 或 `checksum`。下载为空时页面显示状态文字，不生成空链接或 `#`。

QCopilots 安装包由产品维护者提供，现阶段网站仅等待补充链接。不要用上游 QGIS 下载页代替定制包，也不要把 QGIS 的平台列表推导为定制包的兼容保证。QCopilots-Search 当前统一进入其最新 GitHub Releases 页，避免网站拼接已过期的资产文件名。

## 添加第三款产品

1. 为 `ProductId` 增加稳定的小写标识，例如 `qcopilots-example`。
2. 在 `products` 中添加一条满足 `Product` 类型的记录，补齐中英文内容、下载状态、图片替代文字及模型或数据处理说明。
3. 将产品图标与展示图放入 `public/images/`，路径以 `/images/` 开始，在[素材记录](assets.md)中登记来源。
4. 如需首页推荐场景，在 `ui` 的两种语言中同步添加或替换场景。检查导航与首页是否仍适合当前产品数量。
5. 执行内容检查、双路径构建和浏览器检查，再核对新产品的两种语言 URL、下载区和 SEO。

共享产品页根据注册表生成，不必复制整套页面。新增不同结构的产品能力时再扩展类型与组件，避免只在某种语言或某个产品页中硬编码内容。

## 替换展示素材

产品图标保留原始比例。展示图优先使用 WebP，按页面实际尺寸导出，并提供准确的替代文字。避免把按钮、标题或主要信息只放进图片。正式页面的导航和交互继续由 HTML 提供。

当前展示视觉是原创示意，不是真实运行截图，页面保留“界面示意 / Illustrative preview”标签。替换成实机截图时记录产品版本、拍摄来源和公开权限，确认截图没有私人文件或连接凭据，再修改对应说明。不要把 AI 生成的窗口称为实机截图。

所选视觉参考保存在 `docs/design/selected-homepage.png`。它用于方向对照，实际网页需同时满足响应式、键盘操作和真实内容可读性。QA 记录应说明明显差异及原因，不仅记录截图存在。

## 更新运行环境与依赖

Node 和 npm 版本在 `.node-version`、`package.json`、初始化工具锁与 GitHub Actions 之间保持一致。Caddy 的版本、平台资产和校验值也集中锁定。更新固定工具时核实官方发布源、各平台归档及校验值，再运行三平台 CI。

应用依赖使用固定版本，并提交 `package-lock.json`。常规安装使用 `npm ci`，升级依赖才重新生成锁文件。不要用修改 `node_modules/` 的方式修复构建。字体和图标升级同步检查授权与视觉变化。

## 验证与发布

日常入口：

```bash
bash scripts/site.sh check
bash scripts/site.sh build
```

Windows 使用 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1` 替代 Bash 入口。需要直接运行 npm 测试命令时，终端必须使用固定版本 Node/npm，或将仓库便携 Node 目录加入该终端的临时 PATH，不能假定初始化改变了全局环境。

| 检查                     | 对应 npm 命令或工作流                    |
| ------------------------ | ---------------------------------------- |
| Astro 类型、内容字段     | `npm run check`                          |
| 代码与格式               | `npm run lint`、`npm run format:check`   |
| 单元测试                 | `npm test`                               |
| 构建后的链接、资源和 SEO | `npm run test:built`，在正式构建之后执行 |
| 浏览器与无障碍           | `npm run test:e2e`                       |
| 原生生命周期             | `npm run test:native`                    |
| Linux 容器               | `npm run test:container`                 |
| 依赖漏洞                 | `npm audit --audit-level=high`           |

浏览器依赖通过 `npx playwright install` 单独安装，Linux CI 使用 `npx playwright install --with-deps`。一般内容编辑不需要在 Windows 10 上强制安装所有浏览器测试依赖。

`.github/workflows/ci.yml` 负责 Windows、Linux、macOS 的质量检查、原生生命周期和归档，Linux 上覆盖三种浏览器、根路径与项目子路径及容器部署。`dependency-audit.yml` 提供周期性依赖检查。失败时查看 Actions 报告、失败截图和日志，而不是重复修改锁文件。

推送到 `main` 且检查全部通过后 Pages 会自动发布，除非仓库变量 `PAGES_ENABLED` 为 `false`。也可在主分支手动触发并选择发布。发布任务依据 Pages 返回的真实域名与路径重新构建和验证。部署完成后 `npm run test:live` 会像真实用户一样访问线上站点。Pull request 不获得发布权限。

自动化验证与真机验证分开记录。普通 hosted runner 不证明 Windows 10 / 11 客户端、所有 Linux 发行版、GPU 或每款 Mac 都已通过测试。服务注册和重启后自启行为需目标机器或专用虚拟机验收。产品运行能力也不能仅凭官网构建测试认定通过。

## 发布前检查内容

- 中英文的能力、下载状态与系统要求一致，修改后的事实有来源记录。
- 两款产品都能从首页到达，语言切换保持产品位置。
- 正式域名、部署前缀、站内链接和资源路径一致。
- QCopilots 空下载项没有假链接，Search 的发布地址可以访问。
- 移动端、键盘焦点、FAQ、减少动态效果偏好和图片说明正常。
- 测试用原生实例与临时容器已停止，正式实例仅在明确部署时保持运行。
