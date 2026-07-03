CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_entries (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  core_question TEXT NOT NULL,
  philosophy TEXT NOT NULL,
  where_it_runs TEXT NOT NULL,
  mental_model TEXT NOT NULL,
  UNIQUE (language_id, locale),
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_locale ON language_entries(locale);
CREATE INDEX IF NOT EXISTS idx_entries_language ON language_entries(language_id);

-- Full-text search
CREATE TABLE IF NOT EXISTS language_search (
  language_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  search_text TEXT NOT NULL,
  UNIQUE (language_id, locale),
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_search_text ON language_search USING gin(to_tsvector('simple', search_text));
