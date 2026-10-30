# QCopilots 官网

[English](README.en.md) · [内容维护](docs/maintenance.zh.md) · [开发与部署](docs/deployment.zh.md) · [设计参考](design-qa.md) · [素材记录](docs/assets.md)

QCopilots 系列产品的中英文官网，目前介绍两款产品：

- **QCopilots**：内置于 QGIS 的 AI 助手，用日常语言完成地图工作。即将推出。
- **QCopilots Search**：按意思搜索本机文档、照片、录音和视频的桌面应用。已发布。

线上地址：<https://xiaobing318.github.io/QCopilots-Website/>

网站用 Astro 构建，产出纯静态文件，可以放在 GitHub Pages、Caddy 或任何静态文件服务器上。字体和图标随站点一起发布，不依赖外部 CDN，在国内网络下也能正常加载。

## 快速开始

只需要 Git 和网络，不必事先安装 Node。首次运行时，脚本会把固定版本的 Node 24.22.1 下载到仓库内的 `.tools/` 目录，不改动系统里已有的 Node，也不修改 PATH。

**Windows 10 / 11**：在资源管理器中双击 `scripts/site.cmd` 即可完成准备并打开预览。也可以在仓库目录的 cmd 或 PowerShell 中运行：

```powershell
.\scripts\site.cmd setup
.\scripts\site.cmd dev
```

**Linux / macOS**：

```bash
bash scripts/site.sh setup
bash scripts/site.sh dev
```

`setup` 准备 Node 并安装依赖，每台电脑运行一次即可。`dev` 启动本机预览，在浏览器打开 <http://127.0.0.1:4321/>。修改文件后页面会自动刷新，按 `Ctrl+C` 停止。

> Windows 上不要用 Git Bash 运行 `bash scripts/site.sh`，它只支持 Linux 和 macOS。请改用 cmd 或 PowerShell。原因和替代办法见[开发与部署](docs/deployment.zh.md#windows-上的几种终端)。

## 常用命令

下表中的 `site` 代表：Windows 上的 `.\scripts\site.cmd`，Linux / macOS 上的 `bash scripts/site.sh`。

| 命令                                | 作用                                       |
| ----------------------------------- | ------------------------------------------ |
| `site setup`                        | 准备 Node 并安装依赖                       |
| `site doctor`                       | 显示 Node 版本、端口和部署状态，排查问题用 |
| `site dev`                          | 本机预览，改动即时刷新                     |
| `site check`                        | 类型检查和内容检查（双语结构、颜色对比等） |
| `site build`                        | 生成静态网站到 `dist/`                     |
| `site run test:built`               | 检查 `dist/` 里的页面、链接和资源          |
| `site browsers chromium`            | 安装浏览器测试需要的 Chromium，只需一次    |
| `site run test:e2e`                 | 浏览器与无障碍测试，需先 `build`           |
| `site run lint` / `site run format` | 代码检查 / 自动整理格式                    |
| `site run render:og`                | 重新生成社交分享预览图                     |
| `site package`                      | 把 `dist/` 打包成可搬迁的归档              |
| `site deploy native`                | 用 Caddy 部署到本机                        |
| `site deploy compose`               | 用 Docker Compose 部署到 Linux             |

运行 `site help` 可以看到全部命令。

## 项目结构

```text
src/content/           文案与产品数据，日常维护主要改这里
  products/<id>.ts     每个产品一个文件，包含中英文内容
  products.ts          产品注册表
  ui.ts                导航、首页、合作方式等公共文案
  site.ts              公司名称、版权年份和联系邮箱
src/assets/real-runs/  产品页“一次真实运行”的截图，规则见其中的 README
src/components/        页面组件，demos/ 是产品界面示意
src/styles/            tokens.css（颜色、字号、间距）和 base.css
public/images/         产品图标和分享预览图
public/licenses/       字体与图标的许可文本
scripts/               一键脚本、检查、打包和部署
docs/                  维护、部署、素材等文档
```

中文页面以 `/zh/` 开头，英文页面以 `/en/` 开头。根地址会按访客的语言偏好跳转，默认中文。

## 修改文案

- 产品文案在 `src/content/products/<id>.ts`，公共文案在 `src/content/ui.ts`。
- 中文 `zh` 和英文 `en` 必须一一对应，条目数量和字段都要相同。
- 英文文案里不能出现中文字符或全角标点。
- 文案写给普通用户，不写网址、端口、密钥和本地路径这类技术细节。
- 联系邮箱和公司名称只在 `src/content/site.ts` 中修改。
- 改完运行 `site check`。修改了首页大标题，还要运行 `site run render:og` 更新分享图。

详细规则见[内容维护](docs/maintenance.zh.md)。

## 添加新产品

1. 复制 `src/content/products/qcopilots-search.ts`，改名为 `src/content/products/<新 id>.ts`，填写中英文内容。
2. 在 `src/content/products.ts` 中导入它，并加入 `products` 列表。
3. 把产品图标放进 `public/images/`。
4. 运行检查。

页面路由、导航、首页卡片、站点地图和测试都会自动包含新产品。完整步骤见[内容维护](docs/maintenance.zh.md#添加新产品)。

## 发布

推送到 `main` 分支即可。GitHub Actions 会在 Windows、Linux、macOS 上运行全部检查，通过后自动发布到 GitHub Pages，再像真实访客一样逐页访问线上网站。

需要暂停自动发布时，把仓库变量 `PAGES_ENABLED` 设为 `false`。在自己的服务器上部署，见[开发与部署](docs/deployment.zh.md)。

## 文档

| 文档                                     | 内容                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| [内容维护](docs/maintenance.zh.md)       | 内容模型、联系方式、加产品、界面示意、真实截图、发布前检查 |
| [开发与部署](docs/deployment.zh.md)      | GitHub Pages、本机 Caddy、容器、开机服务                   |
| [设计参考](design-qa.md)                 | 颜色、字体、间距、组件和视觉检查清单                       |
| [素材记录](docs/assets.md)               | 图标、字体、分享图、地图数据和真实截图的来源与授权         |
| [产品事实来源](docs/product-evidence.md) | 网站文案所依据的产品资料和真实运行记录                     |
| [验证记录](docs/verification.md)         | 历次验证的范围与结果                                       |

## 授权

产品图标、字体和界面图标的来源与许可见[素材记录](docs/assets.md)，网站上的[许可页面](https://xiaobing318.github.io/QCopilots-Website/zh/licenses/)也列出了全部许可文本。本仓库没有为产品或第三方素材另设统一许可证，各自以原始来源为准。
