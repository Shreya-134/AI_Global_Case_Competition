import { Button, Card } from "../../components/ui";
import AiAssistantSlide from "./slides/AiAssistantSlide";
import CalendarSlide from "./slides/CalendarSlide";
import CarpoolSlide from "./slides/CarpoolSlide";
import useFeatureCarousel from "./useFeatureCarousel";

const illustrations = { ai: AiAssistantSlide, calendar: CalendarSlide, carpool: CarpoolSlide };

export default function FeatureCarousel({ config }) {
  const slides = config.carousel.slides;
  const carousel = useFeatureCarousel(slides.length, config.animation.autoplayMs);
  const activeSlide = slides[carousel.activeIndex];
  const Illustration = illustrations[activeSlide.illustration];
  const counter = `${String(carousel.activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

  return <section className="feature-tour" aria-labelledby="feature-tour-title">
    <p className="feature-tour-eyebrow" id="feature-tour-title">{config.carousel.eyebrow}</p>
    <div className="feature-carousel" {...carousel.interactionHandlers}>
      <Card className="feature-card" elevated style={{ "--carousel-transition": `${config.animation.transitionMs}ms` }}>
        <header className="feature-card-header"><span className="slide-counter">{counter}</span><div className="carousel-arrows"><Button aria-label={config.carousel.previousLabel} className="carousel-arrow" onClick={carousel.previous} variant="secondary">←</Button><Button aria-label={config.carousel.nextLabel} className="carousel-arrow" onClick={carousel.next} variant="secondary">→</Button></div></header>
        <div className="feature-slide" key={activeSlide.id}>
          <div className="feature-slide-copy"><h2>{activeSlide.title}</h2><p>{activeSlide.description}</p></div>
          <Illustration config={config} reducedMotion={carousel.reducedMotion} />
        </div>
        <div className="next-slide-peek" aria-hidden="true" />
      </Card>

      <div className="carousel-footer">
        <div className="pagination-dots" aria-label="Choose a feature">{slides.map((slide, index) => <button aria-current={index === carousel.activeIndex ? "true" : undefined} aria-label={`Show ${slide.navigationLabel}`} className="pagination-dot" key={slide.id} onClick={() => carousel.navigate(index)} type="button" />)}</div>
        <Button aria-pressed={carousel.explicitlyPaused} className="playback-control" disabled={carousel.reducedMotion} onClick={carousel.togglePlayback} variant="secondary"><span aria-hidden="true">{carousel.reducedMotion || carousel.explicitlyPaused ? "▶" : "Ⅱ"}</span>{carousel.reducedMotion ? config.carousel.reducedMotionLabel : carousel.explicitlyPaused ? config.carousel.playLabel : config.carousel.pauseLabel}</Button>
      </div>

      <nav aria-label="Homepage features" className="feature-navigation">{slides.map((slide, index) => <button aria-current={index === carousel.activeIndex ? "page" : undefined} className="feature-navigation-button" key={slide.id} onClick={() => carousel.navigate(index)} type="button"><span>{String(index + 1).padStart(2, "0")}</span>{slide.navigationLabel}</button>)}</nav>
    </div>
  </section>;
}
