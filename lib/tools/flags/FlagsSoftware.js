import {
  FLAG_PRESETS_BUKKIT,
  FLAG_PRESETS_PROXY,
  FLAG_PROXY_SOFTWARE,
} from '@/lib/config/flags.js';

export class FlagsSoftware {
  static isProxy(software) {
    return FLAG_PROXY_SOFTWARE.includes(software);
  }

  static supportsGui(software) {
    return !FlagsSoftware.isProxy(software);
  }

  static presetsFor(software) {
    return FlagsSoftware.isProxy(software) ? FLAG_PRESETS_PROXY : FLAG_PRESETS_BUKKIT;
  }

  static normalizeState(state) {
    const next = { ...state };
    if (FlagsSoftware.isProxy(next.software) && !FLAG_PRESETS_PROXY.includes(next.flagPreset)) {
      next.flagPreset = 'proxy';
    }
    if (!FlagsSoftware.isProxy(next.software) && next.flagPreset === 'proxy') {
      next.flagPreset = 'aikars';
    }
    return next;
  }

  static patchForSoftwareChange(state, software) {
    const patch = { software };
    if (FlagsSoftware.isProxy(software) && !FLAG_PRESETS_PROXY.includes(state.flagPreset)) {
      patch.flagPreset = 'proxy';
    }
    if (!FlagsSoftware.isProxy(software) && state.flagPreset === 'proxy') {
      patch.flagPreset = 'aikars';
    }
    return patch;
  }
}
