import "./shared-ui.css";

export default function Card({
  as: Component = "section",
  children,
  className = "",
  elevated = false,
  ...props
}) {
  const classes = [
    "ui-card",
    elevated ? "ui-card--elevated" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

