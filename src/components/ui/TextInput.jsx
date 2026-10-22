import { forwardRef, useId } from "react";
import "./shared-ui.css";

const TextInput = forwardRef(function TextInput(
  {
    className = "",
    error,
    hint,
    id: providedId,
    label,
    required = false,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${id}-message` : undefined;

  return (
    <div className={`ui-field ${className}`.trim()}>
      <label className="ui-field__label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        ref={ref}
        aria-describedby={messageId}
        aria-invalid={error ? "true" : undefined}
        className="ui-field__input"
        id={id}
        required={required}
        {...props}
      />
      {message ? (
        <span
          className={`ui-field__message${error ? " ui-field__message--error" : ""}`}
          id={messageId}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
});

export default TextInput;

