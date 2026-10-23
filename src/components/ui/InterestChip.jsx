import "./shared-ui.css";

export default function InterestChip({
  children,
  className = "",
  selected = false,
  type = "button",
  ...props
}) {
  return (
    <button
      aria-pressed={selected}
      className={`ui-chip ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

