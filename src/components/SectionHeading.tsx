"use client";

import { motion } from "motion/react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  light?: boolean;
}

export default function SectionHeading({ title, subtitle, light }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="text-center mb-16"
    >
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 heading-font ${
          light ? "text-white" : "text-ocean-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl mx-auto ${light ? "text-white/70" : "text-ocean-600"}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-6 w-16 h-1 mx-auto rounded-full ${light ? "bg-gradient-to-r from-teal-400 to-ocean-300" : "bg-gradient-to-r from-teal-500 to-ocean-400"}`} />
    </motion.div>
  );
}
