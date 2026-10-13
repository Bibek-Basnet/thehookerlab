import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import NotFound from "@/components/sections/NotFound";
import { getSiteSettings } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

/* Lives outside the (site) group so it must render the public chrome itself. */
export default async function NotFoundPage() {
  const { contactEmail } = await getSiteSettings();
  return (
    <>
      <Navbar contactEmail={contactEmail} />
      <main id="main">
        <NotFound />
      </main>
      <Footer contactEmail={contactEmail} />
    </>
  );
}
