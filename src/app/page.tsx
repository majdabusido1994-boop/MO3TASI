"use client";

import { motion } from "motion/react";
import { FaDumbbell, FaHandsHelping, FaWater } from "react-icons/fa";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import InstagramFeed from "@/components/InstagramFeed";
import { Marquee } from "@/components/Marquee";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  const services = [
    {
      title: t.services.massage.title,
      description: t.services.massage.description,
      icon: FaHandsHelping,
    },
    {
      title: t.services.training.title,
      description: t.services.training.description,
      icon: FaDumbbell,
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
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-900 mb-6 heading-font">
              {t.home.introTitle}
            </h2>
            <p className="text-ocean-600 text-lg leading-relaxed max-w-3xl mx-auto">
              {t.home.introText}
            </p>
          </motion.div>
        </div>
        <div className="section-divider max-w-md mx-auto mt-16" />
      </section>

      {/* Photo Gallery Marquee */}
      <section className="py-8">
        <Marquee pauseOnHover speed="slow" className="[--gap:1rem]">
          {[
            "/images/surf-blue-sky.jpg",
            "/images/services-massage.jpg",
            "/images/surf-teaching.jpg",
            "/images/portrait-board.jpg",
            "/images/surf-teal-wave.jpg",
            "/images/surf-barrel.jpg",
            "/images/nazare-cliff.jpg",
          ].map((src) => (
            <div key={src} className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden shadow-lg">
              <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </Marquee>
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

      {/* Quote */}
      <section className="py-24 lg:py-32 px-6 bg-ocean-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-ocean-400/6 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="text-teal-400/20 text-7xl leading-none mb-4 heading-font">&ldquo;</div>
          <p className="text-2xl md:text-3xl text-white/90 leading-relaxed italic heading-font -mt-10">
            {t.home.quoteText}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-ocean-500 flex items-center justify-center text-white font-bold text-sm">M</div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Moatasem Akash</p>
              <p className="text-teal-400/60 text-xs">Sports Massage & Surf Coach</p>
            </div>
          </div>
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

      {/* Instagram Feed */}
      <InstagramFeed />
    </>
  );
}
