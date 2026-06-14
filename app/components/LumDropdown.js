'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import LumTooltip from '@/app/components/LumTooltip';

function DropdownOptionContent({ icon, label }) {
  return (
    <span className="lum-dropdown-option-content">
      {icon ? <span className="lum-dropdown-option-icon">{icon}</span> : null}
      <span className="lum-dropdown-option-label">{label}</span>
    </span>
  );
}

function getMenuLayer(root) {
  if (root?.closest('.plugin-modal-backdrop')) return 1100;
  return 200;
}

export default function LumDropdown({
  id,
  label,
  value,
  options,
  onChange,
  icon,
  iconOnly = false,
  tooltip,
  className = '',
  menuClassName = '',
  menuMinWidth,
  footer,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computeMenuStyle = useCallback(() => {
    const trigger = triggerRef.current;
    const root = rootRef.current;
    if (!trigger || !root) return null;

    const rect = trigger.getBoundingClientRect();
    const isRtl = document.documentElement.dir === 'rtl';
    const inHeaderLocale = Boolean(root.closest('.site-header-locale'));
    const minWidth = iconOnly || inHeaderLocale
      ? 168
      : Math.max(rect.width, menuMinWidth ?? 0);
    const menuWidth = Math.max(rect.width, minWidth);
    const viewportPadding = 8;
    const maxHeight = Math.min(
      288,
      window.innerHeight - rect.bottom - viewportPadding,
    );

    let left = rect.left;
    if (iconOnly || inHeaderLocale) {
      left = isRtl ? rect.left : rect.right - menuWidth;
    }
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - menuWidth - viewportPadding),
    );

    return {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      maxHeight: `${Math.max(120, maxHeight)}px`,
      zIndex: getMenuLayer(root),
    };
  }, [iconOnly, menuMinWidth]);

  const updateMenuPosition = useCallback(() => {
    const style = computeMenuStyle();
    if (style) setMenuStyle(style);
  }, [computeMenuStyle]);

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  const toggleOpen = () => {
    setOpen((current) => {
      if (current) return false;
      const style = computeMenuStyle();
      if (style) setMenuStyle(style);
      return true;
    });
  };

  const menuItems = options.map((option) => (
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
  ));

  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? String(value ?? '');
  const selectedIcon = selected?.icon ?? icon;

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      id={id}
      className={`lum-btn lum-dropdown-trigger${iconOnly ? ' lum-dropdown-trigger-icon' : ''}`}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={toggleOpen}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={tooltip ? selectedLabel : undefined}
    >
      <span className="lum-dropdown-trigger-text">
        {selectedIcon ? (
          <span className="lum-dropdown-trigger-leading">{selectedIcon}</span>
        ) : null}
        <span className="lum-dropdown-trigger-label">{selectedLabel}</span>
      </span>
      <ChevronDown size={16} className="lum-dropdown-chevron" />
    </button>
  );

  const floatingMenu = open && mounted && menuStyle
    ? createPortal(
      <div
        ref={menuRef}
        className={[
          'lum-dropdown-menu',
          'lum-dropdown-menu--floating',
          footer ? 'lum-dropdown-menu--with-footer' : '',
          menuClassName,
        ].filter(Boolean).join(' ')}
        role="listbox"
        style={menuStyle}
      >
        {footer ? (
          <div className="lum-dropdown-menu-scroll">
            {menuItems}
          </div>
        ) : menuItems}
        {footer ? (
          <div
            className="lum-dropdown-menu-footer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {footer}
          </div>
        ) : null}
      </div>,
      document.body,
    )
    : null;

  const dropdown = (
    <div
      ref={rootRef}
      className={`lum-dropdown${open ? ' is-open' : ''}${iconOnly ? ' lum-dropdown-icon' : ''}${className ? ` ${className}` : ''}`}
    >
      {label ? <label htmlFor={id} className="field-label">{label}</label> : null}
      {trigger}
      {floatingMenu}
    </div>
  );

  if (!tooltip) return dropdown;

  return (
    <LumTooltip content={tooltip} side="bottom" className="lum-dropdown-tooltip-root">
      {dropdown}
    </LumTooltip>
  );
}
