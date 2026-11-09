'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Activity, Blocks, Flag, Palette, Zap } from 'lucide-react';
import { tools } from '@/lib/config/tools';
import { useLocale } from '@/app/components/AppProviders';

const ICONS = {
  flag: Flag,
  zap: Zap,
  blocks: Blocks,
  palette: Palette,
  activity: Activity,
};

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function ToolNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const trackRef = useRef(null);
  const readyRef = useRef(false);
  const [glow, setGlow] = useState(null);
  const [ready, setReady] = useState(false);

  const current = tools.find((tool) => pathname === tool.href || pathname.startsWith(`${tool.href}/`));

  const measure = useCallback(() => {
    const track = trackRef.current;
    const active = track?.querySelector('.tool-nav-pill.is-active');
    if (!track || !active) {
      setGlow(null);
      return;
    }
    setGlow({ left: active.offsetLeft, width: active.offsetWidth, accent: active.dataset.accent });
    const right = active.offsetLeft + active.offsetWidth;
    if (right > track.scrollLeft + track.clientWidth || active.offsetLeft < track.scrollLeft) {
      track.scrollTo({ left: active.offsetLeft - 12, behavior: readyRef.current ? 'smooth' : 'auto' });
    }
  }, []);

  useIsoLayoutEffect(() => {
    measure();
  }, [pathname, measure]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      readyRef.current = true;
      setReady(true);
    });
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame);
    const observer = new ResizeObserver(() => measure());
    observer.observe(track);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  return (
    <nav className="tool-nav" aria-label={t('nav.tools')}>
      <div ref={trackRef} className="tool-nav-track">
        {glow ? (
          <span
            className={`tool-nav-glow${ready ? ' is-ready' : ''}`}
            data-accent={glow.accent}
            style={{ transform: `translateX(${glow.left}px)`, width: glow.width }}
            aria-hidden
          />
        ) : null}
        {tools.map((tool) => {
          const Icon = ICONS[tool.icon] || Activity;
          const active = tool.id === current?.id;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`tool-nav-pill${active ? ' is-active' : ''}`}
              data-accent={tool.accent}
              prefetch
              title={t(tool.titleKey)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="tool-nav-pill-icon" size={16} strokeWidth={2.25} aria-hidden />
              <span className="tool-nav-pill-label">{t(tool.titleKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
