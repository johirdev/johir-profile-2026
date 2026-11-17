import AboutMe from "../components/Clients/Home/AboutMe/AboutMe";
import ServicesBlock from "../components/Clients/Home/Blog/Blog";
import ClientReview from "../components/Clients/Home/ClientReview/ClientReview";
import Contact from "../components/Clients/Home/contact/Contact";
import FAQ from "../components/Clients/Home/FAQ/Faq";
import HeroBanner from "../components/Clients/Home/HeroBanner/HeroBanner";
import Pricing from "../components/Clients/Home/Pricing/Pricing";
import Projects from "../components/Clients/Home/Projects/Projects";
import TechStackSlider from "../components/Clients/Home/TechSlideing/TechSlideing";
// import VideoIntro from "../components/Clients/Home/VideoIntro/VideoIntro";
import WhyChooseMe from "../components/Clients/Home/WhyChooseMe/WhyChoosweMe";
import "swiper/css";
import "swiper/css/pagination";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <AboutMe />
      <Projects />
      <WhyChooseMe />
      <TechStackSlider />
      {/* <VideoIntro /> */}
      <ServicesBlock />
      <Pricing />
      <ClientReview />
      <FAQ />
      <Contact />
    </>
  );
}
