import { Button, ChatBubble } from "../../components/ui";

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function AssistantPreview({
  config,
  events,
  phase,
  manuallyPaused,
  reducedMotion,
  activePreset,
  onPauseToggle,
  onPresetSelect,
  onReplay,
}) {
  const phaseNumber = ["greeting", "question", "typing", "response", "matches", "settled"].indexOf(
    phase,
  );
  const showQuestion = phaseNumber >= 1;
  const showTyping = phase === "typing";
  const showResponse = phaseNumber >= 3;
  const getDay = (event) =>
    config.calendar.days.find((day) => day.id === event.dayId);

  return (
    <section className="assistant-preview" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div>
          <span className="demo-badge">{config.labels.demoBadge}</span>
          <h2 id="assistant-title">{config.assistantName}</h2>
        </div>
        <div className="demo-controls">
          <Button
            aria-pressed={manuallyPaused}
            className="demo-control"
            disabled={reducedMotion}
            onClick={onPauseToggle}
            surface="dark"
            variant="secondary"
          >
            {reducedMotion
              ? config.labels.reducedMotion
              : manuallyPaused
                ? config.labels.resume
                : config.labels.pause}
          </Button>
          <Button
            className="demo-control"
            onClick={onReplay}
            surface="dark"
            variant="secondary"
          >
            {config.labels.replay}
          </Button>
        </div>
      </div>

      <div className="chat-transcript" aria-hidden="true">
        <ChatBubble label={config.assistantName} speaker="assistant">
          {config.assistantGreeting}
        </ChatBubble>

        {showQuestion ? (
          <ChatBubble
            className="homepage-reveal"
            label={config.labels.studentLabel}
            speaker="user"
          >
            {activePreset.userMessage}
          </ChatBubble>
        ) : null}

        {showTyping ? (
          <div className="typing-indicator homepage-reveal">
            <span>{config.assistantName} {config.labels.typing}</span>
            <span className="typing-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}

        {showResponse ? (
          <ChatBubble
            className="homepage-reveal assistant-result"
            label={config.assistantName}
            speaker="assistant"
          >
            <p>{config.assistantResponseLead}</p>
            <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.name}</strong>
                  <span>
                    {getDay(event)?.longLabel}, {getDay(event)?.dateLabel}, {formatTime(event.start)}{" "}
                    {config.labels.eventLocationSeparator}{" "}
                    {event.location}
                  </span>
                </li>
              ))}
            </ul>
          </ChatBubble>
        ) : null}
      </div>

      <div className="sr-only">
        {config.previewLabel}. {config.assistantName} responds to “{activePreset.userMessage}”
        with{" "}
        {events
          .map((event) => `${event.name} on ${getDay(event)?.longLabel}, ${getDay(event)?.dateLabel}`)
          .join(", ")}.
      </div>

      <div className="quick-suggestions">
        <p>{config.labels.quickSuggestions}</p>
        <div className="suggestion-list">
          {config.presets.map((preset) => (
            <Button
              aria-pressed={preset.id === activePreset.id && manuallyPaused}
              className="suggestion-button"
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              surface="dark"
              variant="secondary"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="chat-placeholder" aria-hidden="true">
        <span>{config.chatPlaceholder}</span>
        <span className="chat-placeholder-badge">{config.labels.demoBadge}</span>
      </div>
    </section>
  );
}

