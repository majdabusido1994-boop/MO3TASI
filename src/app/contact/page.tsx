"use client";

import { motion } from "motion/react";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";
import ContactForm from "@/components/ContactForm";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();

  const contactMethods = [
    {
      icon: FaWhatsapp,
      label: t.contact.whatsapp,
      value: "+351 913 920 277",
      href: "https://api.whatsapp.com/send?phone=351913920277",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: FaEnvelope,
      label: t.contact.email,
      value: "moatasim.akash@gmail.com",
      href: "mailto:moatasim.akash@gmail.com",
      color: "bg-ocean-50 text-ocean-600",
    },
    {
      icon: FaInstagram,
      label: t.contact.instagram,
      value: "@moatasimakash",
      href: "https://instagram.com/moatasimakash",
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-ocean-950 to-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.contact.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-ocean-300 text-lg"
          >
            {t.contact.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Methods */}
          <div>
            <h2
              className="text-2xl font-bold text-ocean-900 mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.contact.subtitle}
            </h2>
            <div className="space-y-4">
              {contactMethods.map((method, i) => {
                const Icon = method.icon;
                return (
                  <motion.a
                    key={method.label}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.color}`}>
                      <Icon className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-ocean-500">{method.label}</p>
                      <p className="font-medium text-ocean-900 group-hover:text-teal-700 transition-colors">
                        {method.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Decorative wave divider */}
            <div className="mt-8 h-1 w-24 mx-auto bg-gradient-to-r from-teal-400 to-ocean-400 rounded-full" />
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}
