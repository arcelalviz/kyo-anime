"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveals() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver | null = null;
    const frame = requestAnimationFrame(() => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      observer = new IntersectionObserver((entries, current) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.classList.add("is-revealed");
            current.unobserve(target);
          }
        });
      }, { rootMargin: "0px 0px -45px 0px", threshold: 0.06 });
      targets.forEach((target) => {
        if (target.getBoundingClientRect().top > window.innerHeight * 0.95) target.classList.add("will-reveal");
        observer?.observe(target);
      });
    });
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [pathname]);
  return null;
}
