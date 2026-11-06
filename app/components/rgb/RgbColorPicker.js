'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, Shuffle, Trash2 } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { RGB_SWATCHES } from '@/lib/config/rgb';
import { normalizeHex, rgbToHex } from '@/lib/tools/rgb/color';
import { hexToHsv, hsvToHex, hsvToRgb, rgbToHsv } from '@/lib/tools/rgb/hsv';

function randomHex() {
  return rgbToHex({
    r: Math.random() * 255,
    g: Math.random() * 255,
    b: Math.random() * 255,
  });
}

function useDragSurface(onMove) {
  const moveRef = useRef(onMove);

  useEffect(() => {
    moveRef.current = onMove;
  }, [onMove]);

  const bind = useCallback((getPoint) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      const surface = event.currentTarget;
      const pointerId = event.pointerId;
      surface.setPointerCapture(pointerId);

      const move = (e) => moveRef.current(getPoint(e));

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        surface.removeEventListener('pointermove', move);
        if (surface.hasPointerCapture(pointerId)) {
          surface.releasePointerCapture(pointerId);
        }
      };

      move(event);
      surface.addEventListener('pointermove', move);
      surface.addEventListener('pointerup', finish, { once: true });
      surface.addEventListener('pointercancel', finish, { once: true });
    },
  }), []);

  return bind;
}

export default function RgbColorPicker({
  hex,
  onChange,
  position,
  onPositionChange,
  onDelete,
  canDelete,
  positionMin = 0,
  positionMax = 100,
}) {
  const { t } = useLocale();
  const svRef = useRef(null);
  const hueRef = useRef(null);

  const normalized = normalizeHex(hex) ?? 'FFFFFF';
  const [hsv, setHsv] = useState(() => hexToHsv(normalized));

  useEffect(() => {
    const next = normalizeHex(hex);
    if (next) setHsv(hexToHsv(next));
  }, [hex]);

  const commitHsv = (next) => {
    setHsv(next);
    onChange(`#${hsvToHex(next)}`);
  };

  const svBind = useDragSurface((event) => {
    const surface = svRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    commitHsv({ ...hsv, s, v });
  });

  const hueBind = useDragSurface((event) => {
    const track = hueRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    commitHsv({ ...hsv, h: ratio * 360 });
  });

  const hueRgb = hsvToRgb({ h: hsv.h, s: 1, v: 1 });
  const hueColor = rgbToHex(hueRgb);
  const currentHex = hsvToHex(hsv);
  const svX = hsv.s * 100;
  const svY = (1 - hsv.v) * 100;
  const hueY = (hsv.h / 360) * 100;

  const stepPosition = (delta) => {
    if (position == null || !onPositionChange) return;
    onPositionChange(Math.min(positionMax, Math.max(positionMin, position + delta)));
  };

  return (
    <div className="rgb-picker" onMouseDown={(event) => event.stopPropagation()}>
      <div className="rgb-picker-toolbar">
        {position != null && onPositionChange ? (
          <div className="rgb-picker-position">
            <label className="rgb-picker-label" htmlFor="rgb-stop-position">
              {t('tools.rgb.position')}
            </label>
            <div className="rgb-picker-stepper">
              <button
                type="button"
                className="lum-btn rgb-picker-step"
                onClick={() => stepPosition(-1)}
                aria-label={t('tools.rgb.decrement')}
              >
                <Minus size={16} />
              </button>
              <input
                id="rgb-stop-position"
                type="number"
                className="lum-input rgb-picker-pos-input"
                min={positionMin}
                max={positionMax}
                step={1}
                value={position}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isNaN(next)) {
                    onPositionChange(Math.min(positionMax, Math.max(positionMin, next)));
                  }
                }}
              />
              <button
                type="button"
                className="lum-btn rgb-picker-step"
                onClick={() => stepPosition(1)}
                aria-label={t('tools.rgb.increment')}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {canDelete && onDelete ? (
          <button
            type="button"
            className="lum-btn rgb-picker-delete"
            onClick={onDelete}
            aria-label={t('tools.rgb.deleteColor')}
          >
            <Trash2 size={18} />
          </button>
        ) : null}
      </div>

      <div className="rgb-picker-body">
        <div className="rgb-picker-sliders">
          <div
            ref={svRef}
            className="rgb-picker-sv"
            style={{ '--picker-hue': `#${hueColor}` }}
            {...svBind((event) => event)}
          >
            <div className="rgb-picker-sv-overlay" />
            <span
              className="rgb-picker-sv-thumb"
              style={{
                left: `${svX}%`,
                top: `${svY}%`,
                background: `#${currentHex}`,
              }}
            />
          </div>

          <div
            ref={hueRef}
            className="rgb-picker-hue"
            {...hueBind((event) => event)}
          >
            <span
              className="rgb-picker-hue-thumb"
              style={{
                top: `${hueY}%`,
                background: `#${currentHex}`,
              }}
            />
          </div>
        </div>

        <div className="rgb-picker-meta">
          <div className="rgb-picker-hex-row">
            <span
              className="rgb-picker-preview"
              style={{ background: `#${currentHex}` }}
            />
            <input
              className="lum-input rgb-picker-hex-input"
              value={`#${currentHex}`}
              onChange={(event) => {
                const next = normalizeHex(event.target.value);
                if (next) onChange(`#${next}`);
              }}
              spellCheck={false}
            />
          </div>

          <div className="rgb-picker-swatches">
            {RGB_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`rgb-picker-swatch${swatch.toUpperCase() === `#${currentHex}` ? ' is-active' : ''}`}
                style={{ background: swatch }}
                onClick={() => onChange(swatch)}
                aria-label={swatch}
              />
            ))}
            <button
              type="button"
              className="lum-btn rgb-picker-swatch rgb-picker-swatch-random"
              onClick={() => onChange(`#${randomHex()}`)}
              aria-label={t('tools.rgb.randomColor')}
            >
              <Shuffle size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
