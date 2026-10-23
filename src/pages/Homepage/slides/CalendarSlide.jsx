import { formatEventTimeRange } from "../homepageUtils.js";

export default function CalendarSlide({ config }) {
  const event = config.exampleEvent;
  return <div className="calendar-illustration" aria-label={`${config.carousel.exampleLabel}: sample availability calendar`}>
    <div className="calendar-import-chip"><span aria-hidden="true">↗</span><div><strong>{config.calendar.importLabel}</strong><small>{config.calendar.importStatus}</small></div></div>
    <div className="mini-calendar" aria-hidden="true">
      {config.calendar.days.map((day) => <div className="mini-calendar-day" key={day.id}><div className="mini-calendar-heading"><strong>{day.shortLabel}</strong><span>{Number(day.date.slice(-2))}</span></div><div className="mini-calendar-slots"><span /><span /><span />{config.calendar.commitments.filter((item) => item.dayId === day.id).map((item) => <div className={`calendar-commitment calendar-commitment--${item.slot}`} key={item.id}>{item.label}</div>)}{day.date === event.date ? <div className="calendar-feature-event"><strong>{event.name}</strong><span>{formatEventTimeRange(event)}</span><span>{event.location}</span></div> : null}</div></div>)}
    </div>
    <p className="illustration-note">{config.carousel.exampleLabel}. No calendar account is connected.</p>
  </div>;
}
