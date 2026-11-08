"use client";

import { useEffect } from "react";

export default function MotionSystem() {
  useEffect(() => {
    const selectors = [
      "main > section",
      ".landing-hero h1",
      ".landing-hero > p",
      ".landing-hero > div",
      ".landing-art",
      ".feature-card",
      ".reward-orbit",
      ".auth-hero",
      ".auth-card",
      ".auth-card > p",
      ".auth-card > h2",
      ".auth-card form > *",
    ].join(", ");

    const items = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      items.forEach((item) => item.classList.add("eveora-motion-visible"));
      return;
    }

    items.forEach((item, index) => {
      item.classList.add("eveora-motion-item");

      if (
        item.matches(".landing-art, .reward-orbit, .auth-card") ||
        index % 4 === 3
      ) {
        item.classList.add("eveora-motion-pop");
      } else if (
        item.matches(".auth-hero, .landing-hero h1") ||
        index % 2 === 0
      ) {
        item.classList.add("eveora-motion-left");
      } else {
        item.classList.add("eveora-motion-right");
      }

      item.style.setProperty(
        "--eveora-motion-delay",
        `${Math.min(index % 6, 5) * 110}ms`
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("eveora-motion-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return null;
}
