export default function Choice({ type = "checkbox", checked, label, name, value, onChange, badge }) {
  return (
    <label className={`profile-choice${checked ? " profile-choice--selected" : ""}`}>
      <input checked={checked} name={name} onChange={onChange} type={type} value={value} />
      <span className="profile-choice__indicator" aria-hidden="true">{type === "checkbox" && checked ? "✓" : ""}</span>
      <span>{label}</span>
      {badge ? <span className="profile-choice__badge">{badge}</span> : null}
    </label>
  );
}

