# 产品事实记录 / Product evidence

本记录用于维护官网文案，核查日期为 **2026-10-23**。它记录代码与发布资料所支持的能力，不代表本次运行了产品或验证了全部设备。官网不依赖这些仓库进行构建。

This record supports website content maintenance, reviewed on **2026-10-23**. Source evidence is not a claim that the products or every supported device were executed during website development. Website builds do not read these repositories.

## 版本锚点 / Revision anchors

| 产品             | 来源                                                                            | 审查版本                                             |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| QCopilots        | QGIS fork，`feature/final-4_2_0-qcopilots`                                      | `1400035ddd394f5e4c8daf43609be8bc1f28becd`           |
| QCopilots-Search | [xiaobing318/QCopilots-Search](https://github.com/xiaobing318/QCopilots-Search) | `625ec5d3f446484c51c29e50e952a006c75356f3`           |
| Search 公开发布  | [v0.3.0](https://github.com/xiaobing318/QCopilots-Search/releases/tag/v0.3.0)   | 2026-10-17 发布，后续网站下载使用 `/releases/latest` |

以上来源不包含参考仓库的 `AGENTS.md` 或 `.codex` 文件。版本号不会作为官网“当前最新版”硬编码，下载入口由产品发布页提供最新信息。

## QCopilots

所有下列路径相对于 QGIS 源码仓库。QCopilotsCommon 是多个 Python 插件的共享实现，本轮已纳入能力核查。

| 官网内容 / Website claim   | 实现证据 / Source evidence                                                                                                                                                                                | 边界 / Boundary                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 在 QGIS 中通过对话推进工作 | `src/plugins/qcopilots/qcopilots_container_dock.cpp`、`qcopilots_mcp_bridge.cpp`                                                                                                                          | 容器连接配置的 Web UI 和工具，不保证任意模型供应商兼容                     |
| 查看图层、属性和空间范围   | `python/plugins/qcopilots_common/interactive_layer_tools.py` 的 `list_map_layers`、`get_layer_metadata`、`query_vector_features`，具体实现于 `bridge.py`                                                  | 查询有分页与范围边界，不宣传无限读取                                       |
| 矢量、栅格、通用处理       | `python/plugins/qcopilots_mcp_server_processing_vector/server.py`、`qcopilots_mcp_server_processing_raster/server.py`、`qcopilots_mcp_server_processing_general/server.py` 调用共享 `processing_tools.py` | `processing_metadata.py` 定义算法支持范围，不声称所有 QGIS 算法均可调用    |
| 应用样式与调整地图视图     | `interactive_layer_tools.py` 的 `apply_layer_style`，`processing_tools.py` 的 `zoom_to_layer`、`zoom_to_extent`                                                                                           | 样式工具应用已有本地 QML / SLD 文件，不是通用任意样式编辑器                |
| 创建并导出地图布局         | `interactive_layer_tools.py` 的 `create_print_layout`、`list_print_layouts`、`export_print_layout`，`bridge.py` 对应实现                                                                                  | 当前为带标题、地图及可选图例和比例尺的受限单页布局，不宣传任意已有布局编辑 |
| 地图图像导出               | `processing_tools.py` 的 `export_map_image`                                                                                                                                                               | 输出需结合数据、坐标系和分析条件检查                                       |
| 本地或在线模型的数据边界   | `qcopilots_container_utils.cpp` 与 `qcopilots_container_dock.cpp` 支持配置 HTTP / HTTPS 地址，MCP bridge 提供工具响应                                                                                     | 数据流向取决于前端、所接模型服务及操作，不能宣称“永不上云”                 |

用户已明确说明存在 QCopilots 安装包，但尚未提供网站下载 URL。因此三个主要平台条目使用 `null`，不虚构安装文件、最低系统版本、架构、体积、校验和或发行通道。平台分类参考 [QGIS 官方下载页](https://qgis.org/download/)，不以其作为定制包兼容保证。

The maintainer confirmed QCopilots packages exist but has not yet supplied website URLs. Platform entries therefore remain `null`. Upstream QGIS platform categories are not a compatibility guarantee for these custom packages.

## QCopilots-Search

所有下列路径相对于 Search 源码仓库。功能对应 v0.3.0，审查 HEAD 与该发布之间的改动为 README 内容。

| 官网内容 / Website claim        | 实现证据 / Source evidence                                                     | 边界 / Boundary                                            |
| ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 关键词与语义检索                | `README.md`、`docs/architecture.md`                                            | 本地内容检索，不是互联网搜索、生成式问答或会议纪要工具     |
| 文档、PDF、图片、音频、视频     | `docs/dependencies.md` 的格式表                                                | 格式、文件大小、解码器及分片数量有各自限制，不声称任意格式 |
| 选择目录与排除范围              | `src/app/settings_dialog.cpp`、`docs/configuration.md`                         | 用户先选择搜索根目录并建立索引                             |
| 匹配位置预览与筛选              | `src/app/preview_panel.cpp`、`src/app/main_window.cpp`、`docs/architecture.md` | 应用内定位与外部查看器行为不同，不保证所有外部软件准确跳转 |
| 本机提取、索引、语义推理        | `README.md`、`docs/architecture.md`                                            | 模型下载与版本检查联网，不声称应用绝不联网                 |
| 无语义模型可关键词搜索          | `README.md`、`docs/configuration.md`                                           | 限于文件名和已提取正文，语义能力需要模型                   |
| EmbeddingGemma 2 下载或离线导入 | `config/qcs-models.lock.json`、`docs/dependencies.md`                          | 模型权重不在安装包内，不支持任意同名模型替换               |
| 可关闭自动检查更新              | `src/app/settings_dialog.cpp` 的 `checkUpdates`                                | 默认自动检查不等于完全离线运行                             |

### 平台发布基线 / Release baselines

来源是 `docs/dependencies.md` 与 `config/build-variants.json`。

| 平台        | 发行基线                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| Windows x64 | Windows 10 1809 与 Windows 11，GPU 变体另有驱动及硬件要求                |
| Linux x64   | CPU / Vulkan 以 Ubuntu 22.04 为基线，部分 GPU 变体以 Ubuntu 24.04 为基线 |
| macOS arm64 | Apple Silicon，macOS 14.4 或更高版本                                     |

这些是发行配置和依赖基线，不能据此声称所有设备已经真机验证。macOS 入口不暗示 Intel Mac 支持。首页不展开所有 GPU 变体，用户前往真实发布页选择合适的安装文件。

These are release and dependency baselines, not proof of testing every machine. The macOS entry does not imply Intel Mac support. The release page remains the source of package-specific hardware and driver information.

## 文案校准 / Editorial boundaries

- 使用“查看、检查、继续探索”，不承诺 AI 结果始终正确。
- 不使用虚构的用户数量、客户评价、速度数字、认证或服务等级。
- 不把产品示意图当作实际运行截图。
- 不把桌面产品平台与网站开发、构建、托管平台混为一谈。
- 新增产品能力时更新本记录的提交锚点和证据，再更新中英文文案。

## 设计与技术参考 / Design and technical references

- [OpenAI 产品介绍](https://chatgpt.com/overview/)：清晰的价值表达、留白和产品展示节奏。
- [Anthropic 产品介绍](https://claude.com/product/overview)：任务叙事与编辑式排版。
- [Astro 文档](https://docs.astro.build/)：静态生成、路由与部署。
- [GitHub Pages 发布配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)：Actions 发布来源与设置。

网站采用独立品牌、原创文字和原创展示图，没有复制参考页面的文案或页面源码。
