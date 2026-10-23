import { useState } from "react";
import { Button, TextInput } from "../../../components/ui";

export default function CustomOptionField({ label, placeholder, buttonLabel, onAdd, errorMessages }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = onAdd(value);
    if (result) setError(errorMessages[result] || result);
    else { setValue(""); setError(""); }
  };

  return (
    <form className="custom-option-form" onSubmit={submit}>
      <TextInput error={error} label={label} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} value={value} />
      <Button type="submit" variant="secondary">{buttonLabel}</Button>
    </form>
  );
}

