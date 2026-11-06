'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Check,
  Copy,
  Italic,
  Palette,
  Shuffle,
  Sparkles,
  Strikethrough,
  Underline,
  Wand2,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import GradientEditor from '@/app/components/rgb/GradientEditor';
import LumDropdown from '@/app/components/LumDropdown';
import ToggleField from '@/app/components/ToggleField';
import {
  RGB_DEFAULT_STATE,
  RGB_DEFAULT_STOPS,
  RGB_FORMAT_BUTTONS,
  RGB_MAX_STOPS,
  RGB_MIN_STOPS,
} from '@/lib/config/rgb';
import { contrastTextColor, darkenHex, hexToRgb, normalizeHex, rgbToHex } from '@/lib/tools/rgb/color';
import { getFormatOptions } from '@/lib/tools/rgb/formats';
import {
  buildGradientSegments,
  generateRgbOutput,
  redistributeStops,
  sortStops,
} from '@/lib/tools/rgb/gradient';

function randomHex() {
  return rgbToHex({
    r: Math.random() * 255,
    g: Math.random() * 255,
    b: Math.random() * 255,
  });
}

function invertHex(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r: 255 - r, g: 255 - g, b: 255 - b });
}

function ObfuscateChar({ char }) {
  const [glyph, setGlyph] = useState(char);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const id = window.setInterval(() => {
      const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
      setGlyph(pool[Math.floor(Math.random() * pool.length)]);
    }, 90);
    return () => window.clearInterval(id);
  }, [char]);

  if (!active) return <>{char}</>;
  return <>{glyph}</>;
}

function FormatToolbar({ formats, onToggle, label }) {
  return (
    <div className="rgb-format-toolbar" role="toolbar" aria-label={label}>
      {RGB_FORMAT_BUTTONS.map((item) => {
        const active = formats[item.key];
        const icons = {
          bold: Bold,
          italic: Italic,
          underline: Underline,
          strikethrough: Strikethrough,
          obfuscate: Sparkles,
        };
        const Icon = icons[item.key];
        return (
          <button
            key={item.key}
            type="button"
            className={`rgb-format-btn${active ? ' is-active' : ''}`}
            onClick={() => onToggle(item.key)}
            title={`${item.code}`}
            aria-pressed={active}
          >
            <Icon size={16} strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}

export default function RgbClient() {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(() => ({
    ...RGB_DEFAULT_STATE,
    stops: redistributeStops(RGB_DEFAULT_STOPS.length, RGB_DEFAULT_STOPS),
  }));
  const [activeStopId, setActiveStopId] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const stopIdRef = useRef(RGB_DEFAULT_STOPS.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextStopId = () => {
    const id = stopIdRef.current;
    stopIdRef.current += 1;
    return id;
  };

  const patch = (values) => setState((prev) => ({ ...prev, ...values }));

  const segments = useMemo(
    () => buildGradientSegments(state.text, state),
    [state.text, state.stops, state.formats, state.trimSpaces, state.charsPerColor, state.disperse],
  );

  const output = useMemo(() => generateRgbOutput(state), [state, segments]);

  const formatOptions = useMemo(() => getFormatOptions(t), [t]);

  const charsPerColorOptions = useMemo(
    () => [1, 2].map((value) => ({ value, label: String(value) })),
    [],
  );

  const colorCountOptions = useMemo(
    () => Array.from({ length: RGB_MAX_STOPS - RGB_MIN_STOPS + 1 }, (_, index) => {
      const value = RGB_MIN_STOPS + index;
      return { value, label: String(value) };
    }),
    [],
  );

  const setStops = (stops) => setState((prev) => ({ ...prev, stops }));

  const openStopPicker = (id) => {
    setActiveStopId(id);
    setPickerOpen(true);
  };

  const setColorCount = (count) => {
    setState((prev) => {
      const nextStops = redistributeStops(count, prev.stops);
      stopIdRef.current = Math.max(stopIdRef.current, nextStops.length);
      return { ...prev, stops: nextStops };
    });
    setActiveStopId(0);
  };

  const randomizeColors = () => {
    setState((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) => ({ ...stop, hex: `#${randomHex()}` })),
    }));
  };

  const reverseColors = () => {
    setState((prev) => {
      const sorted = sortStops(prev.stops);
      const reversed = [...sorted].reverse().map((stop, index) => ({
        ...stop,
        position: sorted[index].position,
      }));
      return { ...prev, stops: reversed };
    });
  };

  const shuffleColors = () => {
    setState((prev) => {
      const sorted = sortStops(prev.stops);
      const hexes = sorted.map((stop) => stop.hex);
      for (let i = hexes.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [hexes[i], hexes[j]] = [hexes[j], hexes[i]];
      }
      return {
        ...prev,
        stops: sorted.map((stop, index) => ({ ...stop, hex: hexes[index] })),
      };
    });
  };

  const invertColors = () => {
    setState((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) => ({ ...stop, hex: `#${invertHex(stop.hex)}` })),
    }));
  };

  const toggleFormat = (key) => {
    setState((prev) => ({
      ...prev,
      formats: { ...prev.formats, [key]: !prev.formats[key] },
    }));
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const decorations = [];
  if (state.formats.underline) decorations.push('underline');
  if (state.formats.strikethrough) decorations.push('line-through');

  return (
    <section className="tool-page rgb-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon tool-page-title-icon--rose">
            <Palette size={20} />
          </span>
          {t('tools.rgb.title')}
        </h1>
        <p className="tool-page-desc">{t('tools.rgb.description')}</p>
      </header>

      {!mounted ? (
        <div className="rgb-page-skeleton" aria-hidden />
      ) : (
        <>
          <div className="rgb-hero-panel">
            <div className="rgb-hero-inner">
              <FormatToolbar
                formats={state.formats}
                onToggle={toggleFormat}
                label={t('tools.rgb.formatting')}
              />

              <div className="rgb-editor-shell rgb-editor-shell--hero">
                <div className="rgb-editor-preview rgb-editor-preview--hero" aria-hidden>
                  {segments.length ? segments.map((segment, index) => (
                    <span
                      key={`${segment.char}-${index}`}
                      className="rgb-preview-char"
                      style={{
                        color: `#${segment.hex}`,
                        fontWeight: state.formats.bold ? 700 : 500,
                        fontStyle: state.formats.italic ? 'italic' : 'normal',
                        textDecoration: decorations.length ? decorations.join(' ') : 'none',
                        textShadow: `1px 1px 0 #${darkenHex(segment.hex, 0.35)}`,
                      }}
                    >
                      {state.formats.obfuscate ? (
                        <ObfuscateChar char={segment.char} />
                      ) : (
                        segment.char === ' ' ? '\u00a0' : segment.char
                      )}
                    </span>
                  )) : (
                    <span className="rgb-preview-placeholder">{t('tools.rgb.previewEmpty')}</span>
                  )}
                </div>
                <textarea
                  className="rgb-editor-input rgb-editor-input--hero"
                  value={state.text}
                  onChange={(event) => patch({ text: event.target.value })}
                  spellCheck={false}
                  aria-label={t('tools.rgb.inputLabel')}
                />
              </div>

              <div className="rgb-hero-gradient">
                <div className="rgb-gradient-actions">
                  <button type="button" className="lum-btn rgb-mini-btn" onClick={randomizeColors}>
                    <Wand2 size={14} />
                    {t('tools.rgb.random')}
                  </button>
                  <button type="button" className="lum-btn rgb-mini-btn" onClick={reverseColors}>
                    {t('tools.rgb.reverse')}
                  </button>
                  <button type="button" className="lum-btn rgb-mini-btn" onClick={shuffleColors}>
                    <Shuffle size={14} />
                    {t('tools.rgb.shuffle')}
                  </button>
                  <button type="button" className="lum-btn rgb-mini-btn" onClick={invertColors}>
                    {t('tools.rgb.invert')}
                  </button>
                </div>
                <GradientEditor
                  stops={state.stops}
                  activeStopId={activeStopId}
                  onActiveStopIdChange={setActiveStopId}
                  onStopsChange={setStops}
                  pickerOpen={pickerOpen}
                  onPickerOpenChange={setPickerOpen}
                  nextStopId={nextStopId}
                />
              </div>
            </div>
          </div>

          <div className="rgb-layout">
            <aside className="rgb-col rgb-col-colors">
              <div className="rgb-panel rgb-colors-panel">
                <div className="rgb-panel-head">
                  <span className="rgb-panel-title">{t('tools.rgb.colors')}</span>
                  <LumDropdown
                    id="rgb-color-count"
                    label={t('tools.rgb.colorCount')}
                    value={state.stops.length}
                    options={colorCountOptions}
                    onChange={(value) => setColorCount(Number(value))}
                  />
                </div>

                <ul className="rgb-color-list">
                  {sortStops(state.stops).map((stop) => {
                    const hex = normalizeHex(stop.hex) ?? 'FFFFFF';
                    const isActive = stop.id === activeStopId;
                    return (
                      <li key={stop.id}>
                        <button
                          type="button"
                          className={`rgb-color-row${isActive ? ' is-active' : ''}`}
                          onClick={() => openStopPicker(stop.id)}
                        >
                          <span
                            className="rgb-color-swatch"
                            style={{ background: `#${hex}`, color: contrastTextColor(hex) }}
                          >
                            <input
                              type="color"
                              className="rgb-color-picker"
                              value={`#${hex}`}
                              onChange={(event) => {
                                setStops(state.stops.map((item) => (
                                  item.id === stop.id ? { ...item, hex: event.target.value } : item
                                )));
                              }}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={t('tools.rgb.pickColor')}
                            />
                          </span>
                          <span className="rgb-color-meta">
                            <span className="rgb-color-pos">{stop.position}%</span>
                            <input
                              className="rgb-color-hex lum-input"
                              value={`#${hex}`}
                              onChange={(event) => {
                                const next = normalizeHex(event.target.value);
                                if (next) {
                                  setStops(state.stops.map((item) => (
                                    item.id === stop.id ? { ...item, hex: `#${next}` } : item
                                  )));
                                }
                              }}
                              onClick={(event) => event.stopPropagation()}
                              spellCheck={false}
                            />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            <div className="rgb-col rgb-col-output">
              <div className="rgb-panel rgb-output-panel">
                <div className="rgb-output-head">
                  <h2 className="rgb-output-title">{t('tools.rgb.output')}</h2>
                  <p className="field-hint rgb-output-hint">{t('tools.rgb.outputHint')}</p>
                </div>
                <LumDropdown
                  id="rgb-format"
                  label={t('tools.rgb.format')}
                  value={state.formatId}
                  options={formatOptions}
                  onChange={(formatId) => patch({ formatId })}
                />
                <textarea
                  className="rgb-output-field lum-input"
                  value={output}
                  readOnly
                  spellCheck={false}
                  aria-label={t('tools.rgb.output')}
                />
                <button
                  type="button"
                  className={`lum-btn lum-btn-primary rgb-copy-btn rgb-copy-btn--block${copied ? ' is-copied' : ''}`}
                  onClick={copyOutput}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
              </div>
            </div>

            <aside className="rgb-col rgb-col-settings">
              <div className="rgb-panel rgb-settings-panel">
                <span className="rgb-panel-title">{t('tools.rgb.settings')}</span>
                <div className="rgb-settings-grid">
                  <LumDropdown
                    id="rgb-chars-per-color"
                    label={t('tools.rgb.charsPerColor')}
                    value={state.charsPerColor}
                    options={charsPerColorOptions}
                    onChange={(value) => patch({ charsPerColor: Number(value) })}
                  />
                  <div className="field">
                    <label className="field-label" htmlFor="rgb-prefix">{t('tools.rgb.prefixSuffix')}</label>
                    <input
                      id="rgb-prefix"
                      className="lum-input"
                      value={state.prefixSuffix}
                      onChange={(event) => patch({ prefixSuffix: event.target.value })}
                      placeholder={t('tools.rgb.prefixSuffixPlaceholder')}
                      spellCheck={false}
                    />
                    <p className="field-hint">{t('tools.rgb.prefixSuffixHint')}</p>
                  </div>
                </div>
                <div className="rgb-toggles">
                  <ToggleField
                    id="rgb-disperse"
                    label={t('tools.rgb.disperse')}
                    hint={t('tools.rgb.disperseHint')}
                    checked={state.disperse}
                    onChange={(event) => patch({ disperse: event.target.checked })}
                  />
                  <ToggleField
                    id="rgb-trim-spaces"
                    label={t('tools.rgb.trimSpaces')}
                    hint={t('tools.rgb.trimSpacesHint')}
                    checked={state.trimSpaces}
                    onChange={(event) => patch({ trimSpaces: event.target.checked })}
                  />
                  <ToggleField
                    id="rgb-lowercase"
                    label={t('tools.rgb.lowercase')}
                    hint={t('tools.rgb.lowercaseHint')}
                    checked={state.lowercase}
                    onChange={(event) => patch({ lowercase: event.target.checked })}
                  />
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
