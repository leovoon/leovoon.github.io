import type { ColumnDef } from '@tanstack/react-table';

export type Locale = 'en' | 'zh';

export const columnKeys = [
  'language',
  'coreQuestion',
  'philosophy',
  'whereItRuns',
  'mentalModel',
] as const;

export type ColumnKey = (typeof columnKeys)[number];

export type LanguageRow = {
  id: string;
  language: string;
  coreQuestion: string;
  philosophy: string;
  whereItRuns: string;
  mentalModel: string;
};

export type PuzzleTile = {
  id: string;
  rowId: string;
  columnKey: ColumnKey;
  columnHeader: string;
  rowLabel: string;
  value: string;
};

type ColumnMeta = Array<{ key: ColumnKey; header: string }>;
type ColumnSizing = {
  size: number;
  minSize: number;
  maxSize: number;
};

const columnMetaByLocale: Record<Locale, ColumnMeta> = {
  en: [
    { key: 'language', header: 'Language' },
    { key: 'coreQuestion', header: 'Core Question' },
    { key: 'philosophy', header: 'Philosophy' },
    { key: 'whereItRuns', header: 'Where It Runs' },
    { key: 'mentalModel', header: 'Mental Model' },
  ],
  zh: [
    { key: 'language', header: '语言' },
    { key: 'coreQuestion', header: '核心问题' },
    { key: 'philosophy', header: '哲学' },
    { key: 'whereItRuns', header: '运行环境' },
    { key: 'mentalModel', header: '心智模型' },
  ],
};

const languageRowsByLocale: Record<Locale, LanguageRow[]> = {
  en: [
    {
      id: 'js',
      language: 'JS',
      coreQuestion: 'How can I express ideas and connect the world quickly?',
      philosophy: 'Free, flexible, product-minded',
      whereItRuns: 'Browser + Node.js runtime. Frontend runs in browsers; backend can run on Node.js, Bun, or Deno.',
      mentalModel: 'A browser stage that can also step into the server kitchen.',
    },
    {
      id: 'php',
      language: 'PHP',
      coreQuestion: 'How can I make a web page come alive quickly?',
      philosophy: 'Grassroots, practical, request-response',
      whereItRuns: 'On a web server, usually through PHP-FPM, an Apache module, CLI, or Laravel/Symfony worker modes.',
      mentalModel: 'The back kitchen of a web server: receive the request, cook the page, serve it out.',
    },
    {
      id: 'java',
      language: 'Java',
      coreQuestion: 'How can complex systems be maintained by organizations for years?',
      philosophy: 'Contracts, order, stability, scale',
      whereItRuns: 'On the JVM. Write Java, run on the Java Virtual Machine, and deploy to servers, older Android ecosystems, and enterprise systems.',
      mentalModel: 'A durable enterprise building running steadily inside the JVM.',
    },
    {
      id: 'rust',
      language: 'Rust',
      coreQuestion: 'How can I get close to the machine safely?',
      philosophy: 'Ownership, boundaries, responsibility',
      whereItRuns: 'Compiled native binary. It becomes machine code for operating systems, servers, embedded devices, and WebAssembly.',
      mentalModel: 'Going straight onto the machine battlefield, but wearing compiler armor.',
    },
    {
      id: 'zig',
      language: 'Zig',
      coreQuestion: 'How can I see the machine clearly?',
      philosophy: 'Transparent, explicit, low-magic',
      whereItRuns: 'Compiled native binary. Especially strong at cross-compilation across different operating systems and CPUs.',
      mentalModel: 'Facing the machine directly, like an engineer holding a clear map.',
    },
    {
      id: 'odin',
      language: 'Odin',
      coreQuestion: 'How can writing modern C feel comfortable?',
      philosophy: 'Data-oriented, pragmatic, high-performance',
      whereItRuns: 'Compiled native binary. Often used for games, graphics, tools, and system-level programs.',
      mentalModel: 'A high-performance workshop on the local machine, especially suited to games and graphics.',
    },
    {
      id: 'lean',
      language: 'Lean',
      coreQuestion: 'How can I know that what I am saying is true?',
      philosophy: 'Proof, trust, small gates',
      whereItRuns: 'Lean environment, compiler, and theorem prover. It mainly lives in proof environments; some programs can compile and run, but its core home is formal verification.',
      mentalModel: 'A proof laboratory, built less to run business logic and more to confirm that this is really true.',
    },
    {
      id: 'go',
      language: 'Go',
      coreQuestion: 'How can I run services simply, steadily, and concurrently?',
      philosophy: 'Simple, clear, concurrent, engineering-pragmatic',
      whereItRuns: 'Compiled native binary. Usually runs on servers, cloud, containers, CLIs, and infrastructure tooling, with a runtime and garbage collector.',
      mentalModel: 'A cloud service workshop: fewer language tricks, more steady delivery.',
    },
    {
      id: 'ocaml',
      language: 'OCaml',
      coreQuestion: 'How can types and functions compress complex logic into clear structure?',
      philosophy: 'Functional, type inference, immutable, logically clear',
      whereItRuns: 'Compiled native binary or bytecode. Common in compilers, static analysis, financial systems, DSLs, formal toolchains, and backend services.',
      mentalModel: 'A logic workshop that folds complex possibilities into clear types, then quietly transforms them with functions.',
    },
    {
      id: 'haskell',
      language: 'Haskell',
      coreQuestion: 'How can I make programs as pure, composable, and easy to reason about as possible?',
      philosophy: 'Pure functions, lazy evaluation, high abstraction, mathematical feel',
      whereItRuns: 'Compiled by GHC into native binaries, or run interactively through GHCi. Common in research, compilers, finance, DSLs, and highly abstract systems.',
      mentalModel: 'An abstraction monastery that keeps side effects behind type boundaries, leaving the core computation pure.',
    },
    {
      id: 'typescript',
      language: 'TypeScript',
      coreQuestion: 'How can I keep the creative speed of JS while seeing structural errors early?',
      philosophy: 'Gradual typing, engineering guardrails, maintainable freedom',
      whereItRuns: 'Does not run directly. It is usually compiled to JavaScript, then runs in browsers, Node.js, Bun, or Deno.',
      mentalModel: 'A removable skeleton for JS, keeping freedom from collapsing as the project grows.',
    },
    {
      id: 'ruby',
      language: 'Ruby',
      coreQuestion: 'How can programs express themselves elegantly and naturally, almost like language?',
      philosophy: 'Expressiveness, developer happiness, dynamic style, elegance, convention over configuration',
      whereItRuns: 'On the Ruby VM or interpreter. Common in Rails web apps, scripts, automation, and backend services.',
      mentalModel: "A web workshop where expression feels smooth and the language stays out of the person's way.",
    },
    {
      id: 'python',
      language: 'Python',
      coreQuestion: 'How can I turn ideas into programs quickly, clearly, and with little friction?',
      philosophy: 'Readability, simplicity, general-purpose use, glue language, beginner-friendly',
      whereItRuns: 'On the Python interpreter or runtime. Common in scripts, automation, data science, AI, backends, CLIs, teaching, and research.',
      mentalModel: 'A universal toolbox for quickly gluing together ideas, data, files, APIs, and models.',
    },
  ],
  zh: [
    {
      id: 'js',
      language: 'JS',
      coreQuestion: '怎样快速表达和连接世界？',
      philosophy: '自由、灵活、产品感',
      whereItRuns: 'Browser + Node.js runtime。前端跑在浏览器，后端可跑在 Node.js、Bun、Deno',
      mentalModel: '浏览器舞台，也可以进服务器厨房',
    },
    {
      id: 'php',
      language: 'PHP',
      coreQuestion: '怎样让网页快速活起来？',
      philosophy: '草根、实用、request-response',
      whereItRuns: 'Web server 上，通常通过 PHP-FPM、Apache module、CLI，也可跑在 Laravel/Symfony worker 模式',
      mentalModel: 'Web server 的后厨，接请求、煮页面、端出去',
    },
    {
      id: 'java',
      language: 'Java',
      coreQuestion: '怎样让复杂系统长期被组织维护？',
      philosophy: '契约、秩序、稳定、规模化',
      whereItRuns: 'JVM 上。写 Java，跑在 Java Virtual Machine，可以部署在服务器、Android 旧生态、企业系统',
      mentalModel: 'JVM 这栋企业大楼里，稳定长期运转',
    },
    {
      id: 'rust',
      language: 'Rust',
      coreQuestion: '怎样安全地接近底层？',
      philosophy: '所有权、边界、责任',
      whereItRuns: 'Compiled native binary。编译成机器码，跑在 OS、server、embedded、WebAssembly',
      mentalModel: '直接上机器战场，但穿着编译器盔甲',
    },
    {
      id: 'zig',
      language: 'Zig',
      coreQuestion: '怎样清楚地看见机器？',
      philosophy: '透明、显式、少魔法',
      whereItRuns: 'Compiled native binary。也很强在 cross-compilation，能直接面向不同 OS/CPU',
      mentalModel: '直接面对机器，像拿着清晰地图的工程师',
    },
    {
      id: 'odin',
      language: 'Odin',
      coreQuestion: '怎样舒服地写现代 C？',
      philosophy: '数据导向、务实、高性能',
      whereItRuns: 'Compiled native binary。常用于游戏、图形、工具、系统级程序',
      mentalModel: '本地机器上的高性能工坊，特别适合游戏和图形',
    },
    {
      id: 'lean',
      language: 'Lean',
      coreQuestion: '怎样确定我说的是对的？',
      philosophy: '证明、可信、小门',
      whereItRuns: 'Lean environment / compiler / theorem prover。主要跑在证明环境里，也能编译执行部分程序，但核心场域是形式化验证',
      mentalModel: '证明实验室，主要不是为了跑业务，而是为了确认这是真的',
    },
    {
      id: 'go',
      language: 'Go',
      coreQuestion: '怎样把服务简单、稳定、并发地跑起来？',
      philosophy: '简单、清楚、并发、工程务实',
      whereItRuns: 'Compiled native binary。通常跑在 server、cloud、container、CLI、infra tooling，也有 runtime 和 garbage collector',
      mentalModel: '云端服务车间，少一点语言花样，多一点稳定交付',
    },
    {
      id: 'ocaml',
      language: 'OCaml',
      coreQuestion: '怎样用类型和函数，把复杂逻辑压成清晰结构？',
      philosophy: '函数式、类型推理、不可变、逻辑清晰',
      whereItRuns: 'Compiled native binary 或 bytecode。常见于编译器、静态分析、金融系统、DSL、形式化工具链，也可用于后端服务',
      mentalModel: '逻辑工坊，把复杂可能性折成清楚的类型，再用函数安静地转换',
    },
    {
      id: 'haskell',
      language: 'Haskell',
      coreQuestion: '怎样让程序尽可能纯、可组合、可推理？',
      philosophy: '纯函数、惰性求值、高抽象、数学感',
      whereItRuns: 'GHC 编译成 native binary，或通过 GHCi 交互运行。常见于研究、编译器、金融、DSL、高抽象系统',
      mentalModel: '抽象修道院，把副作用关进类型边界，让核心计算保持纯净',
    },
    {
      id: 'typescript',
      language: 'TypeScript',
      coreQuestion: '怎样保留 JS 的创造速度，同时提前看见结构错误？',
      philosophy: '渐进类型、工程护栏、可维护的自由',
      whereItRuns: '不直接运行，通常先编译成 JavaScript，再跑在 Browser、Node.js、Bun、Deno',
      mentalModel: '给 JS 加一副可拆卸骨架，让自由在项目变大后不塌掉',
    },
    {
      id: 'ruby',
      language: 'Ruby',
      coreQuestion: '怎样让程序像自然语言一样优雅、顺手地表达？',
      philosophy: '表达力、开发者幸福感、动态、优雅、约定优于配置',
      whereItRuns: 'Ruby VM / interpreter 上。常见于 Rails web app、脚本、自动化、后端服务',
      mentalModel: '一间表达顺手的 web 工坊，语言尽量不挡住人的思路',
    },
    {
      id: 'python',
      language: 'Python',
      coreQuestion: '怎样用清楚、低阻力的方式，把想法快速变成程序？',
      philosophy: '可读性、简洁、通用、胶水语言、学习友好',
      whereItRuns: 'Python interpreter / runtime 上。常见于脚本、自动化、数据科学、AI、后端、CLI、教学、科研',
      mentalModel: '万能工具箱，把想法、数据、文件、API 和模型快速粘起来',
    },
  ],
};

const columnSizingByKey = {
  language: {
    size: 118,
    minSize: 88,
    maxSize: 180,
  },
  coreQuestion: {
    size: 270,
    minSize: 178,
    maxSize: 440,
  },
  philosophy: {
    size: 208,
    minSize: 150,
    maxSize: 340,
  },
  whereItRuns: {
    size: 360,
    minSize: 220,
    maxSize: 560,
  },
  mentalModel: {
    size: 315,
    minSize: 200,
    maxSize: 500,
  },
} as const satisfies Record<ColumnKey, ColumnSizing>;

export const languageCount = languageRowsByLocale.en.length;
export const cellCount = languageCount * columnKeys.length;

export function getColumnMeta(locale: Locale): ColumnMeta {
  return columnMetaByLocale[locale];
}

export function getLanguageRows(locale: Locale): LanguageRow[] {
  return languageRowsByLocale[locale];
}

export function getColumns(locale: Locale): ColumnDef<LanguageRow>[] {
  return getColumnMeta(locale).map((column) => ({
    accessorKey: column.key,
    header: column.header,
    ...columnSizingByKey[column.key],
  }));
}

export function makeCellId(rowId: string, columnKey: ColumnKey): string {
  return `${rowId}.${columnKey}`;
}

export function buildPuzzleTiles(locale: Locale): PuzzleTile[] {
  return getLanguageRows(locale).flatMap((row) =>
    getColumnMeta(locale).map((column) => ({
      id: makeCellId(row.id, column.key),
      rowId: row.id,
      columnKey: column.key,
      columnHeader: column.header,
      rowLabel: row.language,
      value: row[column.key],
    })),
  );
}
