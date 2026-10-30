import type { IconName } from './icons.ts';
import type { Localized } from './types.ts';

interface Principle {
  icon: IconName;
  title: string;
  description: string;
}

type CooperationType = Principle;

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
    realRunEyebrow: string;
    realBadge: string;
    realPrompts: string;
    realSteps: string;
    /** {date} is the localized recording date. */
    realRecorded: string;
    realOpen: string;
    trialPrompt: string;
    trialCta: string;
    /** Email subject. {name} is the product name. */
    trialSubject: string;
  };
  /** Cooperation and contact. The address itself lives in site.ts. */
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    types: readonly CooperationType[];
    emailCta: string;
    emailLabel: string;
    emailSubject: string;
    footerHeading: string;
    footerLink: string;
  };
  demo: { pause: string; illustrative: string };
  notFound: { title: string; description: string; home: string };
  footer: {
    tagline: string;
    productsNav: string;
    licenses: string;
    rights: string;
    /** {year} and {company} come from site.ts. */
    copyright: string;
  };
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
      lead: '在 QGIS 里描述想做的地图工作，或者用记得的内容找回电脑里的文件。QCopilots 在你信任的设备上运行，每一步都清楚可见。',
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
          title: '在你掌控的地方运行',
          description:
            'Search 在本机建立索引。QCopilots 的地图工具在你的 QGIS 里运行，模型放在你的电脑或你信任的服务器上。',
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
      realRunEyebrow: '一次真实运行',
      realBadge: '真实截图',
      realPrompts: '我们的输入',
      realSteps: '它做了什么',
      realRecorded: '录制于 {date}',
      realOpen: '查看原图',
      trialPrompt: '想在正式发布前试用？',
      trialCta: '申请试用',
      trialSubject: '申请试用 {name}',
    },
    contact: {
      eyebrow: '合作方式',
      title: '想试用，或者想一起做点什么？',
      lead: '无论是提前试用、把模型部署到你的服务器，还是为你的行业定制 QCopilots，都欢迎来信，我们会尽快回复。',
      types: [
        {
          icon: 'sparkle',
          title: '试用与内测申请',
          description: '想在正式发布前用上 QCopilots，或者参与新版本内测，告诉我们你打算怎么用。',
        },
        {
          icon: 'cpu',
          title: '部署与模型支持',
          description: '帮你把模型服务部署到服务器、工作站或你自己的电脑上，并接入 QCopilots。',
        },
        {
          icon: 'code',
          title: '定制开发',
          description:
            '按你的行业和业务需要定制地图工具与工作流程，或者和我们一起打造新的 QCopilots 产品。',
        },
        {
          icon: 'handshake',
          title: '商务与渠道合作',
          description: '代理、集成或联合方案，欢迎聊聊合作的可能。',
        },
      ],
      emailCta: '写邮件给我们',
      emailLabel: '联系邮箱',
      emailSubject: 'QCopilots 合作咨询',
      footerHeading: '联系我们',
      footerLink: '合作方式',
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
      rights: '页面中的动画为界面示意，真实截图另有标注。',
      copyright: '© {year} {company} 版权所有',
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
      lead: 'Describe the map work you want done in QGIS, or find a file on your computer by what you remember about it. QCopilots works on machines you trust and shows you every step.',
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
          title: 'Runs where you decide',
          description:
            'Search builds its index on your computer. QCopilots runs its map tools inside your QGIS, with the model on your own computer or a server you trust.',
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
      realRunEyebrow: 'A real run',
      realBadge: 'Real screenshots',
      realPrompts: 'What we asked',
      realSteps: 'What it did',
      realRecorded: 'Recorded on {date}',
      realOpen: 'Open full size',
      trialPrompt: 'Want to try it before release?',
      trialCta: 'Request early access',
      trialSubject: 'Early access to {name}',
    },
    contact: {
      eyebrow: 'Work with us',
      title: 'Want to try it, or build something together?',
      lead: 'Early access, help running the model on your own servers, or a QCopilots made for your field. Write to us and we will get back to you soon.',
      types: [
        {
          icon: 'sparkle',
          title: 'Early access and beta',
          description:
            'Use QCopilots before its public release or join the beta. Tell us how you plan to use it.',
        },
        {
          icon: 'cpu',
          title: 'Deployment and model support',
          description:
            'We help you run the model service on a server, a workstation or your own computer, and connect it to QCopilots.',
        },
        {
          icon: 'code',
          title: 'Custom development',
          description:
            'Map tools and workflows shaped around your field and your process, or a new QCopilots product we build together.',
        },
        {
          icon: 'handshake',
          title: 'Business and channel partnerships',
          description: 'Reselling, integration or joint solutions. We would be glad to talk.',
        },
      ],
      emailCta: 'Email us',
      emailLabel: 'Email',
      emailSubject: 'QCopilots inquiry',
      footerHeading: 'Contact',
      footerLink: 'Ways to work with us',
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
      rights: 'Animated previews are illustrations. Real screenshots are labeled as such.',
      copyright: '© {year} {company}. All rights reserved.',
    },
  },
};
