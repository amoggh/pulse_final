import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

const SmoothScroll = () => {
  useEffect(() => {
    // Initialize Lenis for smooth inertia scrolling
    const lenis = new Lenis({
      duration: 1.3,          // how long the scroll animation lasts
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger for animations
    lenis.on("scroll", ScrollTrigger.update);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return null; // no UI, it just controls the page scroll
};

export default SmoothScroll;
