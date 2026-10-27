import type { IconName } from './icons.ts';
import type { Localized } from './types.ts';

interface Principle {
  icon: IconName;
  title: string;
  description: string;
}

export interface UiCopy {
  meta: { siteName: string; description: string };
  nav: {
    skip: string;
    products: string;
    menu: string;
    close: string;
    language: string;
  };
  home: {
    seoTitle: string;
    eyebrow: string;
    title: readonly [string, string];
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    familyEyebrow: string;
    familyTitle: string;
    familyLead: string;
    examplesEyebrow: string;
    examplesTitle: string;
    examplesLead: string;
    principlesEyebrow: string;
    principlesTitle: string;
    principles: readonly Principle[];
    closingTitle: string;
    closingLead: string;
  };
  product: {
    allProducts: string;
    explore: string;
    download: string;
    downloadSoon: string;
    seeExamples: string;
    comingSoon: string;
    available: string;
    chapters: string;
    sections: {
      overview: string;
      features: string;
      examples: string;
      workflow: string;
      privacy: string;
      faq: string;
      downloads: string;
    };
    featuresTitle: string;
    requirements: string;
    releaseNotes: string;
    sourceCode: string;
    related: string;
    youAsk: string;
    youGet: string;
  };
  demo: { pause: string; illustrative: string };
  notFound: { title: string; description: string; home: string };
  footer: { tagline: string; productsNav: string; licenses: string; rights: string };
}

export const ui: Localized<UiCopy> = {
  zh: {
    meta: {
      siteName: 'QCopilots',
      description:
        'QCopilots 系列产品：在 QGIS 中用日常语言完成地图工作，在本机文件中按记忆找到内容。',
    },
    nav: {
      skip: '跳到正文',
      products: '产品',
      menu: '打开菜单',
      close: '关闭菜单',
      language: '语言',
    },
    home: {
      seoTitle: 'QCopilots · 帮你处理地图与文件的 AI 助手',
      eyebrow: 'QCopilots 系列',
      title: ['用你自己的话，', '处理地图与文件。'],
      lead: '在 QGIS 里描述想做的地图工作，或者用记得的内容找回电脑里的文件。QCopilots 在你自己的电脑上运行，每一步都清楚可见。',
      primaryCta: '了解产品',
      secondaryCta: '看看能做什么',
      familyEyebrow: '产品',
      familyTitle: '为不同的日常工作而设计',
      familyLead: '每个 QCopilots 产品专注一件事，并把它做得清楚、可靠。',
      examplesEyebrow: '使用示例',
      examplesTitle: '用你自己的话来问',
      examplesLead: '不需要记住菜单或命令。说出你想要的结果，或描述你记得的内容。',
      principlesEyebrow: '我们的原则',
      principlesTitle: '值得信赖的助手，应当如此',
      principles: [
        {
          icon: 'drive',
          title: '在你的电脑上运行',
          description: '默认使用本地模型与本地索引，你的项目和文件不需要离开这台电脑。',
        },
        {
          icon: 'eye',
          title: '每一步都看得见',
          description:
            'QCopilots 在对话里列出每一步，图层编辑由你决定是否保存。Search 只展示你自己的文件，从不编造答案。',
        },
        {
          icon: 'translate',
          title: '中文、英文都能用',
          description:
            '两款产品都可以用中文或英文提问。QCopilots Search 的界面支持中英文，还能跨语言找到内容。',
        },
      ],
      closingTitle: '找到适合你工作的 QCopilots',
      closingLead: '从一个具体的任务开始，看看它能为你省下多少步骤。',
    },
    product: {
      allProducts: '全部产品',
      explore: '了解 {name}',
      download: '下载',
      downloadSoon: '即将开放下载',
      seeExamples: '看看示例',
      comingSoon: '即将推出',
      available: '现已推出',
      chapters: '页面章节',
      sections: {
        overview: '概览',
        features: '功能',
        examples: '示例',
        workflow: '使用方式',
        privacy: '隐私',
        faq: '常见问题',
        downloads: '下载',
      },
      featuresTitle: '它能为你做什么',
      requirements: '系统要求',
      releaseNotes: '查看全部发布版本',
      sourceCode: '查看源代码',
      related: '了解其他产品',
      youAsk: '你这样说',
      youGet: '它这样做',
    },
    demo: { pause: '暂停动画', illustrative: '界面示意' },
    notFound: {
      title: '没有找到这个页面',
      description: '链接可能已经变更。可以从首页或产品页面继续浏览。',
      home: '返回中文首页',
    },
    footer: {
      tagline: '帮你处理地图与文件的 AI 助手。',
      productsNav: '页脚产品链接',
      licenses: '开源许可',
      rights: '本站内容与界面示意仅用于产品介绍。',
    },
  },
  en: {
    meta: {
      siteName: 'QCopilots',
      description:
        'The QCopilots family: map work in plain language inside QGIS, and search that finds your files the way you remember them.',
    },
    nav: {
      skip: 'Skip to content',
      products: 'Products',
      menu: 'Open menu',
      close: 'Close menu',
      language: 'Language',
    },
    home: {
      seoTitle: 'QCopilots · Quiet help for your maps and files',
      eyebrow: 'The QCopilots family',
      title: ['Quiet help for', 'your maps and files.'],
      lead: 'Describe the map work you want done in QGIS, or find a file on your computer by what you remember about it. QCopilots runs on your own computer and shows you every step.',
      primaryCta: 'Meet the products',
      secondaryCta: 'See what you can ask',
      familyEyebrow: 'Products',
      familyTitle: 'Made for the work you already do',
      familyLead: 'Each QCopilots product focuses on one job and does it clearly and reliably.',
      examplesEyebrow: 'Examples',
      examplesTitle: 'Ask in your own words',
      examplesLead:
        'No menus or commands to remember. Say the result you want, or describe what you recall.',
      principlesEyebrow: 'Principles',
      principlesTitle: 'What a trustworthy assistant should be',
      principles: [
        {
          icon: 'drive',
          title: 'Runs on your computer',
          description:
            'Local models and local indexes by default, so your projects and files can stay on this machine.',
        },
        {
          icon: 'eye',
          title: 'Every step in view',
          description:
            'QCopilots lists each step in the chat and holds layer edits until you save them. Search shows your own files and never makes up answers.',
        },
        {
          icon: 'translate',
          title: 'Chinese or English',
          description:
            'Ask either product in Chinese or English. QCopilots Search also has a bilingual interface and finds content across the two languages.',
        },
      ],
      closingTitle: 'Find the QCopilots that fits your work',
      closingLead: 'Start with one real task and see how many steps it saves you.',
    },
    product: {
      allProducts: 'All products',
      explore: 'Explore {name}',
      download: 'Download',
      downloadSoon: 'Download coming soon',
      seeExamples: 'See examples',
      comingSoon: 'Coming soon',
      available: 'Available now',
      chapters: 'Page chapters',
      sections: {
        overview: 'Overview',
        features: 'Features',
        examples: 'Examples',
        workflow: 'How it works',
        privacy: 'Privacy',
        faq: 'FAQ',
        downloads: 'Download',
      },
      featuresTitle: 'What it does for you',
      requirements: 'Requirements',
      releaseNotes: 'See all releases',
      sourceCode: 'View the source code',
      related: 'More from QCopilots',
      youAsk: 'You say',
      youGet: 'It does',
    },
    demo: { pause: 'Pause animation', illustrative: 'Illustrative preview' },
    notFound: {
      title: 'This page could not be found',
      description: 'The link may have changed. Continue from the home page or a product page.',
      home: 'English home',
    },
    footer: {
      tagline: 'Quiet help for your maps and files.',
      productsNav: 'Footer products',
      licenses: 'Open-source licenses',
      rights: 'Product previews on this site are illustrations.',
    },
  },
};
