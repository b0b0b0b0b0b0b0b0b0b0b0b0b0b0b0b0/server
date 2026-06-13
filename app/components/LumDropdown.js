'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

function DropdownOptionContent({ icon, label }) {
  return (
    <span className="lum-dropdown-option-content">
      {icon ? <span className="lum-dropdown-option-icon">{icon}</span> : null}
      <span className="lum-dropdown-option-label">{label}</span>
    </span>
  );
}

export default function LumDropdown({
  id,
  label,
  value,
  options,
  onChange,
  icon,
  iconOnly = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`lum-dropdown${open ? ' is-open' : ''}${iconOnly ? ' lum-dropdown-icon' : ''}`}
    >
      {label ? <label htmlFor={id} className="field-label">{label}</label> : null}
      <button
        type="button"
        id={id}
        className={`lum-btn lum-dropdown-trigger${iconOnly ? ' lum-dropdown-trigger-icon' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="lum-dropdown-trigger-text">
          {iconOnly ? icon : (
            <DropdownOptionContent icon={selected?.icon} label={selected?.label} />
          )}
        </span>
        <ChevronDown size={16} className="lum-dropdown-chevron" />
      </button>
      <div className="lum-dropdown-menu" role="listbox">
        {options.map((option) => (
          option.href ? (
            <a
              key={option.value}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className="lum-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <DropdownOptionContent icon={option.icon} label={option.label} />
            </a>
          ) : (
            <button
              key={option.value}
              type="button"
              className={`lum-dropdown-item${option.value === value ? ' is-active' : ''}`}
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
            >
              <DropdownOptionContent icon={option.icon} label={option.label} />
            </button>
          )
        ))}
      </div>
    </div>
  );
}
