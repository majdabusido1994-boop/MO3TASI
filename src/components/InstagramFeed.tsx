"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FaInstagram } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: string;
  thumbnail_url?: string;
}

// Placeholder posts shown when Instagram API is not configured
const placeholderPosts = [
  { id: "1", gradient: "from-ocean-200 to-teal-200", label: "Ocean" },
  { id: "2", gradient: "from-teal-200 to-teal-300", label: "Surf" },
  { id: "3", gradient: "from-ocean-100 to-ocean-300", label: "Healing" },
  { id: "4", gradient: "from-teal-100 to-ocean-200", label: "Movement" },
  { id: "5", gradient: "from-ocean-300 to-teal-200", label: "Haifa" },
  { id: "6", gradient: "from-teal-200 to-ocean-100", label: "Flow" },
];

export default function InstagramFeed() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchInstagram() {
      try {
        const res = await fetch("/api/instagram");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts.slice(0, 6));
        }
      } catch {
        // Will show placeholders
      } finally {
        setLoaded(true);
      }
    }

    fetchInstagram();
  }, []);

  return (
    <section className="py-24 lg:py-32 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaInstagram className="text-2xl text-pink-500" />
            <h2
              className="text-3xl md:text-4xl font-bold text-ocean-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.home.instagramTitle || "Follow the Journey"}
            </h2>
          </div>
          <a
            href="https://instagram.com/moatasimakash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ocean-500 text-sm hover:text-teal-600 transition-colors"
          >
            @moatasimakash
          </a>
          <div className="mt-6 w-16 h-1 mx-auto rounded-full bg-teal-500" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loaded && posts.length > 0
            ? posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url}
                    alt={post.caption?.slice(0, 100) || "Instagram post"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ocean-900/0 group-hover:bg-ocean-900/40 transition-colors duration-300 flex items-center justify-center">
                    <FaInstagram className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.a>
              ))
            : placeholderPosts.map((item, i) => (
                <motion.a
                  key={item.id}
                  href="https://instagram.com/moatasimakash"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative aspect-square rounded-xl overflow-hidden"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                  >
                    <span className="text-ocean-600/40 text-xs font-medium uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-ocean-900/0 group-hover:bg-ocean-900/30 transition-colors duration-300 flex items-center justify-center">
                    <FaInstagram className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.a>
              ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://instagram.com/moatasimakash"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean-200 text-ocean-700 font-medium rounded-full hover:border-teal-400 hover:text-teal-700 transition-all duration-300 text-sm"
          >
            <FaInstagram />
            {t.home.instagramCta || "View on Instagram"}
          </a>
        </div>
      </div>
    </section>
  );
}
