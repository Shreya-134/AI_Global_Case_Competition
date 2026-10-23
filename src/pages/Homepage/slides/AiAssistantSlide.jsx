import { ChatBubble, EventCard } from "../../../components/ui";
import { formatEventDate, formatEventTimeRange } from "../homepageUtils.js";

export default function AiAssistantSlide({ config, reducedMotion }) {
  const event = config.exampleEvent;
  const style = (name) => reducedMotion ? undefined : { animationDelay: `${config.animation[name]}ms` };

  return <div className="ai-illustration" aria-label={`${config.carousel.exampleLabel}: a sample event-assistant conversation`}>
    <div className="example-chip">{config.carousel.exampleLabel}</div>
    <div className="illustration-chat">
      <ChatBubble className="illustration-reveal" label={config.demoChat.userLabel} speaker="user" style={style("chatUserDelayMs")}>{config.demoChat.userMessage}</ChatBubble>
      <div className="illustration-typing illustration-reveal" style={style("chatTypingDelayMs")} aria-hidden="true"><span /><span /><span /></div>
      <ChatBubble className="illustration-reveal" label={config.demoChat.assistantLabel} speaker="assistant" style={style("chatResponseDelayMs")}>{config.demoChat.assistantMessage}</ChatBubble>
    </div>
    <EventCard className="feature-event-card illustration-reveal" description={event.location} eyebrow={config.carousel.exampleLabel} meta={`${formatEventDate(event)} · ${formatEventTimeRange(event)}`} title={event.name} tone="yellow" style={style("chatEventDelayMs")} />
  </div>;
}
