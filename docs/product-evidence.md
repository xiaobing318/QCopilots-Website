# 产品事实记录 / Product evidence

本记录用于维护官网文案，最近一次核查日期为 **2026-10-29**。源码证据记录源码与发布资料所支持的能力，本身不代表运行过产品。此外，两款产品各做过一次真实运行，结果写在各自的“真实运行记录”中。真实运行只证明那一次的结果，不代表验证了全部设备。官网构建不读取这些仓库。

This record supports website copy maintenance and was last reviewed on **2026-10-29**. Source evidence on its own is not a claim that the products were executed. Each product has also had one real run, recorded under its own “real run” heading. A real run proves that run only, not every supported device. Website builds never read these repositories.

## 版本锚点 / Revision anchors

| 产品             | 来源                                                                            | 审查版本                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| QCopilots        | QGIS fork，`feature/final-4_2_0-qcopilots`                                      | `dffa89d4a25fc3f5ec9614a02a7ac0a633cfaa22`                                                                   |
| QCopilots 发布包 | 由上述提交打包                                                                  | `QGIS40200-RelWithDebInfo-2026-10-27-19-39`，真实运行时以 `launch4Release` 阶段启动                          |
| QCopilots Search | [xiaobing318/QCopilots-Search](https://github.com/xiaobing318/QCopilots-Search) | `625ec5d3f446484c51c29e50e952a006c75356f3`，v0.3.0                                                           |
| Search 公开发布  | [v0.3.0](https://github.com/xiaobing318/QCopilots-Search/releases/tag/v0.3.0)   | 网站下载使用 `/releases/latest`，2026-10-26 已确认可访问。真实运行使用其中的 `qcs-0.3.0-windows-x64-cpu.zip` |

QCopilots 的锚点从 `1400035ddd3` 更新为 `dffa89d4a25`。两者之间只有一个提交，改动了命令行程序目录 `qgis_binaries.json` 和测试，下表引用的其他文件和行号没有变化。命令行程序仍是 591 个中启用 87 个。

核查不读取参考仓库中的 `AGENTS.md` 和 `.codex` 文件。官网写作 “QCopilots Search”（含空格），与应用窗口标题一致。仓库名和网址仍为 `qcopilots-search`。

## QCopilots

路径相对于 QGIS 源码仓库。

| 官网内容 / Website claim                                                                       | 证据 / Source evidence                                                                                                                                                                                                                    | 边界 / Boundary                                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 内置于 QGIS 的对话面板，默认停靠在右侧                                                         | `src/plugins/qcopilots/qcopilots_container_plugin.cpp:153`、`qcopilots_container_dock.cpp`                                                                                                                                                | 面板显示所配置网址提供的网页对话界面                                                                                                                          |
| 模型可以运行在这台电脑、服务器或工作站上，在“QCopilots”菜单中选择“Configure QCopilots URL”连接 | `src/plugins/qcopilots/qcopilots_container_plugin.cpp:58-78`（菜单和工具栏中的 “Configure QCopilots URL” 动作，菜单在 `:183` 创建）、`:212-235`（填写网址的对话框）、`qcopilots_container_utils.cpp:113-130`（只接受 http 和 https 网址） | 网址可以指向本机或远程服务，对话会发送到这个网址。插件本身不启动模型服务。官网不写默认地址、端口和模型引擎名称                                                |
| 82 项工具，分布在 7 个工具服务                                                                 | `tests/src/python/test_qcopilots_mcp_tool_inventory.py`（`EXPECTED_COUNTS` 9+5+33+6+6+17+6）                                                                                                                                              | 数字随开发版本变化，官网注明来自当前开发版本                                                                                                                  |
| 750+ 个处理算法                                                                                | `python/plugins/qcopilots_mcp_server_skills/Skills/qgis-skills-creator/references/qgis-tools.catalog.json:21,25`（实时会话 772，命令行快照 761）                                                                                          | 可用算法取决于用户的 QGIS 安装                                                                                                                                |
| 87 个命令行程序                                                                                | `python/plugins/qcopilots_mcp_server_qgis_binary/qgis_binaries.json`（591 个中启用 87 个）                                                                                                                                                | 包含 GDAL、PROJ、PDAL、HDF5、LASzip、qgis_process 等，不只 GDAL / PROJ / PDAL                                                                                 |
| 地图工具在你的 QGIS 里运行，不向网络开放                                                       | `qcopilots_common/constants.py:20`（`DEFAULT_HOST = "127.0.0.1"`）、`mcp_http.py:917-922,1940`、`qcopilots_manager_config.json`、`qcopilots_mcp_servers_manager/plugin.py:914,1783`                                                       | 工具服务只监听本机回环地址，并校验各服务共用的访问令牌。官网只写“不向网络开放”，不写地址、端口和令牌                                                          |
| 编辑先暂存，由用户保存                                                                         | `qcopilots_common/bridge.py:3007-3047`（`requires_user_commit`）                                                                                                                                                                          | 移除图层时若用户确认“保存”，会提交编辑                                                                                                                        |
| 移除图层、替换输出要先预览，再单独确认                                                         | `interactive_layer_tools.py:67-108,542`、`processing_tools.py:270-278`、`qgis_binary_tools.py:94,297`                                                                                                                                     | 确认是 AI 携带一次性令牌发起的第二次调用，不是给用户的弹窗。官网不写“先征得你的同意”                                                                          |
| 处理任务在后台运行，结果默认加入项目                                                           | `processing_jobs.py:1297`（`QgsProcessingAlgRunnerTask`）、`processing_tools.py:272`                                                                                                                                                      |                                                                                                                                                               |
| 打印布局，4 种导出格式：PDF、PNG、JPEG、SVG                                                    | `qcopilots_common/interactive_layer_tools.py:533-550`（`_export_print_layout_schema`，格式为 pdf、png、jpeg、jpg、svg）、`bridge.py:4433-4450`（`_layout_export_target` 按扩展名判断格式）、`create_print_layout`                         | 受限的单页布局，含标题、地图、图例和比例尺。jpg 与 jpeg 是同一种格式，所以官网写 4 种                                                                         |
| 应用已保存的样式、添加标注                                                                     | `interactive_layer_tools.py` 的 `apply_layer_style`、标注工具                                                                                                                                                                             | 只应用已有样式文件，不是任意样式编辑器。工具接受 QML 和 SLD，但实测中 SLD 无法加载，见[实测中发现的问题](#实测中发现的问题--issues-found-during-the-real-run) |
| Windows 10 / 11 x64                                                                            | `python/plugins/qcopilots_mcp_servers_manager/README.md:16`、命令行目录的 `profile_id`（OSGeo4W 布局）                                                                                                                                    | 尚未提供下载地址，官网条目为 `url: null`，下载区下方提供“申请试用”邮件链接                                                                                    |

其他边界：内置文件工具可以写入、编辑文件并运行命令（`qcopilots_mcp_server_builtin_tools`），官网 FAQ 因此建议在有备份的数据上使用。QCopilots 面板显示所配置网址提供的网页对话界面，目前是 llama.cpp Web UI，插件界面文字为英文，官网不声称它有中文界面，也不写引擎名称。用户需要自己部署模型服务，官网 FAQ 说明可以发邮件请我们协助。添加的图层默认位于最上层，没有调整图层顺序的工具（`bridge.py:1297`），官网不写“在图层下方”。打印布局使用数字比例尺（`bridge.py:1773`）。

### QCopilots 真实运行记录 / QCopilots real run

| 项目 / Item        | 记录 / Record                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 日期 / Recorded    | 2026-10-29                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 构建 / Build       | QCopilots 开发版：QGIS fork `feature/final-4_2_0-qcopilots`，提交 `dffa89d4a25`                                                                                                                                                                                                                                                                                                                                                                               |
| 发布包 / Package   | `QGIS40200-RelWithDebInfo-2026-10-27-19-39`（2026-10-27 打包），以 `launch4Release` 阶段启动，Windows 11                                                                                                                                                                                                                                                                                                                                                      |
| 模型 / Model       | 模型服务运行在同一网络中的另一台电脑上。截图中可以看到模型名称，本记录和官网都不写它的地址                                                                                                                                                                                                                                                                                                                                                                    |
| 数据 / Data        | QGIS 自带的 `world_map.gpkg`，`states_provinces` 图层，筛选 `admin = Germany`，16 个州（Natural Earth，公有领域）                                                                                                                                                                                                                                                                                                                                             |
| 输入 / Prompts     | 4 条中文输入：① 加载 C:\QCopilots-Demo\data\world_map.gpkg 中的 states_provinces，只保留 admin 为 Germany 的 16 个州，重投影到 EPSG:3035，新增 area_km2 字段计算每个州的面积（平方公里）。② 按 area_km2 分 5 级用绿色渐变着色，给每个州加名称标注，缩放到该图层。③ 做一张 A4 竖版地图，标题“德国各州面积”，带图例和比例尺，导出 PDF 和 PNG 到 C:\QCopilots-Demo\output\zh。④ 面积最大的五个州是哪些？各多少平方公里？英文页面显示它们的译文，不另加“译文”标注 |
| 导出 / Exports     | `germany_states_area.pdf` 和 `germany_states_area.png`（A4）                                                                                                                                                                                                                                                                                                                                                                                                  |
| 截图 / Screenshots | `qcopilots/1-map.png`、`2-layout.png`、`3-check.png`，两种语言共用，保持原始分辨率、未做修饰，见[素材记录](assets.md#真实截图登记)                                                                                                                                                                                                                                                                                                                            |

| 轮次 / Turn | 任务 / Task                                                                            | 结果 / Result                                                                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1           | 加载 `world_map.gpkg`，筛选德国的 16 个州，重投影到 EPSG:3035，计算 `area_km2`，再自检 | 自检通过：坐标系为 EPSG:3035，16 个要素都是 `admin = Germany`，16 州合计 357,574 km²，与德国约 357,022 km² 的国土面积相差约 0.15%。随后先预览、再确认移除两个临时图层，并删除两个临时文件（`3-check.png`） |
| 2           | 按面积分 5 级绿色着色，标注州名                                                        | 等间距 5 级，范围 384.46–70,048.66 km²，级差 13,932.84 km²。模型手写 QML 完成着色。这一轮我们给了三次简短提示，见下文                                                                                      |
| 3           | 制作 A4 地图并导出                                                                     | 导出 PDF 和 PNG，PNG 即 `2-layout.png`                                                                                                                                                                     |
| 4           | 面积最大的五个州                                                                       | Bayern 70,048.66、Niedersachsen 47,559.10、Baden-Württemberg 36,106.96、Nordrhein-Westfalen 34,530.87、Brandenburg 30,022.92 km²，合计约 218,268.5 km²，占 16 州总面积的 61.0%（`1-map.png`）              |

第 2 轮中我们给出的三次提示：

1. “继续”。
2. QML 中分类的属性应写成 `symbol="0"`，不是 `symbolid="sym0"`。
3. 画布一直是空白，请把项目坐标系设为 EPSG:3035。

界面示意中的德国各州地图使用同一份数据、同一个等积投影和同样的面积算法，由 `scripts/demo-geometry.mjs` 生成。生成文件中 16 个州的面积合计 357,574 km²，Bayern 为 70,048.66 km²，与这次运行一致。示意同样按等间距分 5 级（`--mode equal`），断点与图例范围和这次运行相同。

### 实测中发现的问题 / Issues found during the real run

以下内容供产品团队参考，不写进官网文案。路径相对于 QGIS 源码仓库。

1. **SLD 样式总是加载失败。** `apply_layer_style` 接受 `.sld` 文件，但 `python/plugins/qcopilots_common/bridge.py:1599-1619` 调用的是 `layer.loadNamedStyle`，它只导入根元素为 `<qgis>` 的 QML 文档（`src/core/qgsmaplayer.cpp:1727-1736`）。`.sld` 应改用 `loadSldStyle`。
2. **输出写成 `memory` 时落进了程序目录。** 处理工具的 `OUTPUT` 填 `memory` 时，结果被写成发布包 `bin` 文件夹中的 `memory.gpkg`，因为相对路径按 QGIS 的工作目录解析。
3. **从 EPSG:3035 到 EPSG:4326 的实时重投影失败。** 项目坐标系为 EPSG:4326 时画布一片空白。日志显示 `proj_crs_get_coordoperation: Object is not a DerivedCRS or BoundCRS`，QGIS 报告退回粗略（ballpark）转换。把项目坐标系设为 EPSG:3035 后才正常显示。
4. **没有分级渲染工具。** 模型只能手写 QML 来做分级着色，这次需要提示才写对。

## QCopilots Search

路径相对于 Search 源码仓库。

| 官网内容 / Website claim                                                    | 证据 / Source evidence                                                                                              | 边界 / Boundary                                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本 0.3.0，MIT 许可                                                        | `CMakeLists.txt:2`、`LICENSE`                                                                                       | 下载入口使用 latest 发布页                                                                                                                  |
| 8 种文档格式，19 种相机 RAW 与 HEIC，约 90 种代码文件和 Jupyter 笔记本      | `src/core/file_formats.h`                                                                                           | 不支持 XLSX、PPTX                                                                                                                           |
| 文字识别：英文、简体中文、繁体中文                                          | `src/core/pipeline_manifest.h:37`                                                                                   |                                                                                                                                             |
| 音频按 30 秒窗口匹配声音，不转写文字                                        | `src/core/pipeline_manifest.h:52,58,59`、`docs/dependencies.md`                                                     | 窗口每 25 秒滑动，视频每 3 秒取帧                                                                                                           |
| 中英文示例查询                                                              | `tests/semantic/semantic_acceptance.cpp:212-236`                                                                    | 测试证明能找到正确文件与位置，不证明排名第一。下文的真实运行中 12 条查询都排第一，但只代表那组样例                                          |
| 预览直达命中的段落、页面或时刻                                              | `src/app/preview_panel.cpp`、`src/app/main_window.cpp`                                                              | 系统默认程序只打开文件。SumatraPDF、Skim、Okular、mpv 可按页面或时间打开（`platform_external_open.cpp:134-138`、`settings_dialog.cpp:101`） |
| 快速搜索 Ctrl+Shift+Space                                                   | `src/app/platform_integration.cpp`（Windows `RegisterHotKey`，macOS `controlKey`）、`linux_global_shortcut.cpp:251` | macOS 上同样是 Control 键                                                                                                                   |
| 模型一次性下载，不到 1 GB，可离线导入                                       | `config/qcs-models.lock.json`（两个文件共 864,676,480 字节，约 825 MiB）                                            | 模型不包含在安装包内                                                                                                                        |
| 无模型时可用关键词搜索。移出索引不删除文件                                  | `README.md`                                                                                                         |                                                                                                                                             |
| 版本更新检查可以关闭                                                        | `src/app/settings_dialog.cpp:305`、`src/app/app_settings.h:27`                                                      | 默认开启                                                                                                                                    |
| 平台：Windows 10 1809+ x64，macOS 14.4+ Apple 芯片，Linux x64 Ubuntu 22.04+ | `docs/dependencies.md:34-44`、`CMakeLists.txt:35`、`config/build-variants.json`                                     | NVIDIA / AMD 构建需要 Ubuntu 24.04。AMD 只支持较新的显卡。所有构建都能用 CPU 运行                                                           |
| macOS 版本未经公证                                                          | `docs/releasing.md:41`                                                                                              | FAQ 给出“仍要打开”的步骤                                                                                                                    |

### QCopilots Search 真实运行记录 / QCopilots Search real run

| 项目 / Item      | 记录 / Record                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 日期 / Date      | 2026-10-29                                                                                                                                                                                   |
| 发布文件 / Asset | v0.3.0 的 `qcs-0.3.0-windows-x64-cpu.zip`，72,162,021 字节，SHA256 `8F80CDB28D48C1515E6810835B627B4D243B70B93AEAF164A2A4B1DA61175312`，与发布页一致                                          |
| 运行方式 / Setup | 便携版，解压后直接运行。中文和英文界面各用一个独立的配置目录，互不影响，并关闭了更新检查                                                                                                     |
| 语义模型 / Model | EmbeddingGemma 2，约 825 MiB，首次使用时下载一次，校验通过                                                                                                                                   |
| 样例 / Samples   | 中文、英文样例文件夹各 13 个文件：8 个测试文件（笔记、PDF、两张告示图片、照片、两段录音、视频）和 5 个干扰文件。来源与许可见[素材记录](assets.md#真实截图登记)                               |
| 索引 / Index     | 每个文件夹 13 个文件全部建立索引，没有失败，只用 CPU，用时约 57 秒                                                                                                                           |
| 结果 / Result    | 12 条测试查询（中英文各 6 条，取自 `tests/semantic/semantic_acceptance.cpp`）全部把预期文件排在第一。中文样例里的图书馆通知（PDF 第 2 页）和种子笔记是用英文写的，中文查询同样把它们排在第一 |

| 中文查询               | English query                              | 排第一的结果 / Top result                                          |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| 图书馆开放时间通知     | A library notice about opening hours       | 社区通讯 PDF 第 2 页 / newsletter PDF, page 2                      |
| 狗叫声                 | A dog barking                              | `院子里的声音.ogg` / `Backyard sounds.ogg`，0–2.6 s                |
| 从太空看到的地球       | The Earth seen from space                  | `蓝色星球.jpg` / `Blue marble.jpg`                                 |
| 户外大雨               | Heavy rain falling outdoors                | `午后阵雨.webm` / `Afternoon downpour.webm`，0.5–6.5 s             |
| 保持安全出口畅通的标牌 | A sign asking people to keep an exit clear | `楼道告示.png` / `Hallway sign.png`（文字识别 / text recognition） |
| 保存园艺种子的说明     | Instructions for storing garden seeds      | `花园种子收纳.txt` / `Seed storage tips.txt`                       |

边界：只在一台 Windows 11 x64 电脑上用 CPU 版运行，样例很小。排名第一只代表这组样例，不代表任意数据。索引用时只代表这台电脑和这组样例，官网只在真实运行区块中引用它，不作为通用的速度数据。

## 文案边界 / Editorial boundaries

- 不承诺 AI 结果总是正确，用“检查结果”“由你决定”这类表述。
- 不使用虚构的用户数量、评价、速度数字、认证或服务等级。Search 不发布通用的速度数据，真实运行区块中实测的索引用时除外。
- 产品文案写给普通用户，不写网址、端口、`localhost`、引擎名称、令牌、密钥和本地路径。`site check` 和构建检查会拦下这些词，技术细节只记录在本文档中。唯一的例外是 `realRun.prompts`：它原样引用测试时输入的内容，可以出现测试用的 `C:\QCopilots-Demo\…` 路径，但不能出现用户目录。
- 界面图是用代码绘制的示意，标注“界面示意 / Illustrative preview”，不当作真实截图。
- 真实截图只放在“一次真实运行”区块中，标注“真实截图 / Real screenshots”，写明录制日期和版本。其中的每个数字都要能在本记录中找到。
- 不把桌面产品的平台与网站的开发、构建、托管平台混为一谈。
- 产品能力变化时，先更新本记录的版本锚点和证据，再同步修改中英文文案。

## 设计参考 / Design references

- [Anthropic 产品介绍](https://claude.com/product/overview)：暖色编辑风格、衬线标题、克制的动效。
- [OpenAI 产品介绍](https://chatgpt.com/overview/)：用代码实现的产品界面演示。
- [Astro 文档](https://docs.astro.build/) 与 [GitHub Pages 发布配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

网站使用独立品牌、原创文字与原创界面示意，没有复制参考页面的文案、素材或源码。
