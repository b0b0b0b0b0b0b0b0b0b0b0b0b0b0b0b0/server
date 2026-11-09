'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const MARKS = [4, 8, 16, 24, 32];

function shortGiB(value) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}G`;
}

export default function MemoryRange({ id, label, value, min, max, step, format, onChange, children }) {
  const [dragging, setDragging] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!dragging) return undefined;
    const stop = () => setDragging(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragging]);

  const percent = (v) => ((v - min) / (max - min)) * 100;

  const ticks = useMemo(() => {
    const list = [];
    for (let v = Math.ceil(min); v <= max; v += 1) list.push(v);
    if (list[0] !== min) list.unshift(min);
    return list;
  }, [min, max]);

  const marks = useMemo(() => [min, ...MARKS.filter((v) => v > min + 1.5 && v <= max)], [min, max]);
  const nearest = marks.reduce((best, v) => (Math.abs(v - value) < Math.abs(best - value) ? v : best), marks[0]);

  return (
    <div className={`field lum-range mem-range${dragging ? ' is-dragging' : ''}`}>
      <div className="lum-range-meta">
        <label className="field-label" htmlFor={id}>{label}</label>
        <span className="lum-range-value mem-range-value">
          <span key={value} className="mem-range-value-num">{format(value)}</span>
        </span>
      </div>

      <div ref={bodyRef} className="mem-range-body" style={{ '--p': percent(value) / 100 }}>
        <div className="mem-range-rail">
          <div className="mem-range-track">
            <div className="mem-range-fill" />
          </div>
          <input
            id={id}
            className="mem-range-input"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onPointerDown={() => setDragging(true)}
            onChange={(e) => {
              const next = Number(e.target.value);
              bodyRef.current?.style.setProperty('--p', String(percent(next) / 100));
              onChange(next);
            }}
          />
        </div>

        <div className="mem-range-ruler" aria-hidden>
          {ticks.map((v) => {
            const major = marks.includes(v);
            return (
              <span
                key={v}
                className={`mem-range-tick${major ? ' is-major' : ''}${v <= value ? ' is-on' : ''}`}
                style={{ '--tp': percent(v) / 100, '--d': Math.min(Math.abs(v - value), 6) }}
              />
            );
          })}
        </div>

        <div className="mem-range-marks">
          {marks.map((v) => (
            <button
              key={v}
              type="button"
              tabIndex={-1}
              className={`mem-range-mark${v <= value ? ' is-on' : ''}${v === nearest ? ' is-near' : ''}`}
              style={{ '--tp': percent(v) / 100 }}
              onClick={() => onChange(v)}
            >
              {shortGiB(v)}
            </button>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
