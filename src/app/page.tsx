import Hero from "@/components/sections/Hero";
import Philosophy from "@/components/sections/Philosophy";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Expertise from "@/components/sections/Expertise";
import Testimonials from "@/components/sections/Testimonials";
import Instagram from "@/components/sections/Instagram";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />

      <Services />
      <Expertise />
      <About />
      <Testimonials />
      <Instagram />
      <Contact />
    </>
  );
}
