"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { FaHeartbeat, FaCheck, FaHandsHelping, FaWater } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

export default function ServicesPage() {
  const { t } = useI18n();

  const services = [
    {
      ...t.services.therapy,
      icon: FaHeartbeat,
      gradient: "from-ocean-500 to-teal-500",
    },
    {
      ...t.services.massage,
      icon: FaHandsHelping,
      gradient: "from-teal-500 to-teal-600",
    },
    {
      ...t.services.surf,
      icon: FaWater,
      gradient: "from-ocean-600 to-ocean-800",
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
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  !isEven ? "lg:direction-reverse" : ""
                }`}
              >
                {/* Visual */}
                <div className={`${!isEven ? "lg:order-2" : ""}`}>
                  <div
                    className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    </div>
                    <Icon className="text-white/30 text-8xl relative z-10" />
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
                  <p className="text-ocean-500 text-sm italic mb-8">{service.audience}</p>

                  <Link
                    href="/booking"
                    className="inline-flex px-8 py-3.5 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm tracking-wide"
                  >
                    {t.services.bookNow}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
