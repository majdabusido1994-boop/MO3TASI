"use client";

import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n();

  return (
    <div dir={dir}>
      <Navbar />
      <main className="page-transition">{children}</main>
      <Footer />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <LayoutInner>{children}</LayoutInner>
    </I18nProvider>
  );
}
