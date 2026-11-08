"use client";

import { useEffect } from "react";

export default function MotionSystem() {
  useEffect(() => {
    const items = document.querySelectorAll(
      "main section, .feature-card, .landing-art, .reward-orbit"
    );

    items.forEach((item, index) => {
      item.classList.add("eveora-reveal");
      (item as HTMLElement).style.setProperty(
        "--eveora-reveal-delay",
        `${(index % 5) * 100}ms`
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return null;
}
