import { useEffect } from "react";
import { Button, Card } from "../../components/ui";
import { homepageConfig } from "../../config/homepageConfig";
import AssistantPreview from "./AssistantPreview";
import CalendarPreview from "./CalendarPreview";
import useHomepageDemo from "./useHomepageDemo";
import "./Homepage.css";

export default function Homepage() {
  const config = homepageConfig;
  const demo = useHomepageDemo(config);
  const phaseNumber = ["greeting", "question", "typing", "response", "matches", "settled"].indexOf(
    demo.phase,
  );
  const showEvents = phaseNumber >= 4;

  useEffect(() => {
    document.title = config.productName;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", config.metaDescription);
  }, [config.metaDescription, config.productName]);

  const visitDestination = (destination) => {
    if (destination) window.location.assign(destination);
  };

  return (
    <main className="homepage">
      <section className="homepage-hero" aria-labelledby="homepage-headline">
        <div className="brand-lockup" aria-label={config.productName}>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>{config.productName}</span>
        </div>

        <div className="hero-copy">
          <p className="hero-eyebrow">{config.previewLabel}</p>
          <h1 id="homepage-headline">{config.headline}</h1>
          <p>{config.subtitle}</p>
        </div>

        <div className="hero-actions" aria-describedby="route-status">
          <Button
            disabled={!config.destinations.exploreEvents}
            onClick={() => visitDestination(config.destinations.exploreEvents)}
          >
            {config.exploreButtonLabel}
          </Button>
          <Button
            disabled={!config.destinations.authentication}
            onClick={() => visitDestination(config.destinations.authentication)}
            surface="dark"
            variant="secondary"
          >
            {config.authButtonLabel}
          </Button>
          <p className="route-status" id="route-status">
            {config.labels.routePending}
          </p>
        </div>

        <div className="hero-orbit" aria-hidden="true">
          <span />
          <span />
        </div>
      </section>

      <section className="homepage-dashboard" aria-labelledby="dashboard-title">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">{config.previewLabel}</p>
            <h2 id="dashboard-title">{config.dashboardTitle}</h2>
          </div>
          <div className="profile-placeholder" aria-hidden="true">
            {config.labels.profileInitials}
          </div>
        </header>

        <Card className="dashboard-shell" elevated>
          <CalendarPreview
            config={config}
            events={demo.matchingEvents}
            highlight={demo.phase === "matches"}
            showEvents={showEvents}
          />
          <AssistantPreview
            activePreset={demo.activePreset}
            config={config}
            events={demo.matchingEvents}
            manuallyPaused={demo.manuallyPaused}
            onPauseToggle={demo.togglePaused}
            onPresetSelect={demo.selectPreset}
            onReplay={demo.replay}
            phase={demo.phase}
            reducedMotion={demo.reducedMotion}
          />
        </Card>
      </section>
    </main>
  );
}

