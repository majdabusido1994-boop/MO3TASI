"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Locale = "en" | "ar";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

interface Testimonial {
  name: string;
  text: string;
  role: string;
}

interface ServiceDetail {
  title: string;
  description: string;
  benefits: string[];
  audience: string;
}

export interface Dictionary {
  nav: {
    home: string;
    about: string;
    services: string;
    booking: string;
    philosophy: string;
    blog: string;
    contact: string;
  };
  hero: {
    name: string;
    tagline: string;
    cta1: string;
    cta2: string;
  };
  home: {
    introTitle: string;
    introText: string;
    servicesTitle: string;
    quoteText: string;
    testimonialsTitle: string;
    instagramTitle: string;
    instagramCta: string;
  };
  about: {
    title: string;
    subtitle: string;
    story: Record<string, string>;
    certificationsTitle: string;
    certifications: string[];
  };
  services: {
    title: string;
    subtitle: string;
    therapy: ServiceDetail;
    massage: ServiceDetail;
    surf: ServiceDetail;
    bookNow: string;
  };
  booking: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      phone: string;
      service: string;
      serviceOptions: string[];
      date: string;
      time: string;
      message: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      whatsappFallback: string;
    };
    modeForm: string;
    modeCalendly: string;
  };
  philosophy: {
    title: string;
    subtitle: string;
    content: Record<string, string>;
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    backToJournal: string;
    posts: BlogPost[];
  };
  contact: {
    title: string;
    subtitle: string;
    whatsapp: string;
    email: string;
    instagram: string;
    form: {
      name: string;
      email: string;
      message: string;
      submit: string;
      success: string;
    };
  };
  footer: {
    tagline: string;
    quickLinks: string;
    connect: string;
    rights: string;
  };
  testimonials: Testimonial[];
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  const loadDictionary = useCallback(async (loc: Locale) => {
    const dict = loc === "ar"
      ? (await import("@/dictionaries/ar")).default
      : (await import("@/dictionaries/en")).default;
    setDictionary(dict as Dictionary);
  }, []);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("locale", loc);
    document.documentElement.lang = loc;
    document.documentElement.dir = loc === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLocale(saved);
    }
  }, [setLocale]);

  useEffect(() => {
    loadDictionary(locale);
  }, [locale, loadDictionary]);

  if (!dictionary) return null;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionary, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
