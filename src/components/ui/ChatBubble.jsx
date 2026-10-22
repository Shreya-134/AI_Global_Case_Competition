import "./shared-ui.css";

export default function ChatBubble({
  children,
  className = "",
  label,
  speaker = "assistant",
  ...props
}) {
  return (
    <div
      className={`ui-chat-bubble ui-chat-bubble--${speaker} ${className}`.trim()}
      {...props}
    >
      {label ? <span className="ui-chat-bubble__label">{label}</span> : null}
      {children}
    </div>
  );
}

