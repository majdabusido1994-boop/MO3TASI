"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { HiMenu, HiX } from "react-icons/hi";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/philosophy", label: t.nav.philosophy },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
    { href: "/game", label: "🏄 Surf Game" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-icon.png"
              alt="Moatasem Akash"
              className="h-9 w-auto"
            />
            <span
              className={`text-xl font-semibold tracking-wide transition-colors duration-500 ${
                scrolled ? "text-ocean-900" : "text-white"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Moatasem Akash
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-teal-400 ${
                  scrolled ? "text-ocean-800" : "text-white/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <LanguageSwitcher scrolled={scrolled} />
            <Link
              href="/booking"
              className="px-5 py-2.5 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors duration-300"
            >
              {t.nav.booking}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <LanguageSwitcher scrolled={scrolled} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 transition-colors ${
                scrolled ? "text-ocean-900" : "text-white"
              }`}
            >
              {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/98 backdrop-blur-lg border-t border-gray-100"
          >
            <div className="px-6 py-6 space-y-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-ocean-800 text-base font-medium hover:text-teal-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-3 bg-teal-500 text-white font-medium rounded-full hover:bg-teal-600 transition-colors"
              >
                {t.nav.booking}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
