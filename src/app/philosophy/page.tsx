"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

export default function PhilosophyPage() {
  const { t } = useI18n();

  const paragraphs = Object.values(t.philosophy.content);

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-ocean-950 to-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.philosophy.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-teal-300 text-xl italic"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.philosophy.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Featured Photo */}
      <section className="px-6 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <img
              src="/images/moatasem-philosophy.jpg"
              alt="Moatasem reflecting"
              className="w-full h-[480px] md:h-[600px] object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="pt-16 pb-24 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`text-ocean-700 leading-loose mb-8 ${
                i === 0 || i === paragraphs.length - 1
                  ? "text-lg md:text-xl italic text-ocean-800"
                  : "text-base"
              }`}
              style={
                i === 0 || i === paragraphs.length - 1
                  ? { fontFamily: "var(--font-heading)" }
                  : undefined
              }
            >
              {p}
            </motion.p>
          ))}

          {/* Decorative */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="w-16 h-0.5 bg-teal-400 mx-auto mb-6" />
            <p className="text-ocean-400 text-sm italic">~ Moatasem Akash</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
