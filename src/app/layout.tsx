import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Moatasem Akash — Healing through Movement, Touch & Ocean Flow",
  description:
    "Therapy, classic sports massage, and private longboard surf lessons in Haifa. 12 certified specializations. Book your session with Moatasem Akash.",
  keywords: [
    "therapy Haifa",
    "sports massage",
    "longboard surf lessons",
    "wellness",
    "healing",
    "Moatasem Akash",
  ],
  openGraph: {
    title: "Moatasem Akash — Healing through Movement, Touch & Ocean Flow",
    description:
      "Therapy, classic sports massage, and private longboard surf lessons in Haifa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-white text-ocean-900"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
