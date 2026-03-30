"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { FaDumbbell, FaCheck, FaHandsHelping, FaWater, FaChevronDown } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

export default function ServicesPage() {
  const { t } = useI18n();
  const [showRecovery, setShowRecovery] = useState(false);

  const services = [
    {
      ...t.services.massage,
      icon: FaHandsHelping,
    },
    {
      ...t.services.training,
      icon: FaDumbbell,
    },
    {
      ...t.services.surf,
      icon: FaWater,
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-ocean-950 to-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.services.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-ocean-300 text-lg max-w-2xl mx-auto"
          >
            {t.services.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
                >
                  {/* Visual */}
                  <div className={`${!isEven ? "lg:order-2" : ""}`}>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative group">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/30 to-transparent" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${!isEven ? "lg:order-1" : ""}`}>
                    <h2
                      className="text-3xl font-bold text-ocean-900 mb-4"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {service.title}
                    </h2>
                    <p className="text-ocean-600 leading-relaxed mb-6">{service.description}</p>

                    {/* Benefits */}
                    <ul className="space-y-3 mb-6">
                      {service.benefits.map((benefit: string) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <FaCheck className="text-teal-500 mt-1 flex-shrink-0 text-sm" />
                          <span className="text-ocean-700 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Audience */}
                    <p className="text-ocean-500 text-sm italic mb-6">{service.audience}</p>

                    {/* Massage Recovery expandable */}
                    {"recovery" in service && t.services.massage.recovery && (
                      <div className="mb-6">
                        <button
                          onClick={() => setShowRecovery(!showRecovery)}
                          className="flex items-center gap-2 text-teal-600 font-medium text-sm hover:text-teal-700 transition-colors cursor-pointer"
                        >
                          <FaChevronDown
                            className={`transition-transform duration-300 ${showRecovery ? "rotate-180" : ""}`}
                          />
                          {t.services.massage.recovery.title}
                        </button>
                        <AnimatePresence>
                          {showRecovery && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 p-5 bg-teal-50 rounded-xl border border-teal-100">
                                <p className="text-ocean-600 text-sm leading-relaxed mb-4">
                                  {t.services.massage.recovery.description}
                                </p>
                                <ul className="space-y-2">
                                  {t.services.massage.recovery.benefits.map((b: string) => (
                                    <li key={b} className="flex items-start gap-2">
                                      <FaCheck className="text-teal-500 mt-1 flex-shrink-0 text-xs" />
                                      <span className="text-ocean-700 text-sm">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <Link
                      href="/booking"
                      className="inline-flex px-8 py-3.5 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm tracking-wide"
                    >
                      {t.services.bookNow}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
