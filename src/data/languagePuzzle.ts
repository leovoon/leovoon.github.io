import type { ColumnDef } from '@tanstack/react-table';

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

export const columnMeta: Array<{ key: ColumnKey; header: string }> = [
  { key: 'language', header: 'Language' },
  { key: 'coreQuestion', header: 'Core Question' },
  { key: 'philosophy', header: 'Philosophy' },
  { key: 'whereItRuns', header: 'Where It Runs' },
  { key: 'mentalModel', header: 'Mental Model' },
];

export const languageRows: LanguageRow[] = [
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
];

export const languageCount = languageRows.length;
export const cellCount = languageRows.length * columnMeta.length;

export const columns: ColumnDef<LanguageRow>[] = columnMeta.map((column) => ({
  accessorKey: column.key,
  header: column.header,
}));

export function makeCellId(rowId: string, columnKey: ColumnKey): string {
  return `${rowId}.${columnKey}`;
}

export function buildPuzzleTiles(): PuzzleTile[] {
  return languageRows.flatMap((row) =>
    columnMeta.map((column) => ({
      id: makeCellId(row.id, column.key),
      rowId: row.id,
      columnKey: column.key,
      columnHeader: column.header,
      rowLabel: row.language,
      value: row[column.key],
    })),
  );
}
