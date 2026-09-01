"use client";

import { useEffect, useState } from "react";

export default function ScrollCue() {
  const [ready, setReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 5100);
    const hero = document.querySelector(".timeline-hero");

    if (!hero) return () => window.clearTimeout(timer);

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.35),
      { threshold: [0, 0.35, 0.7] },
    );

    observer.observe(hero);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const visible = ready && heroVisible && !dismissed;

  return (
    <a
      className={`scroll-cue${visible ? " scroll-cue--visible" : ""}`}
      href="#how-it-works"
      aria-label="See Axe's new posts"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => setDismissed(true)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
      </svg>
      <span className="axe-mark" aria-hidden="true">A</span>
      <span><strong>Axe</strong> posted</span>
    </a>
  );
}
