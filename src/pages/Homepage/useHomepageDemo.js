import { useEffect, useMemo, useState } from "react";

const phases = ["greeting", "question", "typing", "response", "matches", "settled"];

function getReducedMotionPreference() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function useHomepageDemo(config) {
  const [activePresetId, setActivePresetId] = useState(config.presets[0].id);
  const [phaseIndex, setPhaseIndex] = useState(() =>
    getReducedMotionPreference() ? phases.length - 1 : 0,
  );
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );
  const [reducedMotion, setReducedMotion] = useState(getReducedMotionPreference);

  const activePreset = useMemo(
    () =>
      config.presets.find((preset) => preset.id === activePresetId) ??
      config.presets[0],
    [activePresetId, config.presets],
  );

  const matchingEvents = useMemo(
    () =>
      activePreset.eventIds
        .map((eventId) => config.events.find((event) => event.id === eventId))
        .filter(Boolean),
    [activePreset, config.events],
  );

  const phase = phases[phaseIndex];
  const autoPaused = manuallyPaused || tabHidden || reducedMotion;

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event) => {
      setReducedMotion(event.matches);
      setPhaseIndex(event.matches ? phases.length - 1 : 0);
    };
    const handleVisibilityChange = () => setTabHidden(document.hidden);

    motionQuery.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (autoPaused) return undefined;

    const durations = [
      config.animation.greetingMs,
      config.animation.userMessageMs,
      config.animation.typingMs,
      config.animation.responseLeadMs,
      config.animation.highlightMs,
      config.animation.readingPauseMs,
    ];
    const timer = window.setTimeout(() => {
      setPhaseIndex((current) => (current + 1) % phases.length);
    }, durations[phaseIndex]);

    return () => window.clearTimeout(timer);
  }, [autoPaused, config.animation, phaseIndex]);

  const selectPreset = (presetId) => {
    setActivePresetId(presetId);
    setManuallyPaused(true);
    setPhaseIndex(phases.length - 1);
  };

  const replay = () => {
    setActivePresetId(config.presets[0].id);
    setManuallyPaused(false);
    setPhaseIndex(reducedMotion ? phases.length - 1 : 0);
  };

  return {
    activePreset,
    matchingEvents,
    phase,
    manuallyPaused,
    reducedMotion,
    selectPreset,
    replay,
    togglePaused: () => setManuallyPaused((paused) => !paused),
  };
}

