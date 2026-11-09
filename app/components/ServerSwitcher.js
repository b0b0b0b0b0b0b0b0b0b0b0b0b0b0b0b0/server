'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import LumTooltip from '@/app/components/LumTooltip';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import AccountSync from '@/app/components/workspace/AccountSync';

function nextServerName(serverList, template) {
  const names = new Set(serverList.map((server) => server.name));
  if (!names.has(template)) return template;
  let index = 2;
  while (names.has(`${template} (${index})`)) {
    index += 1;
  }
  return `${template} (${index})`;
}

export default function ServerSwitcher({ className = '' }) {
  const { t } = useLocale();
  const { ready, serverList, activeServerId, patch } = useWorkspace();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const tabsRef = useRef(null);
  const itemRefs = useRef(new Map());
  const dragRef = useRef(null);
  const positionsRef = useRef(new Map());
  const orderKeyRef = useRef('');

  const orderKey = serverList.map((server) => server.id).join('|');

  const placeDragged = () => {
    const drag = dragRef.current;
    const el = drag && itemRefs.current.get(drag.id);
    const box = tabsRef.current?.getBoundingClientRect();
    if (!drag || !el || !box) return;
    const x = drag.x - box.left - drag.grabX - el.offsetLeft;
    const y = drag.y - box.top - drag.grabY - el.offsetTop;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  useLayoutEffect(() => {
    const reordered = orderKeyRef.current !== orderKey;
    orderKeyRef.current = orderKey;
    const prev = positionsRef.current;
    const next = new Map();
    itemRefs.current.forEach((el, id) => {
      next.set(id, { left: el.offsetLeft, top: el.offsetTop });
      const before = prev.get(id);
      if (!reordered || !before || id === dragRef.current?.id) return;
      const dx = before.left - el.offsetLeft;
      const dy = before.top - el.offsetTop;
      if (dx || dy) {
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          { duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
      }
    });
    positionsRef.current = next;
    placeDragged();
  });

  if (!ready) return null;

  const handleAdd = () => {
    const template = t('workspace.defaultServerName');
    patch((store) => {
      store.addServer(nextServerName(store.serverList, template));
    });
  };

  const handleDelete = (serverId, serverName) => {
    if (!window.confirm(t('workspace.confirmDelete', { name: serverName }))) return;
    if (editingId === serverId) setEditingId(null);
    patch((store) => {
      store.deleteServer(serverId);
    });
  };

  const startEditing = (server) => {
    setDraft(server.name);
    setEditingId(server.id);
  };

  const commit = (server) => {
    const name = draft.trim();
    setEditingId(null);
    if (!name || name === server.name) return;
    patch((store) => {
      store.renameServer(server.id, name);
    });
  };

  const handleTabClick = (server) => {
    if (activeServerId === server.id) {
      startEditing(server);
      return;
    }
    patch((store) => { store.setActiveServer(server.id); });
  };

  const onGripDown = (event, id) => {
    if (event.button !== 0) return;
    const el = itemRefs.current.get(id);
    if (!el) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      id,
      grabX: event.clientX - rect.left,
      grabY: event.clientY - rect.top,
      x: event.clientX,
      y: event.clientY,
    };
    setDraggingId(id);
  };

  const onGripMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    placeDragged();

    const el = itemRefs.current.get(drag.id);
    const box = tabsRef.current.getBoundingClientRect();
    const cx = drag.x - box.left - drag.grabX + el.offsetWidth / 2;
    const cy = drag.y - box.top - drag.grabY + el.offsetHeight / 2;

    let target = null;
    itemRefs.current.forEach((other, id) => {
      if (id === drag.id) return;
      const inRow = Math.abs(cy - (other.offsetTop + other.offsetHeight / 2)) < other.offsetHeight / 2;
      const inCol = Math.abs(cx - (other.offsetLeft + other.offsetWidth / 2)) < other.offsetWidth / 2;
      if (inRow && inCol) target = id;
    });
    if (!target) return;

    const ids = serverList.map((server) => server.id);
    const toIndex = ids.indexOf(target);
    patch((store) => { store.moveServer(drag.id, toIndex); });
  };

  const onGripUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const el = itemRefs.current.get(drag.id);
    if (el) {
      const from = el.style.transform;
      el.style.transform = '';
      if (from) {
        el.animate([{ transform: from }, { transform: 'none' }], {
          duration: 220,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        });
      }
    }
    setDraggingId(null);
  };

  return (
    <div className={`server-switcher${className ? ` ${className}` : ''}${draggingId ? ' is-sorting' : ''}`}>
      <div ref={tabsRef} className="server-switcher-tabs">
        {serverList.map((server) => {
          const active = activeServerId === server.id;
          const editing = editingId === server.id;
          return (
            <div
              key={server.id}
              ref={(el) => {
                if (el) itemRefs.current.set(server.id, el);
                else itemRefs.current.delete(server.id);
              }}
              className={`server-switcher-tab-wrap${serverList.length > 1 ? ' has-grip' : ''}${editing ? ' is-editing' : ''}${draggingId === server.id ? ' is-dragging' : ''}`}
            >
              {serverList.length > 1 ? (
                <span
                  className="server-switcher-grip"
                  aria-hidden
                  onPointerDown={(event) => onGripDown(event, server.id)}
                  onPointerMove={onGripMove}
                  onPointerUp={onGripUp}
                  onPointerCancel={onGripUp}
                >
                  <GripVertical size={14} strokeWidth={2.25} />
                </span>
              ) : null}
              {editing ? (
                <input
                  className={`server-switcher-tab server-switcher-tab-input${active ? ' is-active' : ''}`}
                  value={draft}
                  maxLength={48}
                  autoFocus
                  aria-label={t('workspace.renamePrompt')}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => commit(server)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                    if (event.key === 'Escape') {
                      setDraft(server.name);
                      setEditingId(null);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className={`lum-btn server-switcher-tab${active ? ' is-active' : ''}`}
                  onClick={() => handleTabClick(server)}
                  onDoubleClick={() => startEditing(server)}
                >
                  {server.name}
                </button>
              )}
              <LumTooltip content={t('workspace.tooltips.deleteServer')} side="bottom" delay={520}>
                <button
                  type="button"
                  className="server-switcher-tab-close"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(server.id, server.name);
                  }}
                  aria-label={t('workspace.deleteServer')}
                >
                  <X size={14} strokeWidth={2.25} aria-hidden />
                </button>
              </LumTooltip>
            </div>
          );
        })}
        <LumTooltip content={t('workspace.tooltips.addServer')} side="bottom" delay={520}>
          <button
            type="button"
            className="lum-btn server-switcher-tab server-switcher-tab--add"
            onClick={handleAdd}
            aria-label={t('workspace.addServer')}
          >
            <Plus size={16} />
          </button>
        </LumTooltip>
      </div>
      <AccountSync />
    </div>
  );
}
