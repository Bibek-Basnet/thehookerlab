import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Expertise from "@/components/sections/Expertise";
import Testimonials from "@/components/sections/Testimonials";
import Workshops from "@/components/sections/Workshops";
import OnlineProgramme from "@/components/sections/OnlineProgramme";
import Instagram from "@/components/sections/Instagram";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Expertise />
      <Testimonials />
      <Workshops />
      <OnlineProgramme />
      <Instagram />
      <FAQ />
      <Contact />
    </>
  );
}