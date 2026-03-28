"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const CALENDLY_URL = "https://calendly.com/moatasim-akash";

interface CalendlyEmbedProps {
  service?: string;
}

export default function CalendlyEmbed({ service }: CalendlyEmbedProps) {
  const { locale } = useI18n();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const prefill = service ? `?a1=${encodeURIComponent(service)}` : "";

  return (
    <div
      className="calendly-inline-widget rounded-xl overflow-hidden"
      data-url={`${CALENDLY_URL}${prefill}`}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}
