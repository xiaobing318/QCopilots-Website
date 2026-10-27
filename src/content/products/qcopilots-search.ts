import type { Product } from '../types.ts';

const releases = 'https://github.com/xiaobing318/QCopilots-Search/releases/latest';

/** Facts are traced in docs/product-evidence.md (QCopilots-Search v0.3.0). */
export default {
  id: 'qcopilots-search',
  order: 20,
  status: 'available',
  icon: {
    src: '/images/search-icon.png',
    width: 512,
    height: 512,
    license: { name: 'MIT', file: '/licenses/qcopilots-search-MIT.txt' },
  },
  theme: { accent: '#3a62c4', accentInk: '#2b4fa8', wash: '#e8edf8' },
  demo: 'search-window',
  links: {
    releases,
    source: 'https://github.com/xiaobing318/QCopilots-Search',
    license: 'https://github.com/xiaobing318/QCopilots-Search/blob/main/LICENSE',
  },
  locales: {
    zh: {
      name: 'QCopilots Search',
      category: '桌面应用',
      tagline: '按你记忆中的样子，找到文件。',
      summary:
        'QCopilots Search 帮你在电脑里的文档、照片、录音和视频中找东西。用中文或英文描述你记得的内容，就能直接看到对应的页面、段落或时刻。',
      seo: {
        title: 'QCopilots Search · 按你记忆中的样子找到文件',
        description:
          '免费开源的本机搜索应用。用中文或英文按意思搜索文档、照片、录音和视频，还认得图片里的文字，全部在你的电脑上完成。支持 Windows、macOS 和 Linux。',
      },
      card: {
        headline: '按你记忆中的样子，找到文件。',
        description: '在本机文档、照片、录音和视频中按意思搜索，直接看到命中的页面或时刻。',
        platforms: 'Windows · macOS · Linux · 免费开源',
      },
      highlights: [
        {
          icon: 'search',
          title: '按意思搜索',
          description: '输入“图书馆开放时间通知”，即使文件名叫 scan_0042.pdf 也能找到。',
        },
        {
          icon: 'translate',
          title: '中英文互通',
          description: '用中文描述，也能找到英文写成的内容，反过来也一样。',
        },
        {
          icon: 'scan',
          title: '认得图片里的字',
          description: '照片、截图和扫描版 PDF 里的文字都能搜到，支持英文、简体中文和繁体中文。',
        },
        {
          icon: 'waveform',
          title: '声音和画面也能找',
          description: '在录音里找到狗叫声，在视频里找到下大雨的片段，并从那一刻开始播放。',
        },
        {
          icon: 'eye',
          title: '直达具体位置',
          description: '打开文件之前，先预览命中的段落或 PDF 页面，或从命中的时刻开始播放。',
        },
        {
          icon: 'lock',
          title: '一切留在本机',
          description: '读取、索引和 AI 匹配都在你的电脑上完成，文件不会被上传。',
        },
      ],
      examples: {
        title: '按记忆去搜索',
        intro: '这些查询取自应用自动化测试中的中英文样例，右边是它们找到的内容。',
        items: [
          { prompt: '保存园艺种子的说明', outcome: '一份纯文本笔记，按意思找到' },
          { prompt: '图书馆开放时间通知', outcome: 'PDF 中对应的那一页' },
          { prompt: '保持安全出口畅通的标牌', outcome: '一张中文标牌图片，靠文字识别找到' },
          { prompt: '从太空看到的地球', outcome: '一张照片，按画面内容找到' },
          { prompt: '狗叫声', outcome: '录音里有狗叫的那一段' },
          { prompt: '户外大雨', outcome: '视频中下大雨的片段' },
        ],
      },
      facts: {
        title: '它能读懂的内容',
        note: '暂不支持电子表格和演示文稿。音频按声音匹配，不做语音转文字。',
        items: [
          { value: '8', label: '种文档格式，包括 PDF 与 Word' },
          { value: '3', label: '种文字识别语言：英文、简体中文、繁体中文' },
          { value: '19', label: '种相机 RAW 照片格式，另支持 HEIC' },
          { value: '约 90', label: '种代码文件类型，以及 Jupyter 笔记本' },
        ],
      },
      steps: {
        title: '三步开始',
        items: [
          {
            title: '选择文件夹',
            description: '选好要搜索的文件夹，其他文件不会进入索引。',
          },
          {
            title: '让它读一遍',
            description:
              '它会在后台建立索引，不需要模型也能按关键词搜索。只需下载一次模型（不到 1 GB），或离线导入，就能按意思搜索。',
          },
          {
            title: '描述，然后直达',
            description:
              '写下你记得的内容，预览会停在命中的页面、段落或时刻。在任何应用中按 Ctrl+Shift+Space 都能打开快速搜索（Mac 上同样是 Control+Shift+Space）。',
          },
        ],
      },
      privacy: {
        title: '从设计上保护隐私',
        intro: '模型准备好之后，QCopilots Search 可以完全离线工作。',
        points: [
          {
            title: '文件不离开电脑',
            description: '读取、文字识别、索引和 AI 匹配都在本机完成。',
          },
          {
            title: '只有两种联网',
            description: '一次性的模型下载，以及可以关闭的版本更新检查。',
          },
          {
            title: '不动你的文件',
            description: '把文件夹移出索引，不会删除其中任何文件。',
          },
        ],
        note: '它只展示你自己的文件，不会生成回答，也不会编造内容。',
      },
      requirements: [
        { label: 'Windows', value: 'Windows 10（1809 及以上）或 11，x64。安装包或便携版' },
        { label: 'macOS', value: 'macOS 14.4 及以上，Apple 芯片' },
        {
          label: 'Linux',
          value:
            'x64，DEB 安装包或便携版。Ubuntu 22.04 及以上，NVIDIA 与 AMD 显卡版需要 24.04 及以上',
        },
        {
          label: '显卡',
          value:
            '可选。另有支持 NVIDIA 显卡、AMD RX 9000 系列或通用 Vulkan 加速的版本，Mac 版使用 Metal。所有版本都能只靠 CPU 运行',
        },
        { label: '许可', value: '免费开源，MIT 许可' },
      ],
      faq: [
        {
          question: '它会搜索互联网吗？',
          answer: '不会。它只搜索你在电脑上选定的文件夹。它不是网页搜索引擎，也不是聊天机器人。',
        },
        {
          question: '可以搜索哪些文件？',
          answer:
            '文档（PDF、Word、ODT、RTF、HTML、Markdown、纯文本）、照片（包括 HEIC 和相机 RAW）、音频、视频，以及在设置中开启后的代码。暂不支持电子表格和演示文稿。',
        },
        {
          question: '能找到录音里说过的话吗？',
          answer:
            '不能逐字查找。音频按每段 30 秒的声音来匹配，所以“狗叫声”能找到，但它不会把说的话转成文字。',
        },
        {
          question: '打开文件时会跳到那一页吗？',
          answer:
            '内置预览会停在命中的页面、段落或时刻。用系统默认应用打开时只会打开文件。在设置中选择 SumatraPDF、Skim、Okular 或 mpv 等应用，就能在那里直接跳到对应位置。',
        },
        {
          question: '需要显卡吗？',
          answer:
            '不需要。所有版本都能在 CPU 上运行。如果下载了对应的显卡版本，建立索引时可以用显卡加速。',
        },
        {
          question: '为什么 macOS 首次打开时会有提示？',
          answer:
            'macOS 版本暂未经过 Apple 公证。如果系统阻止打开，请前往“系统设置”中的“隐私与安全性”，选择“仍要打开”。',
        },
        {
          question: '免费吗？',
          answer: '免费。QCopilots Search 以 MIT 许可开源。',
        },
      ],
      downloads: {
        title: '下载 QCopilots Search',
        description:
          '0.3.0 版已在 GitHub 发布。请选择适合你系统的版本，安装后在应用内下载或导入模型。',
      },
      demo: {
        caption: 'QCopilots Search 的界面示意',
        windowTitle: 'QCopilots Search',
        placeholder: '搜索文档、图片、声音与视频片段…',
        labels: {
          subtitle: '从本机文件中找到所需内容，支持中英文与多种媒体。',
          quick: '快速搜索',
          model: '模型已就绪',
          settings: '设置',
          all: '所有类型',
          folders: '所有文件夹',
          code: '代码搜索',
          results: '结果：{count} · 语义与关键词',
          semantic: '语义匹配',
          keyword: '关键词',
          both: '语义与关键词',
          open: '打开文件',
          reveal: '在文件夹中显示',
          ready: '索引已就绪 2316 / 2316',
          shortcut: '快速搜索：Ctrl+Shift+Space · 搜索：Ctrl+F',
        },
        scenes: [
          {
            query: '图书馆开放时间通知',
            steps: [
              '页码 2',
              '阅览室服务时间调整',
              '自 3 月起，阅览室每天 8:30 开门，21:00 闭馆。',
              '节假日开放时间另行公布。',
            ],
            results: [
              {
                title: 'scan_0042.pdf',
                meta: '文档 › 通知 · 页码 2',
                kind: 'pdf',
                match: 'semantic',
              },
              { title: '闭馆日告示.png', meta: '图片 › 公告', kind: 'image', match: 'semantic' },
              { title: '本学期公告汇总.docx', meta: '文档 › 通知', kind: 'text', match: 'both' },
            ],
          },
          {
            query: '狗叫声',
            steps: ['0:50 / 3:12'],
            results: [
              {
                title: '公园散步.ogg',
                meta: '录音 › 周末 · 50.0 s',
                kind: 'audio',
                match: 'semantic',
              },
              {
                title: '小狗生日.mp4',
                meta: '视频 › 家庭 · 150.0 s',
                kind: 'video',
                match: 'semantic',
              },
            ],
          },
          {
            query: '从太空看到的地球',
            steps: ['适配 · 12%'],
            results: [
              { title: 'IMG_2041.HEIC', meta: '图片 › 旅行', kind: 'image', match: 'semantic' },
              { title: '天文讲座.pdf', meta: '文档 › 课程 · 页码 7', kind: 'pdf', match: 'both' },
            ],
          },
          {
            query: '户外大雨',
            steps: ['1:15 / 4:06'],
            results: [
              {
                title: '露营第二天.mp4',
                meta: '视频 › 露营 · 75.0 s',
                kind: 'video',
                match: 'semantic',
              },
              { title: '雨夜窗外.m4a', meta: '录音 · 25.0 s', kind: 'audio', match: 'semantic' },
              { title: '天气笔记.md', meta: '文档 › 笔记', kind: 'text', match: 'keyword' },
            ],
          },
        ],
      },
    },
    en: {
      name: 'QCopilots Search',
      category: 'Desktop app',
      tagline: 'Find your files the way you remember them.',
      summary:
        'QCopilots Search helps you find things in the documents, photos, recordings and videos on your computer. Describe what you remember, in Chinese or English, and go straight to the right page, passage or moment.',
      seo: {
        title: 'QCopilots Search · Find files the way you remember them',
        description:
          'Free, open-source desktop search for your documents, photos, recordings and videos. Search by meaning in Chinese or English, entirely on your computer. For Windows, macOS and Linux.',
      },
      card: {
        headline: 'Find your files the way you remember them.',
        description:
          'Search your documents, photos, recordings and videos by meaning, then go straight to the matching page or moment.',
        platforms: 'Windows · macOS · Linux · Free and open source',
      },
      highlights: [
        {
          icon: 'search',
          title: 'Search by meaning',
          description:
            'Type “a library notice about opening hours” and find it, even if the file is called scan_0042.pdf.',
        },
        {
          icon: 'translate',
          title: 'Across Chinese and English',
          description: 'Describe it in one language and find content written in the other.',
        },
        {
          icon: 'scan',
          title: 'Reads text in pictures',
          description:
            'Words in photos, screenshots and scanned PDFs become searchable, in English and Simplified or Traditional Chinese.',
        },
        {
          icon: 'waveform',
          title: 'Sounds and scenes too',
          description:
            'Find a dog barking in a recording or heavy rain in a video, then play from that moment.',
        },
        {
          icon: 'eye',
          title: 'Jump to the exact spot',
          description:
            'Preview the matching passage or PDF page, or play from the matching moment, before you open anything.',
        },
        {
          icon: 'lock',
          title: 'Stays on your computer',
          description:
            'Reading, indexing and AI matching all happen on your machine. Your files are never uploaded.',
        },
      ],
      examples: {
        title: 'Search the way you remember',
        intro:
          'These sample queries, in Chinese and English, come from the app’s automated tests. Each one is shown with what it finds.',
        items: [
          {
            prompt: 'Instructions for storing garden seeds',
            outcome: 'A plain text note, found by meaning',
          },
          { prompt: 'A library notice about opening hours', outcome: 'The right page of a PDF' },
          {
            prompt: 'A sign asking people to keep an exit clear',
            outcome: 'An image of a Chinese sign, read with text recognition',
          },
          { prompt: 'The Earth seen from space', outcome: 'A photo, found by what it shows' },
          { prompt: 'A dog barking', outcome: 'The part of a recording where a dog barks' },
          { prompt: 'Heavy rain falling outdoors', outcome: 'The scene in a video' },
        ],
      },
      facts: {
        title: 'What it understands',
        note: 'Spreadsheets and slide decks are not supported yet. Audio is matched by sound and is not transcribed.',
        items: [
          { value: '8', label: 'document formats, including PDF and Word' },
          {
            value: '3',
            label: 'text recognition languages: English, Simplified and Traditional Chinese',
          },
          { value: '19', label: 'camera RAW photo formats, plus HEIC' },
          { value: '~90', label: 'kinds of code files, plus Jupyter notebooks' },
        ],
      },
      steps: {
        title: 'Three steps to start',
        items: [
          {
            title: 'Choose your folders',
            description: 'Pick the folders to search. Everything else stays out of the index.',
          },
          {
            title: 'Let it read',
            description:
              'It builds its index in the background, and keyword search works without a model. Download the model once (under 1 GB), or import it offline, to search by meaning.',
          },
          {
            title: 'Describe, then jump',
            description:
              'Write what you remember and the preview opens at the matching page, passage or moment. Press Ctrl+Shift+Space from any app for quick search (Control+Shift+Space on a Mac too).',
          },
        ],
      },
      privacy: {
        title: 'Private by design',
        intro: 'Once its model is in place, QCopilots Search works fully offline.',
        points: [
          {
            title: 'Files never leave your computer',
            description: 'Reading, text recognition, indexing and AI matching all run locally.',
          },
          {
            title: 'Only two kinds of network use',
            description: 'The one-time model download, and an update check you can turn off.',
          },
          {
            title: 'Your files are left alone',
            description: 'Removing a folder from the index never deletes anything in it.',
          },
        ],
        note: 'It shows you your own files. It never writes answers or makes things up.',
      },
      requirements: [
        {
          label: 'Windows',
          value: 'Windows 10 (1809 or later) or 11, x64. Installer or portable version',
        },
        { label: 'macOS', value: 'macOS 14.4 or later on Apple silicon' },
        {
          label: 'Linux',
          value:
            'x64, DEB package or portable version. Ubuntu 22.04 or later, and 24.04 or later for the NVIDIA and AMD graphics builds',
        },
        {
          label: 'Graphics',
          value:
            'Optional. Separate builds support NVIDIA cards, the AMD RX 9000 series or general Vulkan acceleration, and the Mac version uses Metal. Every build also runs on the CPU alone',
        },
        { label: 'License', value: 'Free and open source (MIT)' },
      ],
      faq: [
        {
          question: 'Does it search the internet?',
          answer:
            'No. It searches only the folders you choose on your own computer. It is not a web search engine or a chatbot.',
        },
        {
          question: 'What kinds of files can it search?',
          answer:
            'Documents (PDF, Word, ODT, RTF, HTML, Markdown and plain text), photos including HEIC and camera RAW, audio, video, and code once you turn it on in Settings. Spreadsheets and slide decks are not supported yet.',
        },
        {
          question: 'Can it find what was said in a recording?',
          answer:
            'Not word for word. Audio is matched by its sound in 30-second windows, so “a dog barking” works, but speech is not transcribed.',
        },
        {
          question: 'Will a file open at the matching page?',
          answer:
            'The built-in preview goes to the matching page, passage or moment. The system’s default app only opens the file. Choose an app such as SumatraPDF, Skim, Okular or mpv in Settings to land on the same spot there.',
        },
        {
          question: 'Do I need a graphics card?',
          answer:
            'No. Every version runs on the CPU. With a supported graphics card and the matching download, indexing can use the card to go faster.',
        },
        {
          question: 'Why does macOS warn me the first time?',
          answer:
            'The macOS version is not notarized by Apple yet. If macOS blocks it, open System Settings, go to Privacy & Security and choose Open Anyway.',
        },
        {
          question: 'Is it free?',
          answer: 'Yes. QCopilots Search is free and open source under the MIT license.',
        },
      ],
      downloads: {
        title: 'Download QCopilots Search',
        description:
          'Version 0.3.0 is on GitHub. Pick the build for your system, then download or import the model inside the app.',
      },
      demo: {
        caption: 'An illustration of QCopilots Search',
        windowTitle: 'QCopilots Search',
        placeholder: 'Search documents, images, sounds and moments…',
        labels: {
          subtitle: 'Find the meaning in your files. Local, private, multilingual.',
          quick: 'Quick search',
          model: 'Model ready',
          settings: 'Settings',
          all: 'All file types',
          folders: 'All folders',
          code: 'Code search',
          results: 'Results: {count} · semantic + keywords',
          semantic: 'Semantic',
          keyword: 'Keywords',
          both: 'Semantic + keywords',
          open: 'Open file',
          reveal: 'Show in folder',
          ready: 'Index ready 2316 / 2316',
          shortcut: 'Quick search: Ctrl+Shift+Space · Search: Ctrl+F',
        },
        scenes: [
          {
            query: 'A library notice about opening hours',
            steps: [
              'Page 2',
              'New reading room hours',
              'From March, the reading room opens every day at 8:30 am and closes at 9 pm.',
              'Holiday hours will be posted separately.',
            ],
            results: [
              {
                title: 'scan_0042.pdf',
                meta: 'Documents › Notices · Page 2',
                kind: 'pdf',
                match: 'semantic',
              },
              {
                title: 'closing-day-sign.png',
                meta: 'Pictures › Notices',
                kind: 'image',
                match: 'semantic',
              },
              {
                title: 'term-notices.docx',
                meta: 'Documents › Notices',
                kind: 'text',
                match: 'both',
              },
            ],
          },
          {
            query: 'A dog barking',
            steps: ['0:50 / 3:12'],
            results: [
              {
                title: 'park-walk.ogg',
                meta: 'Recordings › Weekend · 50.0 s',
                kind: 'audio',
                match: 'semantic',
              },
              {
                title: 'puppy-birthday.mp4',
                meta: 'Videos › Family · 150.0 s',
                kind: 'video',
                match: 'semantic',
              },
            ],
          },
          {
            query: 'The Earth seen from space',
            steps: ['Fit · 12%'],
            results: [
              {
                title: 'IMG_2041.HEIC',
                meta: 'Pictures › Travel',
                kind: 'image',
                match: 'semantic',
              },
              {
                title: 'astronomy-talk.pdf',
                meta: 'Documents › Courses · Page 7',
                kind: 'pdf',
                match: 'both',
              },
            ],
          },
          {
            query: 'Heavy rain falling outdoors',
            steps: ['1:15 / 4:06'],
            results: [
              {
                title: 'camping-day-2.mp4',
                meta: 'Videos › Camping · 75.0 s',
                kind: 'video',
                match: 'semantic',
              },
              {
                title: 'rainy-night.m4a',
                meta: 'Recordings · 25.0 s',
                kind: 'audio',
                match: 'semantic',
              },
              {
                title: 'weather-notes.md',
                meta: 'Documents › Notes',
                kind: 'text',
                match: 'keyword',
              },
            ],
          },
        ],
      },
    },
  },
  downloads: [
    {
      id: 'search-windows',
      platform: 'windows',
      label: { zh: 'Windows', en: 'Windows' },
      url: releases,
      requirements: { zh: 'Windows 10 1809+ / 11 · x64', en: 'Windows 10 1809+ / 11 · x64' },
      architecture: 'x64',
      version: '0.3.0',
    },
    {
      id: 'search-macos',
      platform: 'macos',
      label: { zh: 'macOS', en: 'macOS' },
      url: releases,
      requirements: { zh: 'macOS 14.4+ · Apple 芯片', en: 'macOS 14.4+ · Apple silicon' },
      architecture: 'arm64',
      version: '0.3.0',
    },
    {
      id: 'search-linux',
      platform: 'linux',
      label: { zh: 'Linux', en: 'Linux' },
      url: releases,
      requirements: { zh: 'x64 · DEB 或便携版', en: 'x64 · DEB or portable' },
      architecture: 'x64',
      version: '0.3.0',
    },
  ],
} satisfies Product;
