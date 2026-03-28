"use client";

import { useI18n, Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ scrolled }: { scrolled: boolean }) {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    setLocale(locale === "en" ? "ar" : "en" as Locale);
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 ${
        scrolled
          ? "border-ocean-300 text-ocean-700 hover:bg-ocean-50"
          : "border-white/40 text-white hover:bg-white/10"
      }`}
    >
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
