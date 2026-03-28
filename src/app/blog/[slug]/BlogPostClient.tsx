"use client";

import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

export default function BlogPostClient() {
  const { slug } = useParams();
  const { t, dir } = useI18n();

  const post = t.blog.posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-40 pb-24 px-6 text-center">
        <h1 className="text-2xl font-bold text-ocean-900">Post not found</h1>
        <Link href="/blog" className="text-teal-600 mt-4 inline-block hover:underline">
          {t.blog.backToJournal}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-ocean-950 to-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-ocean-300 hover:text-white transition-colors text-sm mb-8"
          >
            <FaArrowLeft className={dir === "rtl" ? "rotate-180" : ""} />
            {t.blog.backToJournal}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-teal-400 text-sm font-medium">{post.category}</span>
            <h1
              className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {post.title}
            </h1>
            <time className="text-ocean-400 text-sm">{post.date}</time>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          {post.content.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="text-ocean-700 leading-loose mb-6 text-base">
              {paragraph}
            </p>
          ))}
        </motion.article>
      </section>
    </>
  );
}
