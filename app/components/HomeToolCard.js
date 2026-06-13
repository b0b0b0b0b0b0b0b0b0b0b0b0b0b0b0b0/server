'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const MAX_TILT = 15;
const TRACK_DELAY_MS = 240;
const SETTLE_MS = 920;

const IDLE = {
  rotateX: 0,
  rotateY: 0,
  shineAngle: 155,
  shineFade: 42,
  shineStrength: 50,
};

function tiltFromPointer(surface, clientX, clientY) {
  const rect = surface.getBoundingClientRect();
  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;
  const offsetX = relX - 0.5;
  const offsetY = relY - 0.5;

  return {
    rotateX: -offsetY * MAX_TILT,
    rotateY: offsetX * MAX_TILT,
    shineAngle: 155 + offsetX * 38,
    shineFade: 36 + (0.5 - offsetY) * 22,
    shineStrength: 58 + Math.min(28, (Math.abs(offsetX) + Math.abs(offsetY)) * 32),
  };
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeOutCubic(amount) {
  return 1 - (1 - amount) ** 3;
}

function mixTilt(from, to, amount) {
  return {
    rotateX: lerp(from.rotateX, to.rotateX, amount),
    rotateY: lerp(from.rotateY, to.rotateY, amount),
    shineAngle: lerp(from.shineAngle, to.shineAngle, amount),
    shineFade: lerp(from.shineFade, to.shineFade, amount),
    shineStrength: lerp(from.shineStrength, to.shineStrength, amount),
  };
}

export default function HomeToolCard({ tool, title, description, Icon }) {
  const surfaceRef = useRef(null);
  const frameRef = useRef(null);
  const settleRef = useRef(null);
  const trackRef = useRef(null);
  const tiltRef = useRef(IDLE);
  const [active, setActive] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [settling, setSettling] = useState(false);
  const [tilt, setTilt] = useState(IDLE);
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    tiltRef.current = tilt;
  }, [tilt]);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanTilt(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(
    () => () => {
      if (trackRef.current) clearTimeout(trackRef.current);
      if (settleRef.current) cancelAnimationFrame(settleRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const cancelSettle = useCallback(() => {
    if (settleRef.current) {
      cancelAnimationFrame(settleRef.current);
      settleRef.current = null;
    }
    setSettling(false);
  }, []);

  const enableTracking = useCallback(() => {
    if (trackRef.current) {
      clearTimeout(trackRef.current);
      trackRef.current = null;
    }
    setTracking(true);
  }, []);

  const handleMove = useCallback(
    (event) => {
      if (!canTilt || settling) return;

      const surface = surfaceRef.current;
      if (!surface) return;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      const { clientX, clientY } = event;
      frameRef.current = requestAnimationFrame(() => {
        setTilt(tiltFromPointer(surface, clientX, clientY));
      });
    },
    [canTilt, settling],
  );

  const handleEnter = useCallback(
    (event) => {
      if (!canTilt) return;

      cancelSettle();

      const surface = surfaceRef.current;
      if (!surface) return;

      setActive(true);
      setTracking(false);
      setTilt(tiltFromPointer(surface, event.clientX, event.clientY));

      if (trackRef.current) clearTimeout(trackRef.current);
      trackRef.current = setTimeout(enableTracking, TRACK_DELAY_MS);
    },
    [canTilt, cancelSettle, enableTracking],
  );

  const handleLeave = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (trackRef.current) {
      clearTimeout(trackRef.current);
      trackRef.current = null;
    }

    setTracking(false);
    setSettling(true);

    const from = tiltRef.current;
    const startedAt = performance.now();

    const step = (now) => {
      const amount = easeOutCubic(Math.min(1, (now - startedAt) / SETTLE_MS));
      const next = mixTilt(from, IDLE, amount);
      setTilt(next);

      if (amount < 1) {
        settleRef.current = requestAnimationFrame(step);
        return;
      }

      setSettling(false);
      setActive(false);
      setTilt(IDLE);
      settleRef.current = null;
    };

    settleRef.current = requestAnimationFrame(step);
  }, []);

  return (
    <div className="home-tool-card-slot">
      <Link href={tool.href} className="home-tool-card-link">
        <div
          ref={surfaceRef}
          className={`home-tool-card-surface home-tool-card--${tool.id}${active ? ' is-active' : ''}${tracking ? ' is-tracking' : ''}${settling ? ' is-settling' : ''}`}
          style={{
            '--shine-angle': `${tilt.shineAngle}deg`,
            '--shine-fade': `${tilt.shineFade}%`,
            '--shine-peak': `${tilt.shineStrength}%`,
            transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          }}
          onMouseEnter={handleEnter}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          <span className="home-tool-card-frost" aria-hidden />
          <span className={`home-tool-card-icon home-tool-card-icon--${tool.accent}`}>
            {Icon && <Icon size={20} strokeWidth={2.25} />}
          </span>
          <span className="home-tool-card-title">{title}</span>
          <span className="home-tool-card-desc">{description}</span>
          {tool.homeTags?.length > 0 && (
            <ul className="home-tool-card-tags">
              {tool.homeTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          <span className="home-tool-card-arrow">
            <ArrowUpRight size={16} strokeWidth={2.25} />
          </span>
        </div>
      </Link>
    </div>
  );
}
