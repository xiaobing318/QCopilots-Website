export type Locale = 'zh' | 'en';
export type ProductId = 'qcopilots' | 'qcopilots-search';
export type Localized<T> = Record<Locale, T>;

export interface ContentItem {
  title: string;
  description: string;
}

export interface ProductContent {
  name: string;
  tagline: string;
  homeHeadline: readonly [string, string];
  homeDescription: string;
  description: string;
  eyebrow: string;
  benefits: readonly ContentItem[];
  steps: readonly ContentItem[];
  faq: readonly { question: string; answer: string }[];
  useCases: readonly ContentItem[];
  seoTitle: string;
  seoDescription: string;
  heroAlt: string;
  modelNotice: string;
  downloadsDescription: string;
}

export interface DownloadEntry {
  id: string;
  platform: 'windows' | 'macos' | 'linux' | 'bsd' | 'container' | 'all';
  label: Localized<string>;
  url: string | null;
  requirements?: Localized<string>;
  architecture?: string;
  version?: string;
  checksum?: string;
}

export interface Product {
  id: ProductId;
  icon: string;
  heroImage: string;
  locales: Localized<ProductContent>;
  downloads: readonly DownloadEntry[];
}

/** Product facts and asset provenance are maintained in docs/product-evidence.md. */
export const products: readonly Product[] = [
  {
    id: 'qcopilots',
    icon: '/images/qcopilots-icon.svg',
    heroImage: '/images/qcopilots-map.webp',
    locales: {
      zh: {
        name: 'QCopilots',
        tagline: '让地图工作，从对话开始。',
        homeHeadline: ['让地图工作，', '从对话开始。'],
        homeDescription: '在熟悉的 QGIS 中探索空间数据、开展分析，并制作和导出地图。',
        description:
          '在熟悉的 QGIS 中探索空间数据、开展分析，并制作和导出地图。把你想做的事说出来，查看结果，再继续深入。',
        eyebrow: '你的空间数据伙伴',
        benefits: [
          {
            title: '从看懂数据开始',
            description: '了解项目中的图层与要素，查看属性和空间范围，为接下来的分析找到方向。',
          },
          {
            title: '把问题变成分析',
            description:
              '用自然语言描述任务，连接 QGIS 的矢量、栅格和通用处理能力，逐步完成空间分析。',
          },
          {
            title: '让结果呈现在地图上',
            description:
              '应用图层样式、调整地图视图，创建单页布局并导出地图，让分析成果更容易表达和分享。',
          },
        ],
        steps: [
          {
            title: '打开你的项目',
            description: '在 QGIS 中准备数据，打开 QCopilots，并连接适合任务的模型服务。',
          },
          {
            title: '说出你的问题',
            description: '从查看图层、分析附近的设施，或制作一张地图开始。按需要补充范围和条件。',
          },
          {
            title: '查看结果，继续探索',
            description: '在地图和分析结果中核对输出，再通过对话调整细节或导出成果。',
          },
        ],
        useCases: [
          {
            title: '读懂一份空间数据',
            description: '快速了解有哪些图层、字段和地理范围，让陌生的数据更容易着手。',
          },
          {
            title: '探索位置之间的关系',
            description: '围绕距离、范围和空间分布提出问题，调用适合的数据处理工具。',
          },
          {
            title: '制作可以分享的地图',
            description: '整理地图表达、应用样式并创建布局，把工作的结果带入报告与讨论。',
          },
        ],
        faq: [
          {
            question: 'QCopilots 和 QGIS 是什么关系？',
            answer:
              'QCopilots 为 QGIS 增加对话式工作方式。数据、图层与地图工作仍在 QGIS 中进行，你可以结合现有的手动操作继续完成任务。',
          },
          {
            question: '开始使用前需要准备什么？',
            answer:
              '准备包含 QCopilots 的安装包、你的空间数据，以及可用的模型服务。具体安装步骤、系统要求和模型连接方式以对应发布包的说明为准。',
          },
          {
            question: '我的数据会发送到哪里？',
            answer:
              '这取决于你连接的模型服务及执行的操作。使用在线模型时，对话和操作所需的上下文可能发送给该服务。使用前请了解服务的数据政策，并按需要选择本地模型或在线模型。',
          },
          {
            question: '可以直接相信自动生成的分析结果吗？',
            answer:
              '请结合原始数据、坐标参考系和分析条件检查结果。QCopilots 帮助推进任务，最终的判断、数据质量核查和成果确认仍由你完成。',
          },
          {
            question: '哪些平台可以下载？',
            answer:
              '本页按 Windows、macOS 和 Linux 组织下载入口。具体系统版本、硬件架构和安装要求以对应发布包为准，下载链接将逐步补充。',
          },
        ],
        seoTitle: 'QCopilots · 让地图工作，从对话开始',
        seoDescription:
          '在 QGIS 中用自然语言探索空间数据、开展分析，并制作和导出地图。了解 QCopilots 的使用场景与下载信息。',
        heroAlt: '空间数据与地图分析的原创展示图，界面示意',
        modelNotice:
          '选择适合你的模型连接。数据的处理位置与流向取决于所连接的模型服务和具体操作，使用前请确认相应设置与数据政策。',
        downloadsDescription:
          '按平台选择下载入口。具体系统版本与安装要求以对应发布包为准，下载链接将逐步补充。',
      },
      en: {
        name: 'QCopilots',
        tagline: 'Start your map work with a conversation.',
        homeHeadline: ['Map work starts', 'with a conversation.'],
        homeDescription: 'Explore spatial data, run analyses, and create and export maps in QGIS.',
        description:
          'Explore spatial data, run analyses, and create and export maps in QGIS. Describe what you need, review the result, and keep exploring.',
        eyebrow: 'A companion for your spatial data',
        benefits: [
          {
            title: 'Get to know your data',
            description:
              'Explore project layers and features, inspect attributes and extents, and find a starting point for your analysis.',
          },
          {
            title: 'Turn a question into an analysis',
            description:
              'Describe a task in your own words and work through it with QGIS vector, raster, and general processing tools.',
          },
          {
            title: 'Bring the result onto the map',
            description:
              'Apply layer styles and adjust map views, create a single-page layout, and export maps that make your findings easier to share.',
          },
        ],
        steps: [
          {
            title: 'Open your project',
            description:
              'Prepare your data in QGIS, open QCopilots, and connect a model service suited to your task.',
          },
          {
            title: 'Ask your question',
            description:
              'Start with exploring a layer, analyzing nearby facilities, or creating a map. Add the area and conditions as needed.',
          },
          {
            title: 'Review and explore further',
            description:
              'Check the map and analysis outputs, then refine the details through conversation or export your work.',
          },
        ],
        useCases: [
          {
            title: 'Understand a spatial dataset',
            description:
              'Explore its layers, fields, and geographic extent to find your way into unfamiliar data.',
          },
          {
            title: 'Explore relationships between places',
            description:
              'Ask about distance, coverage, and spatial patterns, then use the processing tools that fit your data.',
          },
          {
            title: 'Make a map worth sharing',
            description:
              'Apply styles and create a layout to bring your findings into a report or a conversation.',
          },
        ],
        faq: [
          {
            question: 'How does QCopilots relate to QGIS?',
            answer:
              'QCopilots adds a conversational way to work in QGIS. Your data, layers, and maps remain part of your QGIS workflow, alongside the manual tools you already use.',
          },
          {
            question: 'What do I need to get started?',
            answer:
              'You need a package that includes QCopilots, your spatial data, and an available model service. Follow the release instructions for installation, system requirements, and model connections.',
          },
          {
            question: 'Where does my data go?',
            answer:
              'That depends on your connected model service and the operations you run. An online model may receive your conversation and the context needed for a task. Review the service’s data policy and choose a local or online model according to your needs.',
          },
          {
            question: 'Should I review an analysis before using it?',
            answer:
              'Yes. Check the results against your source data, coordinate reference system, and analysis conditions. QCopilots helps move work forward, while you remain responsible for judgment, data quality, and final review.',
          },
          {
            question: 'Which platforms can I download for?',
            answer:
              'Download entries are organized by Windows, macOS, and Linux. Supported system versions, architectures, and installation requirements are provided with each release. Links will be added as they become available on this site.',
          },
        ],
        seoTitle: 'QCopilots · Start your map work with a conversation',
        seoDescription:
          'Explore spatial data, run analyses, and create and export maps in QGIS using natural language. Discover QCopilots and find download information.',
        heroAlt: 'An original illustration of spatial data and map analysis, illustrative preview',
        modelNotice:
          'Choose the model connection that fits your work. Where data is processed and sent depends on your model service and the operations you run. Review its settings and data policy before use.',
        downloadsDescription:
          'Choose a platform below. Supported system versions and installation requirements are provided with each release. Download links will be added to this site.',
      },
    },
    downloads: [
      {
        id: 'qcopilots-windows',
        platform: 'windows',
        label: { zh: 'Windows', en: 'Windows' },
        url: null,
      },
      { id: 'qcopilots-macos', platform: 'macos', label: { zh: 'macOS', en: 'macOS' }, url: null },
      { id: 'qcopilots-linux', platform: 'linux', label: { zh: 'Linux', en: 'Linux' }, url: null },
    ],
  },
  {
    id: 'qcopilots-search',
    icon: '/images/search-icon.png',
    heroImage: '/images/search-preview.webp',
    locales: {
      zh: {
        name: 'QCopilots-Search',
        tagline: '找到你记得的那一段。',
        homeHeadline: ['找到你记得的', '那一段。'],
        homeDescription: '用关键词或自然语言查找本机文档、图片、音频和视频片段，并预览匹配内容。',
        description:
          '用关键词或自然语言，查找本机文档、图片、音频和视频片段。即使忘了文件名，也可以从记得的内容开始。',
        eyebrow: '让本机资料更容易找到',
        benefits: [
          {
            title: '从内容寻找，不只靠文件名',
            description:
              '输入关键词，或描述你记得的内容。在文档正文、图片和媒体片段中寻找相关线索。',
          },
          {
            title: '找到之后，就地确认',
            description: '预览文本片段、PDF 页面、图片与音视频时刻，确认内容后再打开原文件。',
          },
          {
            title: '让搜索范围由你决定',
            description:
              '选择需要索引的文件夹，并排除不需要的目录。文件提取、索引与语义推理在本机进行。',
          },
        ],
        steps: [
          { title: '选择你的文件夹', description: '添加希望搜索的资料目录，按需排除其他文件夹。' },
          {
            title: '建立本地索引',
            description: '先开始关键词搜索，再下载或离线导入语义模型，准备按内容寻找。',
          },
          {
            title: '描述、预览、打开',
            description: '输入线索，按类型与目录筛选，在匹配位置预览内容，再打开所需文件。',
          },
        ],
        useCases: [
          {
            title: '找回报告中的一段话',
            description: '不必先想起文件名，用主题或关键词寻找文档与 PDF 中的相关片段。',
          },
          {
            title: '找出记忆中的图片',
            description: '描述照片或截图中的内容，在本地图片资料中寻找相关结果。',
          },
          {
            title: '回到一段声音或画面',
            description: '用自然语言检索音频和视频片段，在应用内预览相应时刻。',
          },
        ],
        faq: [
          {
            question: '它搜索的是互联网，还是我的电脑？',
            answer:
              'QCopilots-Search 面向本机文件。你选择要索引的文件夹，然后在这些资料中检索内容。它不是互联网搜索引擎，也不是根据文档自动生成答案的聊天工具。',
          },
          {
            question: '可以搜索哪些内容？',
            answer:
              '支持常见文本与办公文档、PDF、图片、音频和视频，也提供独立的代码搜索。具体格式、文件大小与解码支持有各自边界，请以发布说明为准。',
          },
          {
            question: '需要先下载模型吗？',
            answer:
              '文件名和已提取正文的关键词搜索不需要语义模型。语义搜索需要准备应用支持的 EmbeddingGemma 2 模型，可在应用中下载或离线导入。模型权重不包含在安装包内。',
          },
          {
            question: '文件会上传到云端吗？',
            answer:
              '文件内容的提取、索引与语义推理在本机执行。模型下载和版本检查需要联网，自动版本检查可以在设置中关闭。打开外部程序或链接时，也请了解相应程序的行为。',
          },
          {
            question: '可以在 Mac 上使用吗？',
            answer:
              '当前 macOS 发行包面向 Apple Silicon，要求 macOS 14.4 或更高版本。Windows 与 Linux 提供 x64 发行包，具体系统基线、GPU 与驱动要求请查看对应下载说明。',
          },
        ],
        seoTitle: 'QCopilots-Search · 找到你记得的那一段',
        seoDescription:
          '用关键词或自然语言查找本机文档、图片、音频和视频片段，在预览中确认匹配内容。了解 QCopilots-Search 并获取下载。',
        heroAlt: '本机文档、图片与媒体搜索的原创展示图，界面示意',
        modelNotice:
          '文件内容的提取、索引与语义推理在本机进行。模型下载和版本检查需要联网，语义模型也可以离线导入。',
        downloadsDescription:
          '前往 GitHub Releases 选择适合你系统和硬件的安装包。语义模型需在安装后下载或离线导入。',
      },
      en: {
        name: 'QCopilots-Search',
        tagline: 'Find the part you remember.',
        homeHeadline: ['Find the part', 'you remember.'],
        homeDescription:
          'Search local documents, images, audio, and video clips with keywords or natural language, then preview the matches.',
        description:
          'Search local documents, images, audio, and video clips with keywords or natural language. Start with what you remember, even when the filename escapes you.',
        eyebrow: 'Find your way through local files',
        benefits: [
          {
            title: 'Search by content, beyond the filename',
            description:
              'Enter keywords or describe what you remember to find related passages, images, and media moments.',
          },
          {
            title: 'Preview the part that matters',
            description:
              'Check text passages, PDF pages, images, and audio or video moments before opening the original file.',
          },
          {
            title: 'Choose what to search',
            description:
              'Select the folders to index and exclude the ones you do not need. File extraction, indexing, and semantic inference run on your computer.',
          },
        ],
        steps: [
          {
            title: 'Choose your folders',
            description:
              'Add the folders you want to search and exclude other directories as needed.',
          },
          {
            title: 'Build your local index',
            description:
              'Start with keyword search, then download or import the semantic model to search by meaning.',
          },
          {
            title: 'Describe, preview, open',
            description:
              'Enter a clue, filter by type or folder, preview the matching passage or moment, and open the file you need.',
          },
        ],
        useCases: [
          {
            title: 'Find a passage in a report',
            description:
              'Search a topic or a phrase across documents and PDFs without first remembering the filename.',
          },
          {
            title: 'Find an image you remember',
            description:
              'Describe the content of a photo or screenshot to look for related images in your local collection.',
          },
          {
            title: 'Return to a sound or a scene',
            description:
              'Search audio and video clips in natural language, then preview the matching moment in the app.',
          },
        ],
        faq: [
          {
            question: 'Does it search the web or my computer?',
            answer:
              'QCopilots-Search works with local files. You choose the folders to index and search within that collection. It is not a web search engine or a chat tool that generates answers from your documents.',
          },
          {
            question: 'What kinds of content can I search?',
            answer:
              'It supports common text and office documents, PDFs, images, audio, and video, with a separate option for code search. Supported formats, file sizes, and codecs have limits. Refer to the release documentation for details.',
          },
          {
            question: 'Do I need to download a model first?',
            answer:
              'Keyword search over filenames and extracted text works without the semantic model. Semantic search requires the supported EmbeddingGemma 2 model, available through an in-app download or offline import. Model weights are not bundled with the installer.',
          },
          {
            question: 'Are my files uploaded to the cloud?',
            answer:
              'File extraction, indexing, and semantic inference run locally. Model downloads and update checks use the internet, and automatic update checks can be disabled in settings. External programs and links have their own behavior.',
          },
          {
            question: 'Can I use it on a Mac?',
            answer:
              'The current macOS release is for Apple Silicon and requires macOS 14.4 or later. Windows and Linux releases target x64. Check the relevant download notes for system baselines, GPU support, and driver requirements.',
          },
        ],
        seoTitle: 'QCopilots-Search · Find the part you remember',
        seoDescription:
          'Find local documents, images, audio, and video moments with keywords or natural language. Preview the matches and download QCopilots-Search.',
        heroAlt:
          'An original illustration of local document, image, and media search, illustrative preview',
        modelNotice:
          'File extraction, indexing, and semantic inference run on your computer. Model downloads and update checks use the internet. You can also import the semantic model offline.',
        downloadsDescription:
          'Visit GitHub Releases to choose a package for your system and hardware. Download or import the semantic model after installation.',
      },
    },
    downloads: [
      {
        id: 'search-windows',
        platform: 'windows',
        label: { zh: 'Windows · x64', en: 'Windows · x64' },
        url: 'https://github.com/xiaobing318/QCopilots-Search/releases/latest',
        architecture: 'x64',
        requirements: {
          zh: 'Windows 10 1809 / Windows 11，GPU 版本另有硬件与驱动要求。',
          en: 'Windows 10 1809 / Windows 11. GPU builds have additional hardware and driver requirements.',
        },
      },
      {
        id: 'search-macos',
        platform: 'macos',
        label: { zh: 'macOS · Apple Silicon', en: 'macOS · Apple Silicon' },
        url: 'https://github.com/xiaobing318/QCopilots-Search/releases/latest',
        architecture: 'arm64',
        requirements: {
          zh: 'macOS 14.4 或更高版本，Apple Silicon。',
          en: 'macOS 14.4 or later, Apple Silicon.',
        },
      },
      {
        id: 'search-linux',
        platform: 'linux',
        label: { zh: 'Linux · x64', en: 'Linux · x64' },
        url: 'https://github.com/xiaobing318/QCopilots-Search/releases/latest',
        architecture: 'x64',
        requirements: {
          zh: 'CPU / Vulkan 版以 Ubuntu 22.04 为基线，部分 GPU 版要求 Ubuntu 24.04。',
          en: 'CPU / Vulkan builds target Ubuntu 22.04. Some GPU builds require Ubuntu 24.04.',
        },
      },
    ],
  },
];
