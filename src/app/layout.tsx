import type { Metadata, Viewport } from "next";
import { Jost, Big_Shoulders } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz";
const SITE_NAME = "The Hooker Lab";
const DEFAULT_TITLE =
  "The Hooker Lab | Specialist Rugby Hooker Coaching in New Zealand";
const DEFAULT_DESCRIPTION =
  "Specialist rugby hooker coaching in New Zealand with professional hooker Kurt Eklund. Throwing, lineout, scrummaging, mental skills and leadership for players, schools, clubs and unions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "hooker coaching",
    "rugby hooker coach",
    "lineout throwing coach",
    "rugby throwing technique",
    "scrummaging coaching",
    "specialist rugby coaching New Zealand",
    "Kurt Eklund",
    "The Hooker Lab",
    "school rugby hooker training",
    "provincial rugby development",
  ],
  authors: [{ name: "Kurt Eklund", url: SITE_URL }],
  creator: "Kurt Eklund",
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  category: "sports",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo/logo.png`,
      email: "admin@thehookerlab.co.nz",
      slogan: "Throw. Scrum. Lead.",
      description: DEFAULT_DESCRIPTION,
      areaServed: { "@type": "Country", name: "New Zealand" },
      founder: { "@id": `${SITE_URL}/#kurt` },
      sameAs: ["https://www.instagram.com/kurteklund05/"],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#kurt`,
      name: "Kurt Eklund",
      jobTitle: "Professional Rugby Hooker and Specialist Hooker Coach",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      sameAs: ["https://www.instagram.com/kurteklund05/"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-NZ",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ" className={`${jost.variable} ${bigShoulders.variable}`}>
      <body className="bg-ink text-bone antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        {/* SmoothScroll provider and Navbar will be added here as we build them */}
        <main id="main">{children}</main>
        {/* Footer will be added here */}
      </body>
    </html>
  );
}