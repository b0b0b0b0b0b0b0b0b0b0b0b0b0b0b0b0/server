'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function isInModal(anchor) {
  return Boolean(anchor?.closest('.plugin-modal-backdrop, .plugin-modal'));
}

function getTooltipLayer(anchor) {
  return isInModal(anchor) ? 1200 : 450;
}

function computeFloatingStyle(anchor, side) {
  const rect = anchor.getBoundingClientRect();
  const gap = 10;
  const zIndex = getTooltipLayer(anchor);

  const base = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    zIndex,
  };

  if (side === 'bottom') {
    return {
      ...base,
      top: `${rect.bottom + gap}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }

  if (side === 'left') {
    return {
      ...base,
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.left - gap}px`,
      transform: 'translate(-100%, -50%)',
    };
  }

  return {
    ...base,
    top: `${rect.top - gap}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translate(-50%, -100%)',
  };
}

export default function LumTooltip({
  content,
  side = 'top',
  className = '',
  delay = 420,
  children,
}) {
  const [visible, setVisible] = useState(false);
  const [floating, setFloating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bubbleStyle, setBubbleStyle] = useState(null);
  const anchorRef = useRef(null);
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

  useEffect(() => {
    setMounted(true);
    return () => clearTimers();
  }, []);

  const updateFloatingPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const style = computeFloatingStyle(anchor, side);
    if (style) setBubbleStyle(style);
  }, [side]);

  useLayoutEffect(() => {
    if (!visible || !floating) {
      setBubbleStyle(null);
      return undefined;
    }

    updateFloatingPosition();
    window.addEventListener('resize', updateFloatingPosition);
    window.addEventListener('scroll', updateFloatingPosition, true);
    return () => {
      window.removeEventListener('resize', updateFloatingPosition);
      window.removeEventListener('scroll', updateFloatingPosition, true);
    };
  }, [visible, floating, updateFloatingPosition]);

  if (!content) return children;

  const reveal = () => {
    const inModal = isInModal(anchorRef.current);
    setFloating(inModal);
    if (inModal) updateFloatingPosition();
    setVisible(true);
  };

  const show = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current || visible) return;
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      reveal();
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
      setFloating(false);
      setBubbleStyle(null);
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
      reveal();
    }
  };

  const handleBlur = () => {
    clearTimers();
    setVisible(false);
    setFloating(false);
    setBubbleStyle(null);
  };

  const floatingBubble = floating && visible && mounted && bubbleStyle
    ? createPortal(
      <div
        className={`lum-tooltip-float lum-tooltip-float--${side}`}
        style={bubbleStyle}
        role="tooltip"
      >
        {content}
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <span
        ref={anchorRef}
        className={`lum-tooltip${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
        data-side={side}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
        {!floating && (
          <span className="lum-tooltip-bubble" role="tooltip">
            {content}
          </span>
        )}
      </span>
      {floatingBubble}
    </>
  );
}
