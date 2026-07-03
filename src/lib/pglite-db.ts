import { PGlite } from '@electric-sql/pglite';

let dbPromise: Promise<PGlite> | null = null;

const DB_BASE_URL = '/pglite';
const DB_DATA_FILE = `${DB_BASE_URL}/pglite.data`;

async function loadPGLite(): Promise<PGlite> {
  const response = await fetch(DB_DATA_FILE);
  if (!response.ok) {
    throw new Error(`Failed to fetch PGLite data dir: ${response.status}`);
  }
  const blob = await response.blob();
  dbPromise = PGlite.create({ loadDataDir: blob });
  return dbPromise;
}

export function getPuzzleDb(): Promise<PGlite> {
  if (!dbPromise) {
    dbPromise = loadPGLite();
  }
  return dbPromise;
}

export interface LanguageSummary {
  id: string;
  code: string;
}

export interface LanguageEntry extends LanguageSummary {
  locale: string;
  coreQuestion: string;
  philosophy: string;
  whereItRuns: string;
  mentalModel: string;
}

export async function getLanguages(): Promise<LanguageSummary[]> {
  const db = await getPuzzleDb();
  const result = await db.query<{ id: string; code: string }>(
    `SELECT id, code FROM languages ORDER BY code`
  );
  return result.rows;
}

export async function getEntries(locale: string): Promise<LanguageEntry[]> {
  const db = await getPuzzleDb();
  const result = await db.query<LanguageEntry>(
    `SELECT
       l.id AS id,
       l.code AS code,
       e.locale AS locale,
       e.core_question AS "coreQuestion",
       e.philosophy AS philosophy,
       e.where_it_runs AS "whereItRuns",
       e.mental_model AS "mentalModel"
     FROM languages l
     INNER JOIN language_entries e ON e.language_id = l.id
     WHERE e.locale = $1
     ORDER BY l.code`,
    [locale]
  );
  return result.rows;
}

export interface SearchHit {
  id: string;
  code: string;
  locale: string;
  rank: number;
}

export async function searchLanguages(
  query: string,
  locale: string,
  limit = 20
): Promise<SearchHit[]> {
  const db = await getPuzzleDb();
  const result = await db.query<SearchHit>(
    `SELECT
       l.id AS id,
       l.code AS code,
       s.locale AS locale,
       ts_rank(to_tsvector('simple', s.search_text), plainto_tsquery('simple', $1)) AS rank
     FROM language_search s
     INNER JOIN languages l ON l.id = s.language_id
     WHERE s.locale = $2
       AND to_tsvector('simple', s.search_text) @@ plainto_tsquery('simple', $1)
     ORDER BY rank DESC
     LIMIT $3`,
    [query, locale, limit]
  );
  return result.rows;
}

export async function searchLanguagesByTrait(
  trait: 'philosophy' | 'where_it_runs' | 'core_question' | 'mental_model',
  value: string,
  locale: string
): Promise<SearchHit[]> {
  const db = await getPuzzleDb();
  const result = await db.query<SearchHit>(
    `SELECT
       l.id AS id,
       l.code AS code,
       e.locale AS locale,
       1.0 AS rank
     FROM language_entries e
     INNER JOIN languages l ON l.id = e.language_id
     WHERE e.locale = $1
       AND LOWER(e.${trait}) LIKE LOWER($2)
     ORDER BY l.code`,
    [locale, `%${value}%`]
  );
  return result.rows;
}
