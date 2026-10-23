import type { ContentItem, Locale, ProductId } from './products';

export interface UI {
  nav: {
    products: string;
    scenarios: string;
    about: string;
    download: string;
    home: string;
    menu: string;
    close: string;
    skip: string;
    language: string;
  };
  home: {
    eyebrow: string;
    titleLines: readonly [string, string];
    description: string;
    heroAlt: string;
    heroPrompt: string;
    primaryCta: string;
    secondaryCta: string;
    productsEyebrow: string;
    productsTitle: string;
    productsDescription: string;
    scenariosEyebrow: string;
    scenariosTitle: string;
    scenariosDescription: string;
    scenarios: readonly (ContentItem & { productId: ProductId })[];
    steps: readonly ContentItem[];
    workflowTitle: string;
    closingEyebrow: string;
    closingTitle: string;
    closingParts: readonly [string, string, string];
    closingDescription: string;
    closingCta: string;
    seoTitle: string;
    seoDescription: string;
  };
  common: {
    learnMore: string;
    download: string;
    downloadSoon: string;
    viewDownloads: string;
    illustration: string;
    features: string;
    workflow: string;
    useCases: string;
    faq: string;
    downloads: string;
    downloadsDescription: string;
    backToProducts: string;
    github: string;
    external: string;
    footerTagline: string;
    rights: string;
    allProducts: string;
    modelNoticeTitle: string;
    workflowEyebrow: string;
    useCasesEyebrow: string;
    getProductPrefix: string;
    downloadArchitecture: string;
    downloadVersion: string;
    downloadChecksum: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backHome: string;
  };
}

export const ui: Record<Locale, UI> = {
  zh: {
    nav: {
      products: '产品',
      scenarios: '使用场景',
      about: '关于',
      download: '获取产品',
      home: '首页',
      menu: '打开导航',
      close: '关闭导航',
      skip: '跳到主要内容',
      language: '切换语言',
    },
    home: {
      eyebrow: '让问题，成为探索的起点',
      titleLines: ['用自然语言，', '探索你的数据。'],
      description: '在地图中分析空间，在本机文件中寻找内容。',
      heroAlt: '河流、城市道路与公园组成的地图示意',
      heroPrompt: '找出这些社区附近的公园',
      primaryCta: '探索产品',
      secondaryCta: '看看能做什么',
      productsEyebrow: '认识 QCopilots 系列',
      productsTitle: '两款产品，不同的工作方式。',
      productsDescription: '从空间数据到本机资料，选择适合你的探索方式。',
      scenariosEyebrow: '从你的日常任务开始',
      scenariosTitle: '一个问题，开启更多可能。',
      scenariosDescription: '分析一张地图，找回一段内容。让工具从你熟悉的语言开始。',
      scenarios: [
        {
          title: '读懂一张地图',
          description: '探索图层和数据，让空间关系逐渐清晰。',
          productId: 'qcopilots',
        },
        {
          title: '找回一份资料',
          description: '用记得的内容，寻找报告与文档中的线索。',
          productId: 'qcopilots-search',
        },
        {
          title: '回到某个时刻',
          description: '从本机音频或视频中寻找相关片段。',
          productId: 'qcopilots-search',
        },
      ],
      workflowTitle: '从一个问题，走向一个结果。',
      steps: [
        { title: '选择你的任务', description: '分析一张地图，或寻找一份资料。' },
        { title: '描述你想做的事', description: '用熟悉的语言，说出问题或线索。' },
        { title: '查看结果，继续探索', description: '检查分析结果或预览匹配内容，再决定下一步。' },
      ],
      closingEyebrow: '你的下一步',
      closingTitle: '找到适合你的 QCopilots。',
      closingParts: ['找到适合你的 ', 'QCopilots', '。'],
      closingDescription: '了解每款产品的工作方式，开始你的下一次探索。',
      closingCta: '查看产品与下载',
      seoTitle: 'QCopilots · 用自然语言，探索你的数据',
      seoDescription:
        '认识 QCopilots 和 QCopilots-Search。在 QGIS 中探索空间数据，用关键词或自然语言寻找本机文档、图片、音频与视频内容。',
    },
    common: {
      learnMore: '了解产品',
      download: '前往下载',
      downloadSoon: '下载入口稍后开放',
      viewDownloads: '查看下载选项',
      illustration: '界面示意 / Illustrative preview',
      features: '你可以做什么',
      workflow: '如何开始',
      useCases: '使用场景',
      faq: '常见问题',
      downloads: '获取产品',
      downloadsDescription: '选择适合你的产品，查看下载选项与使用要求。',
      backToProducts: '查看全部产品',
      github: 'GitHub',
      external: '在外部网站打开',
      footerTagline: '让问题，成为探索的起点。',
      rights: 'QCopilots',
      allProducts: '所有产品',
      modelNoticeTitle: '按你的需要，选择工作方式',
      workflowEyebrow: '简单的开始，清晰的下一步',
      useCasesEyebrow: '从实际任务出发',
      getProductPrefix: '获取',
      downloadArchitecture: '架构',
      downloadVersion: '版本',
      downloadChecksum: '校验值',
      notFoundTitle: '这条路径还没有内容。',
      notFoundDescription: '页面可能已移动，或链接有误。从首页继续探索吧。',
      backHome: '返回首页',
    },
  },
  en: {
    nav: {
      products: 'Products',
      scenarios: 'Use cases',
      about: 'About',
      download: 'Get QCopilots',
      home: 'Home',
      menu: 'Open navigation',
      close: 'Close navigation',
      skip: 'Skip to content',
      language: 'Change language',
    },
    home: {
      eyebrow: 'Let a question be your starting point',
      titleLines: ['Explore your data.', 'In your own words.'],
      description: 'Analyze spatial data on a map. Find content in your local files.',
      heroAlt: 'An illustrated city map with a river, streets, and parks',
      heroPrompt: 'Find parks near these neighborhoods',
      primaryCta: 'Explore the products',
      secondaryCta: 'See what you can do',
      productsEyebrow: 'Meet the QCopilots family',
      productsTitle: 'Two products. Different ways to work.',
      productsDescription: 'From spatial data to local files, choose your way to explore.',
      scenariosEyebrow: 'Start with your everyday work',
      scenariosTitle: 'One question. More possibilities.',
      scenariosDescription:
        'Analyze a map or find a passage. Start with the words that come naturally to you.',
      scenarios: [
        {
          title: 'Make sense of a map',
          description: 'Explore layers and data to understand relationships between places.',
          productId: 'qcopilots',
        },
        {
          title: 'Find a document again',
          description: 'Search for a clue you remember in reports and documents.',
          productId: 'qcopilots-search',
        },
        {
          title: 'Return to a moment',
          description: 'Look for related clips in local audio and video files.',
          productId: 'qcopilots-search',
        },
      ],
      workflowTitle: 'From a question to a result.',
      steps: [
        {
          title: 'Choose your task',
          description: 'Analyze a map or find something in your files.',
        },
        {
          title: 'Describe what you need',
          description: 'Ask a question or share a clue in your own words.',
        },
        {
          title: 'Review and explore further',
          description: 'Check the analysis or preview a match, then decide what comes next.',
        },
      ],
      closingEyebrow: 'Your next step',
      closingTitle: 'Find your QCopilots.',
      closingParts: ['Find your ', 'QCopilots', '.'],
      closingDescription: 'Discover how each product works and begin your next exploration.',
      closingCta: 'View products and downloads',
      seoTitle: 'QCopilots · Explore your data in your own words',
      seoDescription:
        'Meet QCopilots and QCopilots-Search. Explore spatial data in QGIS and search local documents, images, audio, and video with keywords or natural language.',
    },
    common: {
      learnMore: 'Explore the product',
      download: 'Go to downloads',
      downloadSoon: 'Download link coming soon',
      viewDownloads: 'View download options',
      illustration: 'Illustrative preview / 界面示意',
      features: 'What you can do',
      workflow: 'Getting started',
      useCases: 'Use cases',
      faq: 'Frequently asked questions',
      downloads: 'Get the product',
      downloadsDescription: 'Choose your product and review download options and requirements.',
      backToProducts: 'Explore all products',
      github: 'GitHub',
      external: 'Opens an external website',
      footerTagline: 'Let a question be your starting point.',
      rights: 'QCopilots',
      allProducts: 'All products',
      modelNoticeTitle: 'Choose how you work',
      workflowEyebrow: 'A clear starting point',
      useCasesEyebrow: 'Start with something real',
      getProductPrefix: 'Get',
      downloadArchitecture: 'Architecture',
      downloadVersion: 'Version',
      downloadChecksum: 'Checksum',
      notFoundTitle: 'There is nothing at this address yet.',
      notFoundDescription:
        'The page may have moved or the link may be incorrect. Continue exploring from the home page.',
      backHome: 'Back to home',
    },
  },
};
