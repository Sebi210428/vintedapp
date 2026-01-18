import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import CookieNotice from "@/components/CookieNotice";
import DevRoutePrefetch from "@/components/DevRoutePrefetch";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const WOW_MODE = true;
const isProd = process.env.NODE_ENV === "production";
const prefetchHrefs = isProd
  ? ["/login", "/register", "/reset-password", "/demo", "/help-center"]
  : [
      "/login",
      "/register",
      "/reset-password",
      "/demo",
      "/help-center",
      "/dashboard",
      "/dashboard/description",
    ];

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "BlueCut",
    template: "%s | BlueCut",
  },
  description: "Professional Vinted photos in one click.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "BlueCut",
    description: "Professional Vinted photos in one click.",
    url: "/",
    siteName: "BlueCut",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "BlueCut - Professional Vinted photos in one click",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueCut",
    description: "Professional Vinted photos in one click.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`dark scroll-smooth ${WOW_MODE ? "wow" : ""}`} lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin=""
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} bg-transparent text-text-main antialiased overflow-x-hidden selection:bg-primary selection:text-white relative font-sans`}
        id="top"
      >
        {children}
        <CookieNotice />
        <DevRoutePrefetch enabled={!isProd} hrefs={prefetchHrefs} />
      </body>
    </html>
  );
}
