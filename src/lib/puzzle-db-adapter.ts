import {
  getColumnMeta,
  type ColumnKey,
  type Locale,
  type PuzzleTile,
} from '../data/languagePuzzle.js';
import { getEntries, type LanguageEntry } from './pglite-db.js';

function entryToTiles(entry: LanguageEntry, locale: Locale): PuzzleTile[] {
  const meta = getColumnMeta(locale);
  const headerMap = new Map(meta.map((m) => [m.key, m.header]));
  const rowId = entry.id;
  const rowLabel = entry.code;

  const valueOf = (key: ColumnKey): string => {
    if (key === 'language') return entry.code;
    return ((entry as unknown) as Record<string, string>)[key] ?? '';
  };

  return meta.map((m) => ({
    id: `${rowId}.${m.key}`,
    rowId,
    columnKey: m.key,
    columnHeader: headerMap.get(m.key) ?? m.key,
    rowLabel,
    value: valueOf(m.key),
  }));
}

export async function getPuzzleTilesFromDb(locale: Locale): Promise<PuzzleTile[]> {
  const entries = await getEntries(locale);
  return entries.flatMap((entry) => entryToTiles(entry, locale));
}
