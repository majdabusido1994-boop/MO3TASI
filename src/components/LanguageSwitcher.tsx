"use client";

import { useI18n, Locale } from "@/lib/i18n";

const LANGS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "ar", label: "ع" },
];

export default function LanguageSwitcher({ scrolled }: { scrolled: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={`inline-flex rounded-full border p-0.5 transition-all duration-300 ${
        scrolled ? "border-ocean-300 bg-white/60" : "border-white/40 bg-white/10"
      }`}
    >
      {LANGS.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            aria-label={l.code}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer min-w-[28px] ${
              active
                ? scrolled
                  ? "bg-ocean-900 text-white"
                  : "bg-white text-ocean-900"
                : scrolled
                ? "text-ocean-600 hover:text-ocean-900"
                : "text-white/80 hover:text-white"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
