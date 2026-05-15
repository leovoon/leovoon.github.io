import type { Locale } from '../data/languagePuzzle.js';

export const defaultLocale: Locale = 'en';
export const localeStorageKey = 'language-puzzle-locale';

export const copy = {
  en: {
    pageTitle: 'Learn the programming language',
    pageDescription:
      'An interactive TanStack Table puzzle for matching programming languages to their core questions, philosophy, runtime, and mental model.',
    hero: {
      puzzleSummary: 'Puzzle summary',
      languages: 'languages',
      cells: 'cells',
      table: 'table',
      github: 'Open GitHub repository',
    },
    languageSwitcher: {
      label: 'Language',
      english: 'English',
      chinese: '中文',
    },
    puzzle: {
      label: 'Language runtime puzzle',
      progress: 'Progress',
      shuffle: 'Shuffle remaining tiles',
      shuffleTitle: 'Shuffle',
      reset: 'Reset puzzle',
      resetTitle: 'Reset',
      selected: 'Selected',
      cancelSelected: 'Cancel selected tile',
      cancelTitle: 'Cancel',
      skeletonTable: 'Skeleton table',
      table: 'Table',
      showTilePicker: 'Show tile picker',
      goBackTitle: 'Go back',
      complete: 'Complete. Every slot is filled.',
      tilesLeft: 'tiles left',
      pickTile: 'Pick tile',
      showTable: 'Show table',
      remove: 'Remove',
      removeFrom: 'Remove tile from',
      showRemoveOption: 'show remove option',
      row: 'Row',
      dragStart: 'Tile picked up.',
      dragEnd: 'Tile dropped.',
      dragCancel: 'Tile cancelled.',
      chooseSlot: 'Choose a table slot for that tile.',
      slotFilled: 'That slot is already filled.',
      wrongSlot: 'That tile does not fit this slot.',
      pickFirst: 'Pick a tile first.',
    },
  },
  zh: {
    pageTitle: '学习编程语言',
    pageDescription:
      '一个交互式 TanStack Table 拼图：把编程语言和它们的核心问题、哲学、运行环境、心智模型配对。',
    hero: {
      puzzleSummary: '拼图摘要',
      languages: '种语言',
      cells: '个格子',
      table: '张表',
      github: '打开 GitHub 仓库',
    },
    languageSwitcher: {
      label: '语言',
      english: 'English',
      chinese: '中文',
    },
    puzzle: {
      label: '语言运行环境拼图',
      progress: '进度',
      shuffle: '打乱剩余卡片',
      shuffleTitle: '打乱',
      reset: '重置拼图',
      resetTitle: '重置',
      selected: '已选',
      cancelSelected: '取消已选卡片',
      cancelTitle: '取消',
      skeletonTable: '空白表格',
      table: '表格',
      showTilePicker: '显示卡片区',
      goBackTitle: '返回',
      complete: '完成。每个空格都填好了。',
      tilesLeft: '张卡片剩余',
      pickTile: '选择卡片',
      showTable: '显示表格',
      remove: '移除',
      removeFrom: '从这里移除卡片：',
      showRemoveOption: '显示移除选项',
      row: '第',
      dragStart: '已拿起卡片。',
      dragEnd: '已放下卡片。',
      dragCancel: '已取消卡片。',
      chooseSlot: '请为这张卡片选择一个表格空格。',
      slotFilled: '这个空格已经填好了。',
      wrongSlot: '这张卡片不适合这个空格。',
      pickFirst: '请先选择一张卡片。',
    },
  },
} as const satisfies Record<Locale, object>;

export function normalizeLocale(value: string | null | undefined): Locale {
  return value?.toLowerCase().startsWith('zh') ? 'zh' : defaultLocale;
}
