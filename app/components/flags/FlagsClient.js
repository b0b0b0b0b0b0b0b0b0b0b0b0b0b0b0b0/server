'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CircleHelp,
  Code,
  Flag,
  Languages,
  MemoryStick,
  Pause,
  RefreshCw,
  ShieldOff,
  SquareTerminal,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import LumDropdown from '@/app/components/LumDropdown';
import ScriptOutput from '@/app/components/ScriptOutput';
import ServerSwitcher from '@/app/components/ServerSwitcher';
import ToggleField from '@/app/components/ToggleField';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { FlagsGenerator } from '@/lib/tools/flags/FlagsGenerator';
import { FlagsSoftware } from '@/lib/tools/flags/FlagsSoftware';
import {
  FLAG_DEFAULTS,
  FLAG_ENVIRONMENTS,
  FLAG_SOFTWARE,
  FLAG_PRESET_LINK_KEYS,
  FLAG_PRESET_LINKS,
  FLAG_PROXY_MEMORY_DOC,
  FLAG_PROXY_MEMORY_WARN_GIB,
  FLAG_SCRIPT_META,
} from '@/lib/config/flags';
import {
  resolveScriptBasename,
  resolveScriptFilename,
  scriptExtensionKey,
} from '@/lib/tools/flags/scriptFilename';
import { MEMORY_MAX, MEMORY_STEP } from '@/lib/config/constants';
import { formatGiB, memoryPercent } from '@/lib/ui/formatGiB';
import { ENVIRONMENT_ICONS } from '@/lib/ui/EnvironmentIcons';
import { SOFTWARE_ICONS } from '@/lib/ui/SoftwareIcons';

const CONFIG_TOGGLES = [
  {
    key: 'utf8Encoding',
    label: 'tools.flags.utf8Encoding',
    hint: 'tools.flags.utf8EncodingHint',
    Icon: Languages,
  },
  {
    key: 'useVariables',
    label: 'tools.flags.useVariables',
    hint: 'tools.flags.useVariablesHint',
    Icon: Code,
  },
  {
    key: 'autoRestart',
    label: 'tools.flags.autoRestart',
    hint: 'tools.flags.autoRestartHint',
    Icon: RefreshCw,
  },
];

export default function FlagsClient() {
  const { t } = useLocale();
  const { ready, activeServerId, activeServer, patch, workspace } = useWorkspace();
  const [engine, setEngine] = useState(null);
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!ready || !workspace) return;
    const saved = workspace.getFlags(activeServerId);
    const instance = new FlagsGenerator({ ...FLAG_DEFAULTS, ...saved });
    setEngine(instance);
    setOutput(instance.script());
  }, [ready, activeServerId]);

  const persist = (patchValues) => {
    if (!engine) return;
    const next = new FlagsGenerator({ ...engine.snapshot(), ...patchValues });
    setEngine(next);
    setOutput(next.script());
    patch((store) => {
      store.setFlags(activeServerId, next.snapshot());
    });
  };

  const state = engine?.snapshot() ?? FLAG_DEFAULTS;
  const showGuiToggle = FlagsSoftware.supportsGui(state.software);
  const showIgnoreJavaToggle = FlagsSoftware.supportsIgnoreJavaVersion(state.software);

  const environmentOptions = useMemo(
    () => FLAG_ENVIRONMENTS.map((key) => {
      const Icon = ENVIRONMENT_ICONS[key];
      return {
        value: key,
        label: t(`tools.flags.environments.${key}`),
        icon: Icon ? <Icon size={20} /> : null,
      };
    }),
    [t],
  );

  const softwareOptions = useMemo(
    () => FLAG_SOFTWARE.map((key) => {
      const Icon = SOFTWARE_ICONS[key];
      return {
        value: key,
        label: t(`tools.flags.softwares.${key}`),
        icon: Icon ? <Icon size={20} /> : null,
      };
    }),
    [t],
  );

  const flagOptions = useMemo(
    () => FlagsSoftware.presetsFor(state.software).map((key) => ({
      value: key,
      label: t(`tools.flags.flagPresets.${key}`),
    })),
    [state.software, t],
  );

  const flagHelpOptions = useMemo(
    () => FLAG_PRESET_LINK_KEYS.map((key) => ({
      value: key,
      label: t(`tools.flags.flagLinks.${key}`),
      href: FLAG_PRESET_LINKS[key],
    })),
    [t],
  );

  const handleSoftwareChange = (software) => {
    persist(FlagsSoftware.patchForSoftwareChange(state, software));
  };

  if (!ready || !engine) return null;

  const scriptMeta = FLAG_SCRIPT_META[state.environment] ?? FLAG_SCRIPT_META.linux;
  const scriptBasenames = activeServer?.flags?.scriptBasenames ?? {};
  const scriptExtension = scriptExtensionKey(state.environment);
  const scriptBasename = resolveScriptBasename(state.environment, scriptBasenames);
  const scriptFilename = resolveScriptFilename(state.environment, scriptBasenames);
  const filenameExtension = scriptExtension.startsWith('.') ? scriptExtension : '';
  const showWindowsPause = state.environment === 'windows';
  const isLaunchCommand = state.environment === 'pterodactyl' || state.environment === 'command';
  const showProxyMemoryWarning = FlagsSoftware.isProxy(state.software)
    && state.memory > FLAG_PROXY_MEMORY_WARN_GIB;
  const memoryMin = FlagsSoftware.memoryMin(state.software);

  const handleScriptBasenameChange = (basename) => {
    patch((store) => {
      store.setScriptBasename(activeServerId, state.environment, basename);
    });
  };

  return (
    <section className="tool-page flags-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon"><Flag size={20} /></span>
          {t('tools.flags.title')}
        </h1>
        <p className="tool-page-desc">{t('tools.flags.description')}</p>
      </header>

      <ServerSwitcher />

      <div className="tool-form-layout">
        <div className="tool-form-col">
          <div className="field">
            <label className="field-label" htmlFor="fileName">{t('tools.flags.fileName')}</label>
            <input
              id="fileName"
              className="lum-input"
              value={state.fileName}
              onChange={(e) => persist({ fileName: e.target.value })}
            />
            <p className="field-hint">{t('tools.flags.fileNameHint')}</p>
          </div>

          <div className="field-row">
            <div className="field">
              <LumDropdown
                id="environment-dropdown"
                label={t('tools.flags.environment')}
                value={state.environment}
                options={environmentOptions}
                onChange={(environment) => persist({ environment })}
              />
              <p className="field-hint">{t('tools.flags.environmentHint')}</p>
            </div>
            <div className="field">
              <LumDropdown
                id="software-dropdown"
                label={t('tools.flags.software')}
                value={state.software}
                options={softwareOptions}
                onChange={handleSoftwareChange}
              />
              <p className="field-hint">{t('tools.flags.softwareHint')}</p>
            </div>
          </div>

          <div className="field lum-range">
            <div className="lum-range-meta">
              <label className="field-label" htmlFor="memory">{t('tools.flags.memory')}</label>
              <span className="lum-range-value">{formatGiB(state.memory)}</span>
            </div>
            <div
              className="lum-range-track-wrap"
              style={{ '--range-percent': `${memoryPercent(state.memory, memoryMin, MEMORY_MAX)}%` }}
            >
              <div className="lum-range-track">
                <div className="lum-range-fill" />
              </div>
              <input
                id="memory"
                className="lum-range-input"
                type="range"
                min={memoryMin}
                max={MEMORY_MAX}
                step={MEMORY_STEP}
                value={state.memory}
                onInput={(e) => persist({ memory: Number(e.target.value) })}
              />
            </div>
            <p className="field-hint">{t('tools.flags.memoryHint')}</p>
            {showProxyMemoryWarning && (
              <p className="flags-proxy-memory-warning">
                {t('tools.flags.proxyMemoryWarning')}{' '}
                <a
                  href={FLAG_PROXY_MEMORY_DOC}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('tools.flags.proxyMemoryWarningDoc')}
                </a>
              </p>
            )}
          </div>

          <div className="toggle-group">
            <ToggleField
              id="calculateOverhead"
              icon={<MemoryStick size={24} />}
              label={t('tools.flags.calculateOverhead')}
              hint={t('tools.flags.calculateOverheadHint')}
              checked={state.calculateOverhead}
              onChange={(e) => persist({ calculateOverhead: e.target.checked })}
            />
          </div>
        </div>

        <div className="tool-form-col">
          <div className="field flags-field">
            <div className="flags-field-row">
              <LumDropdown
                id="flags-dropdown"
                label={t('tools.flags.flags')}
                value={state.flagPreset}
                options={flagOptions}
                onChange={(flagPreset) => persist({ flagPreset })}
              />
              <LumDropdown
                id="flagshelp-dropdown"
                iconOnly
                icon={<CircleHelp size={20} />}
                options={flagHelpOptions}
              />
            </div>
            <p className="field-hint">{t('tools.flags.flagsHint')}</p>
          </div>

          <div>
            <p className="field-group-title">{t('tools.flags.config')}</p>
            <p className="field-hint">{t('tools.flags.configHint')}</p>
          </div>

          <div className="toggle-list">
            {showGuiToggle ? (
              <ToggleField
                id="noGui"
                icon={<SquareTerminal size={24} />}
                label={t('tools.flags.noGui')}
                hint={t('tools.flags.noGuiHint')}
                checked={state.noGui}
                onChange={(e) => persist({ noGui: e.target.checked })}
              />
            ) : null}
            {showIgnoreJavaToggle ? (
              <ToggleField
                id="ignoreJavaVersion"
                icon={<ShieldOff size={24} />}
                label={t('tools.flags.ignoreJavaVersion')}
                hint={t('tools.flags.ignoreJavaVersionHint')}
                checked={state.ignoreJavaVersion}
                onChange={(e) => persist({ ignoreJavaVersion: e.target.checked })}
              />
            ) : null}
            {CONFIG_TOGGLES.map((item) => {
              const Icon = item.Icon;
              return (
                <ToggleField
                  key={item.key}
                  id={item.key}
                  icon={<Icon size={24} />}
                  label={t(item.label)}
                  hint={t(item.hint)}
                  checked={state[item.key]}
                  onChange={(e) => persist({ [item.key]: e.target.checked })}
                />
              );
            })}
            {showWindowsPause ? (
              <ToggleField
                id="windowsPause"
                icon={<Pause size={24} />}
                label={t('tools.flags.windowsPause')}
                hint={t('tools.flags.windowsPauseHint')}
                checked={state.windowsPause}
                onChange={(e) => persist({ windowsPause: e.target.checked })}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ScriptOutput
        id="script-output"
        value={output}
        title={t('tools.flags.script')}
        hint={t('tools.flags.scriptHint')}
        language={scriptMeta.language}
        filename={isLaunchCommand ? undefined : scriptFilename}
        filenameBasename={isLaunchCommand ? undefined : scriptBasename}
        filenameExtension={isLaunchCommand ? '' : filenameExtension}
        onBasenameChange={isLaunchCommand ? undefined : handleScriptBasenameChange}
        allowDownload={!isLaunchCommand}
      />
    </section>
  );
}
