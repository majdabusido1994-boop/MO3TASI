"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  index: number;
}

export default function BlogCard({ slug, title, excerpt, date, category, index }: BlogCardProps) {
  const { t } = useI18n();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group"
    >
      <Link href={`/blog/${slug}`} className="block">
        {/* Image placeholder */}
        <div className="aspect-[16/10] bg-gradient-to-br from-ocean-100 to-teal-100 rounded-2xl mb-5 overflow-hidden relative">
          <div className="absolute inset-0 bg-ocean-900/5 group-hover:bg-ocean-900/0 transition-colors duration-500" />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-ocean-700 text-xs font-medium rounded-full">
              {category}
            </span>
          </div>
        </div>
        <time className="text-xs text-ocean-400 font-medium">{date}</time>
        <h3
          className="text-xl font-bold text-ocean-900 mt-2 mb-3 group-hover:text-teal-700 transition-colors duration-300"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
        <p className="text-ocean-600 text-sm leading-relaxed mb-4">{excerpt}</p>
        <span className="text-sm font-semibold text-teal-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
          {t.blog.readMore}
          <span>&rarr;</span>
        </span>
      </Link>
    </motion.article>
  );
}
