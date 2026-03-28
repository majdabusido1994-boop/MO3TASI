"use client";

import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/philosophy", label: t.nav.philosophy },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="bg-ocean-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Moatasem Akash
            </h3>
            <p className="text-ocean-300 text-sm leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-400 mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ocean-300 text-sm hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-400 mb-4">
              {t.footer.connect}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/972507774694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ocean-300 text-sm hover:text-white transition-colors duration-300"
                >
                  <FaWhatsapp className="text-lg" />
                  +972 50 777 4694
                </a>
              </li>
              <li>
                <a
                  href="mailto:moatasim.akash@gmail.com"
                  className="flex items-center gap-3 text-ocean-300 text-sm hover:text-white transition-colors duration-300"
                >
                  <FaEnvelope className="text-lg" />
                  moatasim.akash@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/moatasimakash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ocean-300 text-sm hover:text-white transition-colors duration-300"
                >
                  <FaInstagram className="text-lg" />
                  @moatasimakash
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-ocean-800 text-center">
          <p className="text-ocean-400 text-sm">
            &copy; {new Date().getFullYear()} Moatasem Akash. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
