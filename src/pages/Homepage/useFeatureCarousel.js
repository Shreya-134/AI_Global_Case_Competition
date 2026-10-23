import { useEffect, useRef, useState } from "react";
import { swipeDirection, wrappedIndex } from "./homepageUtils.js";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function useFeatureCarousel(slideCount, autoplayMs) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [explicitlyPaused, setExplicitlyPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const touchStart = useRef(null);
  const autoplayPaused = explicitlyPaused || hovered || focusWithin || tabHidden || reducedMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = (event) => setReducedMotion(event.matches);
    const updateVisibility = () => setTabHidden(document.hidden);
    query.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      query.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (autoplayPaused) return undefined;
    const timer = window.setTimeout(() => setActiveIndex((current) => wrappedIndex(current + 1, slideCount)), autoplayMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayMs, autoplayPaused, slideCount]);

  const navigate = (index, manual = true) => {
    setActiveIndex(wrappedIndex(index, slideCount));
    if (manual) setExplicitlyPaused(true);
  };

  const touchHandlers = {
    onTouchStart: (event) => {
      const touch = event.changedTouches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event) => {
      const touch = event.changedTouches[0];
      const direction = swipeDirection(touchStart.current, { x: touch.clientX, y: touch.clientY });
      touchStart.current = null;
      if (direction) navigate(activeIndex + direction);
    },
  };

  return {
    activeIndex,
    explicitlyPaused,
    reducedMotion,
    navigate,
    previous: () => navigate(activeIndex - 1),
    next: () => navigate(activeIndex + 1),
    togglePlayback: () => setExplicitlyPaused((current) => !current),
    interactionHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: () => setFocusWithin(true),
      onBlurCapture: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      },
      ...touchHandlers,
    },
  };
}
