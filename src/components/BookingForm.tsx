"use client";

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import CalendlyEmbed from "./CalendlyEmbed";

type BookingMode = "form" | "calendly";

export default function BookingForm() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<BookingMode>("form");
  const [selectedService, setSelectedService] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      service: formData.get("service") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      message: formData.get("message") as string,
    };

    try {
      // Compose WhatsApp message with booking details
      const lines = [
        "*New Booking Request*",
        "",
        `*Name:* ${data.name}`,
        `*Email:* ${data.email}`,
        `*Phone:* ${data.phone}`,
        `*Service:* ${data.service}`,
        `*Date:* ${data.date}`,
        `*Time:* ${data.time}`,
      ];
      if (data.message) {
        lines.push("", `*Message:* ${data.message}`);
      }
      const text = encodeURIComponent(lines.join("\n"));
      const waUrl = `https://api.whatsapp.com/send?phone=351913920277&text=${text}`;

      // Open WhatsApp in a new tab with pre-filled booking details
      window.open(waUrl, "_blank", "noopener,noreferrer");

      setSubmitted(true);
    } catch {
      setError(t.booking.form.error || "Something went wrong. Please try again or contact us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-ocean-700 text-lg">{t.booking.form.success}</p>
      </motion.div>
    );
  }

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-ocean-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 placeholder:text-ocean-400";

  return (
    <div>
      {/* Mode Toggle */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
        <button
          type="button"
          onClick={() => setMode("form")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
            mode === "form"
              ? "bg-white text-ocean-900 shadow-sm"
              : "text-ocean-500 hover:text-ocean-700"
          }`}
        >
          {t.booking.modeForm || "Send Request"}
        </button>
        <button
          type="button"
          onClick={() => setMode("calendly")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
            mode === "calendly"
              ? "bg-white text-ocean-900 shadow-sm"
              : "text-ocean-500 hover:text-ocean-700"
          }`}
        >
          {t.booking.modeCalendly || "Schedule Directly"}
        </button>
      </div>

      {mode === "calendly" ? (
        <CalendlyEmbed service={selectedService} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.name}
              </label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder={t.booking.form.name}
                name="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.email}
              </label>
              <input
                type="email"
                required
                className={inputClass}
                placeholder={t.booking.form.email}
                name="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.phone}
              </label>
              <input
                type="tel"
                required
                className={inputClass}
                placeholder="+351..."
                name="phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.service}
              </label>
              <select
                required
                className={inputClass}
                name="service"
                defaultValue=""
                title={t.booking.form.service}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="" disabled>
                  {t.booking.form.service}
                </option>
                {t.booking.form.serviceOptions.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.date}
              </label>
              <input type="date" required className={inputClass} name="date" title={t.booking.form.date} placeholder={t.booking.form.date} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                {t.booking.form.time}
              </label>
              <input type="time" required className={inputClass} name="time" title={t.booking.form.time} placeholder={t.booking.form.time} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              {t.booking.form.message}
            </label>
            <textarea
              rows={4}
              className={inputClass}
              placeholder={t.booking.form.message}
              name="message"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.booking.form.submitting || "Sending..."}
              </span>
            ) : (
              t.booking.form.submit
            )}
          </button>

          {/* WhatsApp fallback */}
          <p className="text-center text-ocean-500 text-xs mt-4">
            {t.booking.form.whatsappFallback || "Or book directly via"}{" "}
            <a
              href="https://api.whatsapp.com/send?phone=351913920277"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 font-medium hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
