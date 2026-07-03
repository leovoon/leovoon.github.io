import { PGlite } from '@electric-sql/pglite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const schema = readFileSync('src/db/schema.sql', 'utf-8');

async function seed() {
  const db = new PGlite();

  await db.exec(schema);

  const locales = ['en', 'zh'] as const;
  const { getLanguageRows } = await import('../src/data/languagePuzzle.ts');

  for (const locale of locales) {
    const rows = getLanguageRows(locale);

    for (const row of rows) {
      await db.query(
        `INSERT INTO languages (id, code) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.language]
      );

      const entryId = `${row.id}.${locale}`;

      await db.query(
        `INSERT INTO language_entries
         (id, language_id, locale, core_question, philosophy, where_it_runs, mental_model)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (language_id, locale) DO UPDATE SET
           core_question = EXCLUDED.core_question,
           philosophy = EXCLUDED.philosophy,
           where_it_runs = EXCLUDED.where_it_runs,
           mental_model = EXCLUDED.mental_model`,
        [
          entryId,
          row.id,
          locale,
          row.coreQuestion,
          row.philosophy,
          row.whereItRuns,
          row.mentalModel,
        ]
      );

      const searchText = [
        row.language,
        row.coreQuestion,
        row.philosophy,
        row.whereItRuns,
        row.mentalModel,
      ].join(' ');

      await db.query(
        `INSERT INTO language_search (language_id, locale, search_text)
         VALUES ($1, $2, $3)
         ON CONFLICT (language_id, locale) DO UPDATE SET
           search_text = EXCLUDED.search_text`,
        [row.id, locale, searchText]
      );
    }
  }

  const dumpFile = await db.dumpDataDir();
  const dump = new Uint8Array(await dumpFile.arrayBuffer());
  const outDir = 'public/pglite';
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(join(outDir, 'pglite.data'), dump);
  const sizeMb = (dump.byteLength / (1024 * 1024)).toFixed(2);
  console.log(`Database seeded: ${outDir}/pglite.data (${sizeMb} MB)`);

  await db.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
