'use client';

import { Plus } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { useWorkspace } from '@/app/components/WorkspaceProvider';

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

  if (!ready) return null;

  const handleAdd = () => {
    const template = t('workspace.defaultServerName');
    patch((store) => {
      store.addServer(nextServerName(store.serverList, template));
    });
  };

  const handleDelete = (serverId, serverName) => {
    if (!window.confirm(t('workspace.confirmDelete', { name: serverName }))) return;
    patch((store) => {
      store.deleteServer(serverId);
    });
  };

  const handleRename = (serverId, serverName) => {
    const name = window.prompt(t('workspace.renamePrompt'), serverName);
    if (!name?.trim() || name.trim() === serverName) return;
    patch((store) => {
      store.renameServer(serverId, name.trim());
    });
  };

  return (
    <div className={`server-switcher${className ? ` ${className}` : ''}`}>
      <div className="server-switcher-tabs">
        {serverList.map((server) => (
          <div key={server.id} className="server-switcher-tab-wrap">
            <button
              type="button"
              className={`lum-btn server-switcher-tab${activeServerId === server.id ? ' is-active' : ''}`}
              onClick={() => patch((store) => { store.setActiveServer(server.id); })}
              onDoubleClick={(event) => {
                event.preventDefault();
                handleRename(server.id, server.name);
              }}
              title={`${server.name} — ${t('workspace.renameHint')}`}
            >
              {server.name}
            </button>
            <button
              type="button"
              className="server-switcher-tab-close"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(server.id, server.name);
              }}
              aria-label={t('workspace.deleteServer')}
              title={t('workspace.deleteServer')}
            />
          </div>
        ))}
        <button
          type="button"
          className="lum-btn server-switcher-tab server-switcher-tab--add"
          onClick={handleAdd}
          title={t('workspace.addServer')}
          aria-label={t('workspace.addServer')}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
