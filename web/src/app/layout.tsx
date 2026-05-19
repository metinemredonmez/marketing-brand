import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { ThemeScript } from "@/components/theme/theme-script";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

// Body — Inter (mevcut)
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Display — Inter Tight (Linear stili — headings için)
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003",
  ),
  title: {
    default: "MarkaRadar — Türkiye'nin AI-native pazarlama medyası",
    template: "%s · MarkaRadar",
  },
  description:
    "Türkiye'nin pazarlama, reklam ve marka gündemini AI ile yakalayan medya platformu.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "MarkaRadar",
    images: [
      {
        url: "/api/og?title=Pazarlamanın+hızını+AI+ile+yakala&eyebrow=MarkaRadar",
        width: 1200,
        height: 630,
        alt: "MarkaRadar — Türkiye'nin AI-native pazarlama medyası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      "/api/og?title=Pazarlamanın+hızını+AI+ile+yakala&eyebrow=MarkaRadar",
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans">
        <I18nProvider locale={locale}>
          <ThemeProvider>
            {children}
            <CookieBanner />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
