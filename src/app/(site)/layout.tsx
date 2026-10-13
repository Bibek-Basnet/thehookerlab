import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/content/queries";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

function organisationJsonLd(email: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo/logo.png`,
        email,
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
}

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { contactEmail } = await getSiteSettings();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organisationJsonLd(contactEmail)),
        }}
      />
      <Navbar contactEmail={contactEmail} />
      <main id="main">{children}</main>
      <Footer contactEmail={contactEmail} />
    </>
  );
}
