import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Moatasem Akash — Sports Massage, Recovery & Surf Coaching",
  description:
    "Classic sports massage, physical training, and private longboard surf lessons. 12 certified specializations. Book your session with Moatasem Akash.",
  keywords: [
    "sports massage",
    "deep tissue massage",
    "longboard surf lessons",
    "surf coaching",
    "recovery",
    "Moatasem Akash",
  ],
  openGraph: {
    title: "Moatasem Akash — Sports Massage, Recovery & Surf Coaching",
    description:
      "Classic sports massage, physical training, and private longboard surf lessons.",
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
        {/* Hidden Netlify form for bot detection */}
        <form name="booking" data-netlify="true" hidden>
          <input type="hidden" name="form-name" value="booking" />
          <input name="name" />
          <input name="email" />
          <input name="phone" />
          <input name="service" />
          <input name="date" />
          <input name="time" />
          <textarea name="message" />
        </form>
        <form name="contact" data-netlify="true" hidden>
          <input type="hidden" name="form-name" value="contact" />
          <input name="name" />
          <input name="email" />
          <textarea name="message" />
        </form>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
