import { forwardRef } from "react";
import "./shared-ui.css";

const Button = forwardRef(function Button(
  {
    children,
    className = "",
    variant = "primary",
    surface = "light",
    type = "button",
    ...props
  },
  ref,
) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    surface === "dark" ? "ui-button--on-dark" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} type={type} {...props}>
      {children}
    </button>
  );
});

export default Button;

