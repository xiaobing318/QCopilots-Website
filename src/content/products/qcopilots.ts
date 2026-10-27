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
          'QCopilots 是内置 AI 助手的 QGIS。用日常语言加载数据、做空间分析、制作并导出地图。默认使用本机模型，每一步都清楚可见。',
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
          icon: 'offline',
          title: '默认在本机运行',
          description: '默认连接你电脑上运行的模型，项目数据可以完全留在这台电脑上。',
        },
      ],
      examples: {
        title: '试着这样说',
        intro: '下面是一些可以直接说的例子，每一句都作用于你项目里的数据。',
        items: [
          {
            prompt: '给学校图层做 500 米缓冲区。',
            outcome: '运行缓冲区工具，把结果作为新图层加到地图上。',
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
          { value: '7', label: '个只在本机监听的工具服务' },
        ],
      },
      steps: {
        title: '三步开始',
        items: [
          {
            title: '启动模型，打开 QGIS',
            description:
              '先在本机启动 llama.cpp 模型服务（一个运行 AI 模型的小程序），再打开 QGIS 和你的项目。QCopilots 以面板形式停靠在地图旁边。',
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
        title: '你的数据，留在你身边',
        intro: 'QCopilots 的设计目标，是让整个工作过程都可以只在你的电脑上完成。',
        points: [
          {
            title: '默认使用本地模型',
            description:
              '聊天面板默认连接你电脑上运行的 llama.cpp 模型服务，地址 127.0.0.1:8282 指的就是这台电脑。',
          },
          {
            title: '工具只在本机监听',
            description:
              '7 个工具服务都只在本机地址 127.0.0.1 上监听，并且只接受带有私有访问密钥的请求。',
          },
          {
            title: '编辑由你保存',
            description: '图层编辑会等你亲自保存。替换已有的输出文件，需要单独确认一步。',
          },
        ],
        note: '如果你把 QCopilots 改为连接在线模型服务，对话内容会发送到该服务。使用前请先了解它的数据政策。',
      },
      requirements: [
        { label: '系统', value: 'Windows 10 或 11，64 位' },
        { label: '包含', value: '内置 QCopilots 的 QGIS 4.2' },
        { label: '模型', value: '本地 llama.cpp 模型服务（默认），或你选择的其他对话服务' },
        { label: '网络', value: '使用本地模型时无需联网，在线底图等网络数据除外' },
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
          question: '它使用什么 AI 模型？',
          answer: '默认使用你在本机通过 llama.cpp 运行的模型。你也可以把面板改为连接其他对话服务。',
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
          answer: 'QCopilots 的 Windows 10/11 版本正在准备中。准备就绪后会在本页提供下载。',
        },
      ],
      downloads: {
        title: '获取 QCopilots',
        description: 'Windows 版本正在准备中，下载入口开放后会在这里提供。',
      },
      demo: {
        caption: 'QCopilots 在 QGIS 中的界面示意',
        windowTitle: '城市公园 — QGIS',
        placeholder: '向 QCopilots 提问…',
        labels: {
          layers: '图层',
          panel: 'QCopilots',
          status: '本地模型 · 127.0.0.1:8282',
          layerBuffer: '学校_缓冲区_500m',
          layerSchools: '学校',
          layerRoads: '道路',
          layerParks: '公园',
          layerRiver: '河流',
          layerElevation: 'elevation',
          legend: '图例',
          scale: '1:10,000',
          crs: '坐标系',
          crsValue: 'EPSG:32650',
          crsName: 'WGS 84 / UTM zone 50N',
          pixel: '像元大小',
          pixelValue: '30 米',
        },
        scenes: [
          {
            query: '给学校图层做 500 米缓冲区。',
            steps: ['查看“学校”图层', '运行缓冲区，距离 500 米', '添加新图层“学校_缓冲区_500m”'],
            reply: '好了。500 米缓冲区已作为新图层显示在地图上，目前还没有保存任何内容。',
          },
          {
            query: '做一张 A3 横版布局，带图例和比例尺，再导出 PDF。',
            steps: ['新建 A3 横版布局', '加入地图、图例和比例尺', '导出“城市公园.pdf”'],
            reply: '布局做好了，PDF 已保存到“文档”。要再加一个标题吗？',
          },
          {
            query: 'elevation.tif 用的是什么坐标系？',
            steps: ['在图层列表中找到 elevation', '用 gdalinfo 读取文件信息'],
            reply: '它使用 WGS 84 / UTM zone 50N（EPSG:32650），每个像元 30 米。',
          },
        ],
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
          'QCopilots is QGIS with an AI assistant built in. Load data, run spatial analysis and export maps in plain language, with a local model by default and every step shown in the chat.',
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
          icon: 'offline',
          title: 'Runs on your computer',
          description:
            'By default it talks to a model running on your own machine, so your project data can stay right here.',
        },
      ],
      examples: {
        title: 'Try asking',
        intro: 'A few things you can ask. Each one works on the data in your project.',
        items: [
          {
            prompt: 'Buffer the schools layer by 500 meters.',
            outcome: 'Runs the buffer tool and adds the result to your map as a new layer.',
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
          { value: '7', label: 'tool services that listen only on your computer' },
        ],
      },
      steps: {
        title: 'Three steps to start',
        items: [
          {
            title: 'Start the model, open QGIS',
            description:
              'Start a llama.cpp model server on your computer (a small program that runs the AI model), then open QGIS and your project. QCopilots sits in a panel beside your map.',
          },
          {
            title: 'Ask for what you need',
            description:
              'Type a request and watch each step it takes in the chat. Adjust or stop whenever you like.',
          },
          {
            title: 'Review, then keep or refine',
            description:
              'Check the result on the map. Save the edits you want, or ask for changes.',
          },
        ],
      },
      privacy: {
        title: 'Your data stays with you',
        intro: 'QCopilots is designed so the whole job can happen on your own computer.',
        points: [
          {
            title: 'A local model by default',
            description:
              'The chat panel connects to a llama.cpp model server running on your own computer. Its address, 127.0.0.1:8282, means this machine.',
          },
          {
            title: 'Tools listen only locally',
            description:
              'All seven tool services listen on 127.0.0.1 only, and they accept requests only with a private access key.',
          },
          {
            title: 'You save the edits',
            description:
              'Layer edits wait for you to save them. Replacing an existing output file takes a separate confirmation step.',
          },
        ],
        note: 'If you point QCopilots at an online model service instead, your conversations go to that service. Check its data policy first.',
      },
      requirements: [
        { label: 'System', value: 'Windows 10 or 11, 64-bit' },
        { label: 'Includes', value: 'QGIS 4.2 with QCopilots built in' },
        {
          label: 'Model',
          value: 'A local llama.cpp model server (default), or another chat service you choose',
        },
        {
          label: 'Internet',
          value: 'Not needed with a local model, except for web basemaps and other online data',
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
          question: 'Which AI model does it use?',
          answer:
            'By default, a model you run on your own computer with llama.cpp. You can point the panel at another chat service if you prefer.',
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
            'QCopilots for Windows 10 and 11 is being prepared. The download will appear on this page when it is ready.',
        },
      ],
      downloads: {
        title: 'Get QCopilots',
        description:
          'The Windows release is being prepared. The download will appear here when it is ready.',
      },
      demo: {
        caption: 'An illustration of QCopilots inside QGIS',
        windowTitle: 'city-parks — QGIS',
        placeholder: 'Ask QCopilots…',
        labels: {
          layers: 'Layers',
          panel: 'QCopilots',
          status: 'Local model · 127.0.0.1:8282',
          layerBuffer: 'schools_buffer_500m',
          layerSchools: 'schools',
          layerRoads: 'roads',
          layerParks: 'parks',
          layerRiver: 'river',
          layerElevation: 'elevation',
          legend: 'Legend',
          scale: '1:10,000',
          crs: 'Coordinate system',
          crsValue: 'EPSG:32650',
          crsName: 'WGS 84 / UTM zone 50N',
          pixel: 'Pixel size',
          pixelValue: '30 m',
        },
        scenes: [
          {
            query: 'Buffer the schools layer by 500 meters.',
            steps: [
              'Checked the schools layer',
              'Ran Buffer with a 500 m distance',
              'Added schools_buffer_500m to the map',
            ],
            reply:
              'Done. The 500 m buffer is on the map as a new layer. Nothing has been saved yet.',
          },
          {
            query: 'Make an A3 landscape layout with a legend and scale bar, then export a PDF.',
            steps: [
              'Created an A3 landscape layout',
              'Added the map, legend and scale bar',
              'Exported city-parks.pdf',
            ],
            reply: 'Your layout is ready and the PDF is saved in Documents. Shall I add a title?',
          },
          {
            query: 'Which coordinate system is elevation.tif in?',
            steps: ['Found elevation in the layer list', 'Read the file details with gdalinfo'],
            reply: 'It uses WGS 84 / UTM zone 50N (EPSG:32650), and each pixel is 30 m across.',
          },
        ],
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
