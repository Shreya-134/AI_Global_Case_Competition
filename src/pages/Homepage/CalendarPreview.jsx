import { InterestChip } from "../../components/ui";

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function CalendarPreview({ config, events, showEvents, highlight }) {
  const startMinutes = config.calendar.startHour * 60;
  const totalMinutes = (config.calendar.endHour - config.calendar.startHour) * 60;
  const hourLabels = Array.from(
    { length: config.calendar.endHour - config.calendar.startHour + 1 },
    (_, index) => `${(config.calendar.startHour + index) % 12 || 12} PM`,
  );

  return (
    <section className="calendar-preview" aria-labelledby="calendar-title">
      <div className="preview-filter-groups" aria-hidden="true">
        <div className="preview-filter-group">
          <span>{config.labels.interestGroup}</span>
          <div className="preview-chip-row">
            {config.interests.map((interest, index) => (
              <InterestChip key={interest} selected={index < 2} tabIndex={-1}>
                {interest}
              </InterestChip>
            ))}
          </div>
        </div>
        <div className="preview-filter-group">
          <span>{config.labels.availabilityGroup}</span>
          <div className="preview-chip-row">
            {config.availability.map((item) => (
              <InterestChip key={item} selected tabIndex={-1}>
                {item}
              </InterestChip>
            ))}
          </div>
        </div>
      </div>

      <div className="calendar-heading">
        <div>
          <span className="preview-kicker">{config.previewLabel}</span>
          <h2 id="calendar-title">{config.labels.calendar}</h2>
        </div>
        <span className="calendar-timezone">{config.labels.timezone}</span>
      </div>

      <div className="calendar" aria-hidden="true">
        <div className="calendar-corner" />
        {config.calendar.days.map((day) => (
          <div className="calendar-day-heading" key={day.id}>
            <strong>{day.shortLabel}</strong>
            <span>{day.dateLabel}</span>
          </div>
        ))}

        <div className="calendar-time-rail">
          {hourLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {config.calendar.days.map((day) => (
          <div className="calendar-day-column" key={day.id}>
            {showEvents
              ? events
                  .filter((event) => event.dayId === day.id)
                  .map((event) => {
                    const eventStart = timeToMinutes(event.start);
                    const eventEnd = timeToMinutes(event.end);
                    const style = {
                      "--event-top": `${((eventStart - startMinutes) / totalMinutes) * 100}%`,
                      "--event-height": `${((eventEnd - eventStart) / totalMinutes) * 100}%`,
                    };

                    return (
                      <div
                        className={`calendar-event calendar-event--${event.tone}${
                          highlight ? " calendar-event--highlight" : ""
                        }`}
                        key={event.id}
                        style={style}
                      >
                        <strong>{event.name}</strong>
                        <span>
                          {formatTime(event.start)}–{formatTime(event.end)}
                        </span>
                        <span>{event.location}</span>
                      </div>
                    );
                  })
              : null}
          </div>
        ))}
      </div>
    </section>
  );
}

