"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { IconType } from "react-icons";
import { useI18n } from "@/lib/i18n";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: IconType;
  index: number;
}

export default function ServiceCard({ title, description, icon: Icon, index }: ServiceCardProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-teal-200 card-lift relative overflow-hidden"
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/50 group-hover:to-ocean-50/30 transition-all duration-500 rounded-2xl" />

      <div className="relative">
        <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
          <Icon className="text-2xl text-teal-600" />
        </div>
        <h3
          className="text-xl font-bold text-ocean-900 mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
        <p className="text-ocean-600 text-sm leading-relaxed mb-6">{description}</p>
        <Link
          href="/booking"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group-hover:gap-2 gap-1 duration-300 cursor-pointer"
        >
          {t.services.bookNow}
          <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </motion.div>
  );
}
