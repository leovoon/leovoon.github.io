import { useEffect, useState, type ReactElement } from 'react';
import { cellCount, languageCount, type Locale } from '../data/languagePuzzle.js';
import { copy, defaultLocale, localeStorageKey, normalizeLocale } from '../lib/i18n.js';
import LanguagePuzzleTable from './LanguagePuzzleTable.js';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const storedLocale = window.localStorage.getItem(localeStorageKey);
  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }

  return normalizeLocale(window.navigator.language);
}

export default function LanguagePuzzleApp(): ReactElement {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const text = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = text.pageTitle;
    window.localStorage.setItem(localeStorageKey, locale);

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = text.pageDescription;
    }
  }, [locale, text.pageDescription, text.pageTitle]);

  return (
    <>
      <section className="app-hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <h1 id="page-title">{text.pageTitle}</h1>
        </div>
        <div className="hero-actions">
          <div className="hero-stats" aria-label={text.hero.puzzleSummary}>
            <span>
              <strong>{languageCount}</strong> {text.hero.languages}
            </span>
            <span>
              <strong>{cellCount}</strong> {text.hero.cells}
            </span>
            <span>
              <strong>1</strong> {text.hero.table}
            </span>
          </div>
          <div className="language-switcher" aria-label={text.languageSwitcher.label}>
            <button
              type="button"
              className="language-option"
              data-active={locale === 'en'}
              onClick={() => setLocale('en')}
              aria-pressed={locale === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className="language-option"
              data-active={locale === 'zh'}
              onClick={() => setLocale('zh')}
              aria-pressed={locale === 'zh'}
            >
              中文
            </button>
          </div>
          <a
            className="github-link"
            href="https://github.com/leovoon/leovoon.github.io"
            target="_blank"
            rel="noreferrer"
            aria-label={text.hero.github}
            title={text.hero.github}
          >
            <svg className="github-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.86 8.35 6.83 9.7.5.09.68-.22.68-.49v-1.86c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.28 9.28 0 0 1 12 6.96c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9v2.77c0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
        </div>
      </section>

      <LanguagePuzzleTable locale={locale} />
    </>
  );
}
