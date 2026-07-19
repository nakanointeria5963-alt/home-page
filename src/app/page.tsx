import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Concept from "@/components/sections/Concept";
import Businesses from "@/components/sections/Businesses";
import Vision from "@/components/sections/Vision";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <main>
        <Hero />
        <Concept />
        <Businesses />
        <Vision />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
