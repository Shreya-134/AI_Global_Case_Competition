import { useEffect } from "react";
import { Button } from "../../components/ui";
import { homepageConfig } from "../../config/homepageConfig";
import FeatureCarousel from "./FeatureCarousel";
import "./Homepage.css";

function HighlightedHeadline({ text, highlight }) {
  const start = text.toLocaleLowerCase().indexOf(highlight.toLocaleLowerCase());
  if (start < 0) return text;
  return <>{text.slice(0, start)}<span>{text.slice(start, start + highlight.length)}</span>{text.slice(start + highlight.length)}</>;
}

export default function Homepage() {
  const config = homepageConfig;

  useEffect(() => {
    document.title = config.productName;
    document.querySelector('meta[name="description"]')?.setAttribute("content", config.metaDescription);
  }, [config.metaDescription, config.productName]);

  const visitDestination = (destination) => {
    if (destination) window.location.assign(destination);
  };

  return <main className="homepage">
    <section className="homepage-hero" aria-labelledby="homepage-headline">
      <div className="brand-lockup" aria-label={config.productName}><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>{config.productName}</span></div>
      <div className="hero-copy"><h1 id="homepage-headline"><HighlightedHeadline highlight={config.headlineHighlight} text={config.headline} /></h1><p>{config.description}</p></div>
      <div className="hero-actions">
        <Button disabled={!config.destinations.exploreEvents} onClick={() => visitDestination(config.destinations.exploreEvents)}>{config.exploreButtonLabel}</Button>
        <Button disabled={!config.destinations.authentication} onClick={() => visitDestination(config.destinations.authentication)} surface="dark" variant="secondary">{config.authButtonLabel}</Button>
      </div>
      <div className="hero-orbit" aria-hidden="true"><span /><span /></div>
    </section>
    <section className="homepage-showcase"><FeatureCarousel config={config} /></section>
  </main>;
}
