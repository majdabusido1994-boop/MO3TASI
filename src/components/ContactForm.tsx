"use client";

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

export default function ContactForm() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-ocean-700 text-lg">{t.contact.form.success}</p>
      </motion.div>
    );
  }

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-ocean-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 placeholder:text-ocean-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ocean-700 mb-2">{t.contact.form.name}</label>
        <input type="text" required className={inputClass} placeholder={t.contact.form.name} />
      </div>
      <div>
        <label className="block text-sm font-medium text-ocean-700 mb-2">{t.contact.form.email}</label>
        <input type="email" required className={inputClass} placeholder={t.contact.form.email} />
      </div>
      <div>
        <label className="block text-sm font-medium text-ocean-700 mb-2">{t.contact.form.message}</label>
        <textarea rows={5} required className={inputClass} placeholder={t.contact.form.message} />
      </div>
      <button
        type="submit"
        className="w-full py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm tracking-wide"
      >
        {t.contact.form.submit}
      </button>
    </form>
  );
}
