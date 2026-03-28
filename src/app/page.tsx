"use client";

import { motion } from "motion/react";
import { FaHeartbeat, FaHandsHelping, FaWater } from "react-icons/fa";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  const services = [
    {
      title: t.services.therapy.title,
      description: t.services.therapy.description,
      icon: FaHeartbeat,
    },
    {
      title: t.services.massage.title,
      description: t.services.massage.description,
      icon: FaHandsHelping,
    },
    {
      title: t.services.surf.title,
      description: t.services.surf.description,
      icon: FaWater,
    },
  ];

  return (
    <>
      <Hero />

      {/* Intro Section */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-ocean-900 mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.home.introTitle}
            </h2>
            <p className="text-ocean-600 text-lg leading-relaxed max-w-3xl mx-auto">
              {t.home.introText}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title={t.home.servicesTitle} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <ServiceCard key={service.title} {...service} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-24 lg:py-32 px-6 bg-ocean-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-400 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <p
            className="text-2xl md:text-3xl text-white/90 leading-relaxed italic"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.home.quoteText}
          </p>
          <div className="mt-8 w-12 h-0.5 bg-teal-400 mx-auto" />
          <p className="mt-4 text-teal-300 text-sm font-medium">Moatasem Akash</p>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title={t.home.testimonialsTitle} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.map((testimonial, i) => (
              <TestimonialCard key={testimonial.name} {...testimonial} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
