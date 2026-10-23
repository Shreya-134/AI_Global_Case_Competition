import "./shared-ui.css";

export default function EventCard({
  actions,
  className = "",
  description,
  eyebrow,
  meta,
  title,
  tone = "lavender",
  ...props
}) {
  return (
    <article
      className={`ui-event-card ui-event-card--${tone} ${className}`.trim()}
      {...props}
    >
      {eyebrow ? <p className="ui-event-card__eyebrow">{eyebrow}</p> : null}
      <h3 className="ui-event-card__title">{title}</h3>
      {meta ? <p className="ui-event-card__meta">{meta}</p> : null}
      {description ? (
        <p className="ui-event-card__description">{description}</p>
      ) : null}
      {actions ? <div className="ui-event-card__actions">{actions}</div> : null}
    </article>
  );
}

