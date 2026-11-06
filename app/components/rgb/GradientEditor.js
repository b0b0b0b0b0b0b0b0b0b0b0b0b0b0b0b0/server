'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import RgbColorPicker from '@/app/components/rgb/RgbColorPicker';
import { RGB_DEFAULT_STOPS, RGB_MAX_STOPS, RGB_MIN_STOPS, RGB_STOP_HIT_RADIUS_PX } from '@/lib/config/rgb';
import { contrastTextColor, normalizeHex } from '@/lib/tools/rgb/color';
import { clampPopupLeft } from '@/lib/tools/rgb/hsv';
import { sampleGradientColor, sortStops } from '@/lib/tools/rgb/gradient';

function gradientCss(stops) {
  const sorted = sortStops(stops);
  if (!sorted.length) {
    const start = RGB_DEFAULT_STOPS[0].hex;
    const end = RGB_DEFAULT_STOPS[RGB_DEFAULT_STOPS.length - 1].hex;
    return `linear-gradient(90deg, ${start}, ${end})`;
  }
  const points = sorted.map((stop) => `#${normalizeHex(stop.hex) ?? 'FFFFFF'} ${stop.position}%`).join(', ');
  return `linear-gradient(90deg, ${points})`;
}

function stopAtPointer(stops, trackRect, clientX) {
  for (const stop of stops) {
    const stopX = trackRect.left + (stop.position / 100) * trackRect.width;
    if (Math.abs(clientX - stopX) <= RGB_STOP_HIT_RADIUS_PX) {
      return stop;
    }
  }
  return null;
}

function positionFromPointer(trackRect, clientX) {
  const ratio = (clientX - trackRect.left) / trackRect.width;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}

export default function GradientEditor({
  stops,
  activeStopId,
  onActiveStopIdChange,
  onStopsChange,
  pickerOpen,
  onPickerOpenChange,
  nextStopId,
}) {
  const { t } = useLocale();
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const draggingRef = useRef(null);
  const popupId = useId();
  const [addCursor, setAddCursor] = useState({
    active: false,
    percent: 0,
    visible: false,
    hex: 'FFFFFF',
  });

  const sorted = sortStops(stops);
  const activeStop = sorted.find((stop) => stop.id === activeStopId) ?? sorted[0] ?? null;

  const updateStop = useCallback((id, patch) => {
    onStopsChange(stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  }, [onStopsChange, stops]);

  const removeStop = useCallback((id) => {
    if (stops.length <= RGB_MIN_STOPS) return;
    const next = stops.filter((stop) => stop.id !== id);
    onStopsChange(next);
    const fallback = sortStops(next)[0];
    if (fallback) onActiveStopIdChange(fallback.id);
    else onPickerOpenChange(false);
  }, [onActiveStopIdChange, onPickerOpenChange, onStopsChange, stops]);

  const addStopAt = useCallback((position) => {
    if (stops.length >= RGB_MAX_STOPS) return;

    const hex = `#${sampleGradientColor(stops, position)}`;
    const id = nextStopId();
    const next = [...stops, { id, hex, position }];
    onStopsChange(next);
    onActiveStopIdChange(id);
    onPickerOpenChange(true);
  }, [nextStopId, onActiveStopIdChange, onPickerOpenChange, onStopsChange, stops]);

  const openStop = useCallback((id) => {
    onActiveStopIdChange(id);
    onPickerOpenChange(true);
  }, [onActiveStopIdChange, onPickerOpenChange]);

  useEffect(() => {
    const onMoveStopRef = { current: updateStop };
    onMoveStopRef.current = updateStop;

    const handlePointerMove = (event) => {
      const drag = draggingRef.current;
      const track = trackRef.current;
      if (!drag || !track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      const position = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
      onMoveStopRef.current(drag.id, { position });
    };

    const finishDrag = () => {
      draggingRef.current = null;
      setAddCursor((prev) => ({ ...prev, visible: false }));
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
    };

    const onPointerDown = (event) => {
      const handle = event.currentTarget;
      const id = Number(handle.dataset.stopId);
      const stop = stops.find((item) => item.id === id);
      if (!stop) return;
      event.preventDefault();
      event.stopPropagation();
      draggingRef.current = stop;
      openStop(stop.id);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', finishDrag);
    };

    const nodes = trackRef.current?.querySelectorAll('[data-stop-id]') ?? [];
    nodes.forEach((node) => node.addEventListener('pointerdown', onPointerDown));

    return () => {
      nodes.forEach((node) => node.removeEventListener('pointerdown', onPointerDown));
      finishDrag();
    };
  }, [openStop, stops, updateStop]);

  useEffect(() => {
    if (!pickerOpen) return undefined;

    const onPointerDown = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      onPickerOpenChange(false);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onPickerOpenChange(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onPickerOpenChange, pickerOpen]);

  const updateAddCursor = useCallback((event) => {
    const track = trackRef.current;
    if (!track || draggingRef.current) {
      setAddCursor((prev) => ({ ...prev, active: false, visible: false }));
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const percent = ratio * 100;
    const rounded = Math.round(percent);
    const overStop = stopAtPointer(stops, rect, event.clientX);
    const canAdd = !overStop && stops.length < RGB_MAX_STOPS;

    setAddCursor({
      active: true,
      percent,
      visible: canAdd,
      hex: sampleGradientColor(stops, rounded),
    });
  }, [stops]);

  const hideAddCursor = useCallback(() => {
    setAddCursor((prev) => ({ ...prev, active: false, visible: false }));
  }, []);

  const onTrackClick = (event) => {
    if (event.target.closest('[data-stop-id]')) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const overStop = stopAtPointer(stops, rect, event.clientX);
    if (overStop) {
      openStop(overStop.id);
      return;
    }
    const position = positionFromPointer(rect, event.clientX);
    addStopAt(position);
  };

  const popupLeft = activeStop ? clampPopupLeft(activeStop.position) : 50;

  return (
    <div className="rgb-gradient-wrap" ref={wrapRef}>
      <p className="field-hint rgb-gradient-hint">{t('tools.rgb.clickGradientAdd')}</p>
      <div className="rgb-gradient-bar">
        <div
          ref={trackRef}
          className={`rgb-gradient-track${addCursor.active ? ' is-hovering' : ''}`}
          style={{ background: gradientCss(stops) }}
          onClick={onTrackClick}
          onPointerMove={updateAddCursor}
          onPointerLeave={hideAddCursor}
          role="presentation"
        >
          {addCursor.visible ? (
            <span
              className="rgb-gradient-add-cursor"
              style={{
                left: `${addCursor.percent}%`,
                background: `#${addCursor.hex}`,
                color: contrastTextColor(addCursor.hex),
              }}
              aria-hidden
            >
              <Plus size={11} strokeWidth={2.75} />
            </span>
          ) : null}
          {sorted.map((stop) => (
            <button
              key={stop.id}
              type="button"
              data-stop-id={stop.id}
              className={`rgb-gradient-stop${stop.id === activeStopId ? ' is-active' : ''}`}
              style={{ left: `${stop.position}%` }}
              onClick={(event) => {
                event.stopPropagation();
                openStop(stop.id);
              }}
              aria-label={`${stop.position}%`}
              aria-expanded={pickerOpen && stop.id === activeStopId}
              aria-controls={pickerOpen && stop.id === activeStopId ? popupId : undefined}
            >
              <span
                className="rgb-gradient-stop-core"
                style={{ background: `#${normalizeHex(stop.hex) ?? 'FFFFFF'}` }}
              />
            </button>
          ))}
        </div>
      </div>

      {pickerOpen && activeStop ? (
        <div
          id={popupId}
          className="rgb-gradient-popup"
          style={{ left: `${popupLeft}%` }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <RgbColorPicker
            hex={activeStop.hex}
            position={activeStop.position}
            positionMin={0}
            positionMax={100}
            canDelete={stops.length > RGB_MIN_STOPS}
            onChange={(hex) => updateStop(activeStop.id, { hex })}
            onPositionChange={(position) => updateStop(activeStop.id, { position })}
            onDelete={() => removeStop(activeStop.id)}
          />
        </div>
      ) : null}
    </div>
  );
}
