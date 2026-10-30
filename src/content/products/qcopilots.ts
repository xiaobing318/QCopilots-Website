import type { Product } from '../types.ts';

/** Facts are traced in docs/product-evidence.md (QGIS branch feature/final-4_2_0-qcopilots). */
export default {
  id: 'qcopilots',
  order: 10,
  status: 'coming-soon',
  icon: { src: '/images/qcopilots-icon.svg', width: 115, height: 116 },
  theme: { accent: '#2e8572', accentInk: '#1f6656', wash: '#e7f0ec' },
  demo: 'qcopilots-qgis',
  locales: {
    zh: {
      name: 'QCopilots',
      category: '内置于 QGIS',
      tagline: '用日常语言，完成地图工作。',
      summary:
        'QCopilots 让 QGIS 有了一位 AI 助手。说出你想做的事，它就在你打开的项目里加载数据、运行分析、制作地图。它执行的每一步都会显示在对话里，图层编辑先暂存，由你决定是否保存。',
      seo: {
        title: 'QCopilots · 用日常语言完成地图工作',
        description:
          'QCopilots 是内置 AI 助手的 QGIS。用日常语言加载数据、做空间分析、制作并导出地图。模型可以运行在你的电脑或团队服务器上，每一步都清楚可见。',
      },
      card: {
        headline: '用日常语言，完成地图工作。',
        description: '内置于 QGIS 的 AI 助手。它替你加载数据、运行分析、准备地图，结果由你确认。',
        platforms: 'Windows 10/11',
      },
      highlights: [
        {
          icon: 'chat',
          title: '用你自己的话说',
          description: '像跟同事交代工作一样描述任务，QCopilots 会判断该用哪些 QGIS 工具。',
        },
        {
          icon: 'layers',
          title: '就在你打开的项目里',
          description:
            '加载文件和在线底图、缩放视图、选择要素、添加标注、套用已有样式，都在你正在用的 QGIS 里完成。',
        },
        {
          icon: 'route',
          title: '真正的空间分析',
          description:
            '调用 QGIS 自带的处理算法，从缓冲区、重投影到路径分析。任务在后台运行，进度随时可见。',
        },
        {
          icon: 'printer',
          title: '做出可以分享的地图',
          description: '生成带标题、图例和比例尺的打印布局，再导出为 PDF、PNG、JPEG 或 SVG。',
        },
        {
          icon: 'shield',
          title: '每一步都看得见',
          description:
            '对话里会列出它执行的每一步。图层编辑先暂存，由你决定是否保存。移除图层、覆盖文件这类操作要先预览，再单独确认。',
        },
        {
          icon: 'drive',
          title: '模型放在哪里，由你决定',
          description:
            '模型可以运行在这台电脑上，也可以放在团队的服务器或工作站上。在 QCopilots 菜单中填入它的网址就能连接。',
        },
      ],
      examples: {
        title: '试着这样说',
        intro: '下面是一些可以直接说的例子，每一句都作用于你项目里的数据。',
        items: [
          {
            prompt: '按面积给德国各州分 5 级着色，并标上州名。',
            outcome: '生成由浅到深的分级样式和州名标注，差别一眼可见。',
          },
          {
            prompt: '加载 OpenStreetMap 底图，并缩放到我的地块图层。',
            outcome: '加入在线底图，并把视图对准你的数据。',
          },
          {
            prompt: '做一张 A3 横版布局，带图例和比例尺，再导出 PDF。',
            outcome: '生成打印布局，并把 PDF 保存到你指定的位置。',
          },
          {
            prompt: '按名称给道路加标注。',
            outcome: '用道路图层的名称字段添加标注。',
          },
          {
            prompt: '把这个高程栅格重投影到项目坐标系。',
            outcome: '在后台运行重投影，并加入新的栅格图层。',
          },
          {
            prompt: '把这些图层打包成一个 GeoPackage。',
            outcome: '把选中的图层整理进一个便于分享的文件。',
          },
        ],
      },
      facts: {
        title: '以 QGIS 本身为基础',
        note: '数字来自当前开发版本。可用的处理算法取决于你的 QGIS 安装。',
        items: [
          { value: '82', label: '个助手可以调用的工具' },
          { value: '750+', label: '个 QGIS 处理算法' },
          { value: '87', label: '个 GDAL、PROJ 等命令行程序' },
          { value: '4', label: '种地图导出格式：PDF、PNG、JPEG、SVG' },
        ],
      },
      steps: {
        title: '三步开始',
        items: [
          {
            title: '打开 QGIS，连接模型',
            description:
              '模型服务可以部署在服务器或工作站上，也可以直接在这台电脑上启动。打开 QGIS，在顶部的“QCopilots”菜单中选择“Configure QCopilots URL”，填入模型服务的网址。QCopilots 以面板形式停靠在地图旁边。',
          },
          {
            title: '说出你的需求',
            description: '输入请求后，它执行的每一步都会显示在对话里，你可以随时查看和调整。',
          },
          {
            title: '检查结果，保留或调整',
            description: '在地图上核对结果，保存你想要的编辑，或者继续提出修改。',
          },
        ],
      },
      privacy: {
        title: '你的数据，由你掌控',
        intro:
          'QCopilots 只把对话和助手读取的数据发给你指定的模型服务，地图工具始终在你自己的 QGIS 里运行。',
        points: [
          {
            title: '模型运行在哪里，由你选择',
            description:
              '模型可以运行在这台电脑上，也可以放在你信任的服务器上。对话只会发送到你在 QCopilots 菜单中填入的网址。',
          },
          {
            title: '地图工具留在本机',
            description:
              '加载数据、运行分析、编辑和导出地图的工具都在你的 QGIS 里运行，不向网络开放。',
          },
          {
            title: '编辑由你保存',
            description: '图层编辑会等你亲自保存。替换已有的输出文件，需要单独确认一步。',
          },
        ],
        note: '模型运行在另一台设备上时，对话内容以及助手从图层和文件中读取的数据，都会通过网络发送给它。请使用你信任的模型服务。',
      },
      requirements: [
        { label: '系统', value: 'Windows 10 或 11，64 位' },
        { label: '包含', value: '内置 QCopilots 的 QGIS 4.2' },
        {
          label: '模型',
          value: '一个对话模型服务，运行在这台电脑或服务器上，在 QCopilots 菜单中连接',
        },
        {
          label: '网络',
          value:
            '模型在这台电脑上时无需联网，在线底图等网络数据除外。模型在其他设备上时，QGIS 需要能通过网络连接到它',
        },
      ],
      faq: [
        {
          question: 'QCopilots 是什么？',
          answer:
            'QCopilots 是内置 AI 助手的 QGIS，而 QGIS 是免费开源的地图软件。你描述任务，助手用 QGIS 自带的工具来完成，每一步你都看得见。',
        },
        {
          question: '需要懂 GIS 吗？',
          answer:
            '懂一些会更顺手，但不必记住工具名称。用日常语言提问就好，QCopilots 会展示它执行的每一步，这也是熟悉 QGIS 的好办法。',
        },
        {
          question: '模型在哪里运行？',
          answer:
            '可以部署在服务器或工作站上，也可以直接在这台电脑上启动。无论哪种方式，都在 QGIS 的“QCopilots”菜单中选择“Configure QCopilots URL”，填入模型服务的网址即可。如果需要帮忙部署，可以发邮件联系我们。',
        },
        {
          question: '它会修改或删除我的数据吗？',
          answer:
            '在你要求时它可以编辑图层，但编辑会先暂存，由你决定是否保存。移除图层和替换已有输出要先预览，再单独确认。它还能读写文件、运行命令，所以请在有备份的数据上使用。',
        },
        {
          question: '需要检查它的结果吗？',
          answer:
            '需要。使用结果之前，请对照原始数据、坐标系和你的目标进行核对。QCopilots 帮你推进工作，最终判断仍由你做出。',
        },
        {
          question: '什么时候可以下载？',
          answer:
            'QCopilots 的 Windows 10/11 版本正在准备中，准备就绪后会在本页提供下载。想提前试用，可以发邮件向我们申请。',
        },
      ],
      downloads: {
        title: '获取 QCopilots',
        description: 'Windows 版本正在准备中，下载入口开放后会在这里提供。',
      },
      demo: {
        caption: '三个场景由一次真实运行简化而来，分级、面积和文件名都来自实际结果。',
        windowTitle: '德国各州面积 — QGIS',
        placeholder: '向 QCopilots 提问…',
        labels: {
          layers: '图层',
          panel: 'QCopilots',
          status: '模型已连接',
          layerResult: 'germany_states_3035',
          layerSource: 'world_map',
          class1: '< 14,317',
          class2: '14,317 – 28,250',
          class3: '28,250 – 42,183',
          class4: '42,183 – 56,116',
          class5: '> 56,116',
          mapTitle: '德国各州面积',
          legend: '面积（km²）',
          scaleBar: '100 km',
          tableTitle: '面积最大的五个州（km²）',
        },
        scenes: [
          {
            query:
              '加载 world_map.gpkg 中德国的 16 个州，算出面积，按面积分 5 级用绿色着色并标上州名。',
            steps: [
              '筛出德国的 16 个州',
              '重投影到 EPSG:3035 等积投影',
              '新增 area_km2 字段，计算每个州的面积',
              '按面积等距分 5 级绿色着色，加上州名',
            ],
            reply:
              '好了。germany_states_3035 已按面积从浅到深分成 5 级并标上州名。核对过了：16 个州合计约 357,574 平方公里。',
          },
          {
            query: '做一张 A4 竖版地图，标题“德国各州面积”，带图例和比例尺，导出 PDF 和 PNG。',
            steps: ['新建 A4 竖版布局', '加入标题、图例和比例尺', '导出 PDF 和 PNG'],
            reply: '地图做好了，已导出 germany_states_area.pdf 和 germany_states_area.png。',
          },
          {
            query: '面积最大的五个州是哪些？各多少平方公里？',
            steps: ['按 area_km2 从大到小排序', '取出前 5 个州'],
            reply:
              '这五个州合计约 218,268.5 平方公里，占 16 个州总面积的 61.0%。第 6 名 Mecklenburg-Vorpommern 为 23,248.23 平方公里。',
            rows: [
              { label: 'Bayern', value: '70,048.66' },
              { label: 'Niedersachsen', value: '47,559.10' },
              { label: 'Baden-Württemberg', value: '36,106.96' },
              { label: 'Nordrhein-Westfalen', value: '34,530.87' },
              { label: 'Brandenburg', value: '30,022.92' },
            ],
          },
        ],
      },
      realRun: {
        title: '从筛选数据到导出地图：德国各州面积',
        intro:
          '我们用 QGIS 自带的示例世界地图，请 QCopilots 筛出德国各州、算出面积、做成分级地图并导出，最后回答一个问题。模型运行在另一台电脑上，通过 QCopilots 菜单连接。',
        prompts: [
          '加载 C:\\QCopilots-Demo\\data\\world_map.gpkg 中的 states_provinces，只保留 admin 为 Germany 的 16 个州，重投影到 EPSG:3035，新增 area_km2 字段计算每个州的面积（平方公里）。',
          '按 area_km2 分 5 级用绿色渐变着色，给每个州加名称标注，缩放到该图层。',
          '做一张 A4 竖版地图，标题‘德国各州面积’，带图例和比例尺，导出 PDF 和 PNG 到 C:\\QCopilots-Demo\\output\\zh。',
          '面积最大的五个州是哪些？各多少平方公里？',
        ],
        steps: [
          '筛出德国的 16 个州，重投影到 EPSG:3035 等积投影，新增 area_km2 字段算出每个州的面积。随后它自己核对了坐标系、要素数和面积合计，并在预览后移除了两个临时图层。',
          '按面积等距分成 5 级，从浅绿到深绿着色，并标上州名。这一步不是一次完成的：它写的样式起初没有生效，我们补了三句简短提示（让它继续、指出样式文件里要改的一处写法、请它把项目坐标系设为 EPSG:3035），之后地图才正常显示。',
          '新建 A4 竖版打印布局，加入标题、图例和数字比例尺，导出 PDF 和 PNG 两个文件。',
          '用表格列出面积最大的五个州，并补充说明：它们合计约 218,268.5 平方公里，占 16 个州总面积的 61.0%，第 6 名 Mecklenburg-Vorpommern 为 23,248.23 平方公里。',
        ],
        facts: [
          { value: '16', label: '个州，从示例世界地图中筛出' },
          {
            value: '357,574',
            label: '平方公里，16 个州的面积之和，接近德国约 357,022 平方公里的国土面积',
          },
          { value: '5', label: '级，按面积等距划分，从浅绿到深绿' },
          { value: '61.0%', label: '的总面积集中在最大的五个州' },
        ],
        images: [
          {
            file: 'qcopilots/1-map.png',
            alt: 'QGIS 窗口。左侧地图把德国 16 个州按面积分成 5 级绿色并标有州名，Bayern 颜色最深，图层面板列出 germany_states_3035 的 5 个分级。右侧 QCopilots 面板用表格列出面积最大的五个州及其面积，下方补充说明这五个州占 16 个州总面积的 61.0%。',
            caption: '5 级绿色分级和州名标注，右侧是它列出的面积前五名。',
          },
          {
            file: 'qcopilots/2-layout.png',
            alt: '导出的 A4 竖版地图 PNG。左上角是标题“德国各州面积”，中间是按面积分成 5 级绿色并标有州名的德国各州，右上角的图例列出 5 个面积区间，左下角是数字比例尺。',
            caption: '导出的 A4 竖版地图，带标题、图例和比例尺。',
          },
          {
            file: 'qcopilots/3-check.png',
            alt: 'QGIS 窗口，左侧是同一张分级地图。右侧 QCopilots 面板显示它的自查结果：坐标系为 EPSG:3035，16 个要素都属于德国，16 个州面积合计约 357,574 平方公里，与德国国土面积相符。下方是先预览、再移除两个临时图层的步骤。',
            caption: '它自己核对了结果，并在预览后移除临时图层。',
          },
        ],
        version: 'QCopilots 开发版（QGIS 4.2，2026-10-27 构建）· Windows 11',
        recordedOn: '2026-10-29',
        note: '数据来自 QGIS 自带的示例世界地图，即 Natural Earth 的公有领域数据。边界经过概括，算出的面积与官方数字略有出入。截图保持原始分辨率，未做遮挡或修饰。',
      },
    },
    en: {
      name: 'QCopilots',
      category: 'Inside QGIS',
      tagline: 'Map work, in plain language.',
      summary:
        'QCopilots adds an AI assistant to QGIS. Describe what you need, and it loads data, runs analyses and lays out maps in your open project. Each step shows in the chat, and layer edits wait for you to save them.',
      seo: {
        title: 'QCopilots · Map work in plain language',
        description:
          'QCopilots is QGIS with an AI assistant built in. Load data, run spatial analysis and export maps in plain language. The model can run on your computer or a team server, and every step shows in the chat.',
      },
      card: {
        headline: 'Map work, in plain language.',
        description:
          'An AI assistant inside QGIS that loads data, runs analyses and prepares maps for you to review.',
        platforms: 'Windows 10/11',
      },
      highlights: [
        {
          icon: 'chat',
          title: 'Ask in your own words',
          description:
            'Describe the task the way you would tell a colleague. QCopilots works out which QGIS tools to use.',
        },
        {
          icon: 'layers',
          title: 'Works in your open project',
          description:
            'It loads files and web basemaps, zooms, selects features, adds labels and applies saved styles in the QGIS you already have open.',
        },
        {
          icon: 'route',
          title: 'Real spatial analysis',
          description:
            'It runs QGIS processing tools, from buffers and reprojection to route finding, as background jobs you can follow.',
        },
        {
          icon: 'printer',
          title: 'Maps ready to share',
          description:
            'Build a print layout with a title, legend and scale bar, then export it as PDF, PNG, JPEG or SVG.',
        },
        {
          icon: 'shield',
          title: 'Every step in view',
          description:
            'The chat lists each step it takes. Layer edits wait for you to save them, and removing layers or replacing files is previewed first, then confirmed in a separate step.',
        },
        {
          icon: 'drive',
          title: 'Run the model where you like',
          description:
            'Run the model on this computer, or on a server or workstation your team shares. Connect it by entering its web address in the QCopilots menu.',
        },
      ],
      examples: {
        title: 'Try asking',
        intro: 'A few things you can ask. Each one works on the data in your project.',
        items: [
          {
            prompt: 'Shade the German states in 5 classes by area and label them by name.',
            outcome:
              'Colors the states from light to dark and labels them, so the differences show at a glance.',
          },
          {
            prompt: 'Load an OpenStreetMap basemap and zoom to my parcels.',
            outcome: 'Adds the web basemap and frames your data.',
          },
          {
            prompt: 'Make an A3 landscape layout with a legend and scale bar, then export a PDF.',
            outcome: 'Builds the print layout and saves the PDF where you choose.',
          },
          {
            prompt: 'Label the roads by name.',
            outcome: 'Sets up labels on the roads layer from its name field.',
          },
          {
            prompt: 'Reproject this elevation raster to the project coordinate system.',
            outcome: 'Runs the reprojection in the background and adds the new raster.',
          },
          {
            prompt: 'Package these layers into one GeoPackage.',
            outcome: 'Gathers the selected layers into a single file you can pass on.',
          },
        ],
      },
      facts: {
        title: 'Built on QGIS itself',
        note: 'Counts come from the current development build. Available algorithms depend on your QGIS installation.',
        items: [
          { value: '82', label: 'tools the assistant can use' },
          { value: '750+', label: 'QGIS processing algorithms' },
          { value: '87', label: 'GDAL, PROJ and other command-line programs' },
          { value: '4', label: 'map export formats: PDF, PNG, JPEG and SVG' },
        ],
      },
      steps: {
        title: 'Three steps to start',
        items: [
          {
            title: 'Open QGIS, connect a model',
            description:
              'The model service can run on a server or workstation, or right on this computer. Open QGIS, choose QCopilots → Configure QCopilots URL and enter the model’s web address. QCopilots sits in a panel beside your map.',
          },
          {
            title: 'Ask for what you need',
            description:
              'Type a request and watch each step it takes in the chat. Review and adjust whenever you like.',
          },
          {
            title: 'Review, then keep or refine',
            description:
              'Check the result on the map. Save the edits you want, or ask for changes.',
          },
        ],
      },
      privacy: {
        title: 'Your data, under your control',
        intro:
          'QCopilots sends your conversation, and the data the assistant reads, only to the model service you choose. Its map tools always run inside your own QGIS.',
        points: [
          {
            title: 'You choose where the model runs',
            description:
              'Run the model on this computer or on a server you trust. Conversations go only to the web address you entered in the QCopilots menu.',
          },
          {
            title: 'Map tools stay on your computer',
            description:
              'The tools that load data, run analyses, edit layers and export maps work inside your QGIS and are not open to the network.',
          },
          {
            title: 'You save the edits',
            description:
              'Layer edits wait for you to save them. Replacing an existing output file takes a separate confirmation step.',
          },
        ],
        note: 'When the model runs on another device, your conversation and any data the assistant reads from your layers and files travel over the network to it. Use a model service you trust.',
      },
      requirements: [
        { label: 'System', value: 'Windows 10 or 11, 64-bit' },
        { label: 'Includes', value: 'QGIS 4.2 with QCopilots built in' },
        {
          label: 'Model',
          value:
            'A chat model service on this computer or on a server, connected from the QCopilots menu',
        },
        {
          label: 'Internet',
          value:
            'Not needed with a model on this computer, except for web basemaps and other online data. A model on another device must be reachable from QGIS over the network',
        },
      ],
      faq: [
        {
          question: 'What is QCopilots?',
          answer:
            'QCopilots is QGIS, the free and open-source map software, with an AI assistant built in. You describe a task, and the assistant carries it out with QGIS tools while you watch each step.',
        },
        {
          question: 'Do I need to know GIS?',
          answer:
            'It helps, but you do not need to know tool names. Ask in everyday language and QCopilots shows each step it takes, which is also a good way to learn QGIS.',
        },
        {
          question: 'Where does the model run?',
          answer:
            'Wherever suits you: on a server or workstation, or right on this computer. Either way, choose QCopilots → Configure QCopilots URL in QGIS and enter the model’s web address. If you need help setting it up, email us.',
        },
        {
          question: 'Can it change or delete my data?',
          answer:
            'It can edit layers when you ask, but edits are held until you save them. Removing layers and replacing existing outputs are previewed first, then confirmed in a separate step. It can also read and write files and run commands, so use it on data you have backed up.',
        },
        {
          question: 'Should I check its results?',
          answer:
            'Yes. Review outputs against your data, coordinate system and goals before you rely on them. QCopilots moves the work forward, and the judgment stays yours.',
        },
        {
          question: 'When can I download it?',
          answer:
            'QCopilots for Windows 10 and 11 is being prepared, and the download will appear on this page when it is ready. To try it sooner, email us to request early access.',
        },
      ],
      downloads: {
        title: 'Get QCopilots',
        description:
          'The Windows release is being prepared, and the download will appear here when it is ready.',
      },
      demo: {
        caption:
          'Three scenes condensed from a real run. The classes, areas and file names come from the actual results.',
        windowTitle: 'Area of German states — QGIS',
        placeholder: 'Ask QCopilots…',
        labels: {
          layers: 'Layers',
          panel: 'QCopilots',
          status: 'Model connected',
          layerResult: 'germany_states_3035',
          layerSource: 'world_map',
          class1: '< 14,317',
          class2: '14,317 – 28,250',
          class3: '28,250 – 42,183',
          class4: '42,183 – 56,116',
          class5: '> 56,116',
          mapTitle: 'Area of German states',
          legend: 'Area (km²)',
          scaleBar: '100 km',
          tableTitle: 'Five largest states (km²)',
        },
        scenes: [
          {
            query:
              'Load the 16 German states from world_map.gpkg, work out their areas, shade them in 5 green classes and label them by name.',
            steps: [
              'Kept the 16 German states',
              'Reprojected to EPSG:3035, an equal-area projection',
              'Added area_km2 with the area of each state',
              'Shaded 5 equal-width area classes in green and added the names',
            ],
            reply:
              'Done. germany_states_3035 is shaded light to dark green in 5 area classes and labeled. I checked: the 16 states add up to about 357,574 km².',
          },
          {
            query:
              'Make an A4 portrait map titled “Area of German states” with a legend and scale bar, then export PDF and PNG.',
            steps: [
              'Created an A4 portrait layout',
              'Added the title, legend and scale bar',
              'Exported a PDF and a PNG',
            ],
            reply:
              'Your map is ready, exported as germany_states_area.pdf and germany_states_area.png.',
          },
          {
            query: 'Which five states have the largest area? How many km² is each?',
            steps: ['Sorted the states by area_km2', 'Took the five largest'],
            reply:
              'Together these five cover about 218,268.5 km², 61.0% of the 16-state total. Sixth is Mecklenburg-Vorpommern at 23,248.23 km².',
            rows: [
              { label: 'Bayern', value: '70,048.66' },
              { label: 'Niedersachsen', value: '47,559.10' },
              { label: 'Baden-Württemberg', value: '36,106.96' },
              { label: 'Nordrhein-Westfalen', value: '34,530.87' },
              { label: 'Brandenburg', value: '30,022.92' },
            ],
          },
        ],
      },
      realRun: {
        title: 'From raw data to a finished map: the area of Germany’s states',
        intro:
          'Using the sample world map that comes with QGIS, we asked QCopilots to pick out Germany’s states, work out their areas, turn them into a shaded map and export it, then answer a question. The model ran on another computer, connected through the QCopilots menu.',
        prompts: [
          'Load states_provinces from C:\\QCopilots-Demo\\data\\world_map.gpkg, keep only the 16 states whose admin is Germany, reproject them to EPSG:3035, and add an area_km2 field with the area of each state in square kilometers.',
          'Shade the states in 5 classes by area_km2 with a green gradient, label each state with its name, and zoom to the layer.',
          'Make an A4 portrait map titled ‘Area of German states’ with a legend and scale bar, and export it as PDF and PNG to C:\\QCopilots-Demo\\output\\zh.',
          'Which five states have the largest area? How many square kilometers is each?',
        ],
        steps: [
          'Kept the 16 German states, reprojected them to the equal-area EPSG:3035 and added area_km2 with the area of each state. It then checked the coordinate system, the feature count and the total area on its own, and previewed two temporary layers before removing them.',
          'Shaded the states in 5 equal-width area classes from pale to deep green and labeled them by name. This took more than one try. Its style did not take effect at first, and the map displayed correctly only after three short hints from us (telling it to carry on, pointing out one detail to fix in its style file, and asking it to set the project coordinate system to EPSG:3035).',
          'Created an A4 portrait print layout with the title, a legend and a numeric scale, then exported a PDF and a PNG.',
          'Answered with a table of the five largest states, and added that together they cover about 218,268.5 km², 61.0% of the 16-state total, and that sixth-placed Mecklenburg-Vorpommern has 23,248.23 km².',
        ],
        facts: [
          { value: '16', label: 'states picked out of the sample world map' },
          {
            value: '357,574',
            label: 'km² for all 16 states, close to the commonly cited 357,022 km² for Germany',
          },
          { value: '5', label: 'area classes, from pale to deep green' },
          { value: '61.0%', label: 'of the total area lies in the five largest states' },
        ],
        images: [
          {
            file: 'qcopilots/1-map.png',
            alt: 'QGIS with a map of Germany’s 16 states in 5 green area classes, labeled by name, and the QCopilots panel listing the five largest states and their share, 61.0%, in Chinese.',
            caption:
              'Five green classes with state names, and its table of the five largest states.',
          },
          {
            file: 'qcopilots/2-layout.png',
            alt: 'The exported A4 portrait map: a title in Chinese, the states in 5 green classes with their names, a legend of the 5 area ranges and a numeric scale.',
            caption: 'The exported A4 portrait map with its title, legend and scale.',
          },
          {
            file: 'qcopilots/3-check.png',
            alt: 'QGIS with the same map and the QCopilots panel showing its own check in Chinese: EPSG:3035, 16 German states, about 357,574 km² in total, then a preview before removing two temporary layers.',
            caption:
              'It checks its own result, then previews temporary layers before removing them.',
          },
        ],
        version: 'QCopilots development build (QGIS 4.2, built 2026-10-27) · Windows 11',
        recordedOn: '2026-10-29',
        note: 'The data is Natural Earth, from the sample world map that comes with QGIS (public domain). Its borders are generalized, so the areas differ slightly from official figures. Screenshots are shown at full resolution, unedited.',
      },
    },
  },
  downloads: [
    {
      id: 'qcopilots-windows',
      platform: 'windows',
      label: { zh: 'Windows', en: 'Windows' },
      url: null,
      requirements: { zh: 'Windows 10/11 · 64 位', en: 'Windows 10/11 · 64-bit' },
      architecture: 'x64',
    },
  ],
} satisfies Product;
