'use client';

export default function ToggleField({
  id,
  icon,
  label,
  hint,
  checked,
  onChange,
}) {
  return (
    <div className="toggle-field">
      <label className="toggle-item" htmlFor={id}>
        <span className="toggle-item-content">
          {icon ? <span className="toggle-item-icon">{icon}</span> : null}
          <span className="toggle-item-label">{label}</span>
        </span>
        <span className="lum-toggle">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          <span className="lum-toggle-track" />
        </span>
      </label>
      {hint ? <p className="field-hint toggle-field-hint">{hint}</p> : null}
    </div>
  );
}
