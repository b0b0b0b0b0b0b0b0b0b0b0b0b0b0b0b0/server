'use client';

import { useEffect, useRef, useState } from 'react';

export default function LumTooltip({
  content,
  side = 'top',
  className = '',
  delay = 420,
  children,
}) {
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const clearTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  if (!content) return children;

  const show = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current || visible) return;
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      setVisible(false);
    }, 60);
  };

  const handlePointerEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) show();
  };

  const handlePointerLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) hide();
  };

  const handleFocus = (event) => {
    if (event.target.matches(':focus-visible')) {
      clearTimers();
      setVisible(true);
    }
  };

  const handleBlur = () => {
    clearTimers();
    setVisible(false);
  };

  return (
    <span
      className={`lum-tooltip${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      data-side={side}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <span className="lum-tooltip-bubble" role="tooltip">
        {content}
      </span>
    </span>
  );
}
