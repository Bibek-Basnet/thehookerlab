import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Expertise from "@/components/sections/Expertise";
import Hero from "@/components/sections/Hero";
import Instagram from "@/components/sections/Instagram";
import Philosophy from "@/components/sections/Philosophy";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import {
  getContactSection,
  getExpertiseSection,
  getOnlineCopy,
  getProgramsSection,
  getSiteSettings,
  getTestimonialsSection,
} from "@/lib/content/queries";

export default async function Home() {
  const [settings, programs, online, expertise, contact, testimonials] =
    await Promise.all([
      getSiteSettings(),
      getProgramsSection(),
      getOnlineCopy(),
      getExpertiseSection(),
      getContactSection(),
      getTestimonialsSection(),
    ]);

  return (
    <>
      <Hero contactEmail={settings.contactEmail} />
      <Philosophy />
      <Services data={programs} online={online} />
      <Expertise data={expertise} />
      <About />
      <Contact data={contact} />
      <Testimonials data={testimonials} />
      <Instagram />
    </>
  );
}
