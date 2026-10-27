# 产品事实记录 / Product evidence

本记录用于维护官网文案，最近一次核查日期为 **2026-10-26**。它记录源码与发布资料所支持的能力，不代表本次运行了产品或验证了全部设备。官网构建不读取这些仓库。

This record supports website copy maintenance and was last reviewed on **2026-10-26**. Source evidence is not a claim that the products or every supported device were executed. Website builds never read these repositories.

## 版本锚点 / Revision anchors

| 产品             | 来源                                                                            | 审查版本                                                 |
| ---------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| QCopilots        | QGIS fork，`feature/final-4_2_0-qcopilots`                                      | `1400035ddd394f5e4c8daf43609be8bc1f28becd`               |
| QCopilots Search | [xiaobing318/QCopilots-Search](https://github.com/xiaobing318/QCopilots-Search) | `625ec5d3f446484c51c29e50e952a006c75356f3`，v0.3.0       |
| Search 公开发布  | [v0.3.0](https://github.com/xiaobing318/QCopilots-Search/releases/tag/v0.3.0)   | 网站下载使用 `/releases/latest`，2026-10-26 已确认可访问 |

核查不读取参考仓库中的 `AGENTS.md` 和 `.codex` 文件。官网写作 “QCopilots Search”（含空格），与应用窗口标题一致。仓库名和网址仍为 `qcopilots-search`。

## QCopilots

路径相对于 QGIS 源码仓库。

| 官网内容 / Website claim                       | 证据 / Source evidence                                                                                                                              | 边界 / Boundary                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 内置于 QGIS 的对话面板，默认停靠在右侧         | `src/plugins/qcopilots/qcopilots_container_plugin.cpp:153`、`qcopilots_container_dock.cpp`                                                          | 面板嵌入已配置的 Web UI                                                              |
| 默认连接本机 llama.cpp Web UI `127.0.0.1:8282` | `src/plugins/qcopilots/qcopilots_container_utils.cpp:110`、`web/qcopilots_mcp_bootstrap.js:50`、`qcopilots_container_dock.cpp:696,699`              | 地址可改为其他服务，此时对话会发送到该服务。插件本身不启动 llama-server              |
| 82 项工具，分布在 7 个工具服务                 | `tests/src/python/test_qcopilots_mcp_tool_inventory.py`（`EXPECTED_COUNTS` 9+5+33+6+6+17+6）                                                        | 数字随开发版本变化，官网注明来自当前开发版本                                         |
| 750+ 个处理算法                                | `python/plugins/qcopilots_mcp_server_skills/Skills/qgis-skills-creator/references/qgis-tools.catalog.json:21,25`（实时会话 772，命令行快照 761）    | 可用算法取决于用户的 QGIS 安装                                                       |
| 87 个命令行程序                                | `python/plugins/qcopilots_mcp_server_qgis_binary/qgis_binaries.json`（591 个中启用 87 个）                                                          | 包含 GDAL、PROJ、PDAL、HDF5、LASzip、qgis_process 等，不只 GDAL / PROJ / PDAL        |
| 工具服务只在本机监听，需要私有访问密钥         | `qcopilots_common/constants.py:20`、`mcp_http.py:917-922,1940`、`qcopilots_manager_config.json`、`qcopilots_mcp_servers_manager/plugin.py:914,1783` | 各服务共用一个访问令牌，官网不写“各自独立的密钥”                                     |
| 编辑先暂存，由用户保存                         | `qcopilots_common/bridge.py:3007-3047`（`requires_user_commit`）                                                                                    | 移除图层时若用户确认“保存”，会提交编辑                                               |
| 移除图层、替换输出要先预览，再单独确认         | `interactive_layer_tools.py:67-108,542`、`processing_tools.py:270-278`、`qgis_binary_tools.py:94,297`                                               | 确认是 AI 携带一次性令牌发起的第二次调用，不是给用户的弹窗。官网不写“先征得你的同意” |
| 处理任务在后台运行，结果默认加入项目           | `processing_jobs.py:1297`（`QgsProcessingAlgRunnerTask`）、`processing_tools.py:272`                                                                |                                                                                      |
| 打印布局与导出 PDF / PNG / JPEG / SVG          | `interactive_layer_tools.py` 的 `create_print_layout`、`export_print_layout`                                                                        | 受限的单页布局，含标题、地图、图例和比例尺                                           |
| 应用已保存的样式、添加标注                     | `interactive_layer_tools.py` 的 `apply_layer_style`、标注工具                                                                                       | 只应用已有 QML / SLD 文件，不是任意样式编辑器                                        |
| Windows 10 / 11 x64                            | `python/plugins/qcopilots_mcp_servers_manager/README.md:16`、命令行目录的 `profile_id`（OSGeo4W 布局）                                              | 尚未提供下载地址，官网条目为 `url: null`                                             |

其他边界：内置文件工具可以写入、编辑文件并运行命令（`qcopilots_mcp_server_builtin_tools`），官网 FAQ 因此建议在有备份的数据上使用。QCopilots 面板就是 llama.cpp Web UI，插件界面文字为英文，官网不声称它有中文界面。用户需要自己启动 llama-server。添加的图层默认位于最上层，没有调整图层顺序的工具（`bridge.py:1297`），官网不写“在图层下方”。打印布局使用数字比例尺（`bridge.py:1773`）。

## QCopilots Search

路径相对于 Search 源码仓库。

| 官网内容 / Website claim                                                    | 证据 / Source evidence                                                                                              | 边界 / Boundary                                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本 0.3.0，MIT 许可                                                        | `CMakeLists.txt:2`、`LICENSE`                                                                                       | 下载入口使用 latest 发布页                                                                                                                  |
| 8 种文档格式，19 种相机 RAW 与 HEIC，约 90 种代码文件和 Jupyter 笔记本      | `src/core/file_formats.h`                                                                                           | 不支持 XLSX、PPTX                                                                                                                           |
| 文字识别：英文、简体中文、繁体中文                                          | `src/core/pipeline_manifest.h:37`                                                                                   |                                                                                                                                             |
| 音频按 30 秒窗口匹配声音，不转写文字                                        | `src/core/pipeline_manifest.h:52,58,59`、`docs/dependencies.md`                                                     | 窗口每 25 秒滑动，视频每 3 秒取帧                                                                                                           |
| 中英文示例查询                                                              | `tests/semantic/semantic_acceptance.cpp:212-236`                                                                    | 测试证明能找到正确文件与位置，不证明排名第一                                                                                                |
| 预览直达命中的段落、页面或时刻                                              | `src/app/preview_panel.cpp`、`src/app/main_window.cpp`                                                              | 系统默认程序只打开文件。SumatraPDF、Skim、Okular、mpv 可按页面或时间打开（`platform_external_open.cpp:134-138`、`settings_dialog.cpp:101`） |
| 快速搜索 Ctrl+Shift+Space                                                   | `src/app/platform_integration.cpp`（Windows `RegisterHotKey`，macOS `controlKey`）、`linux_global_shortcut.cpp:251` | macOS 上同样是 Control 键                                                                                                                   |
| 模型一次性下载，不到 1 GB，可离线导入                                       | `config/qcs-models.lock.json`（约 825 MiB）                                                                         | 模型不包含在安装包内                                                                                                                        |
| 无模型时可用关键词搜索。移出索引不删除文件                                  | `README.md`                                                                                                         |                                                                                                                                             |
| 版本更新检查可以关闭                                                        | `src/app/settings_dialog.cpp:305`、`src/app/app_settings.h:27`                                                      | 默认开启                                                                                                                                    |
| 平台：Windows 10 1809+ x64，macOS 14.4+ Apple 芯片，Linux x64 Ubuntu 22.04+ | `docs/dependencies.md:34-44`、`CMakeLists.txt:35`、`config/build-variants.json`                                     | NVIDIA / AMD 构建需要 Ubuntu 24.04。AMD 只支持较新的显卡。所有构建都能用 CPU 运行                                                           |
| macOS 版本未经公证                                                          | `docs/releasing.md:41`                                                                                              | FAQ 给出“仍要打开”的步骤                                                                                                                    |

## 文案边界 / Editorial boundaries

- 不承诺 AI 结果总是正确，用“检查结果”“由你决定”这类表述。
- 不使用虚构的用户数量、评价、速度数字、认证或服务等级。Search 不发布速度数据。
- 界面图是用代码绘制的示意，标注“界面示意 / Illustrative preview”，不当作真实截图。
- 不把桌面产品的平台与网站的开发、构建、托管平台混为一谈。
- 产品能力变化时，先更新本记录的版本锚点和证据，再同步修改中英文文案。

## 设计参考 / Design references

- [Anthropic 产品介绍](https://claude.com/product/overview)：暖色编辑风格、衬线标题、克制的动效。
- [OpenAI 产品介绍](https://chatgpt.com/overview/)：用代码实现的产品界面演示。
- [Astro 文档](https://docs.astro.build/) 与 [GitHub Pages 发布配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

网站使用独立品牌、原创文字与原创界面示意，没有复制参考页面的文案、素材或源码。
