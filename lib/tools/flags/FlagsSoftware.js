import {
  FLAG_PRESETS_BUKKIT,
  FLAG_PRESETS_PROXY,
  FLAG_PROXY_MEMORY_MIN_GIB,
  FLAG_PROXY_SOFTWARE,
} from '@/lib/config/flags.js';
import { MEMORY_MIN } from '@/lib/config/constants.js';

export class FlagsSoftware {
  static isProxy(software) {
    return FLAG_PROXY_SOFTWARE.includes(software);
  }

  static memoryMin(software) {
    return FlagsSoftware.isProxy(software) ? FLAG_PROXY_MEMORY_MIN_GIB : MEMORY_MIN;
  }

  static clampMemory(state) {
    const min = FlagsSoftware.memoryMin(state.software);
    if (Number(state.memory) < min) {
      return { ...state, memory: min };
    }
    return state;
  }

  static supportsGui(software) {
    return !FlagsSoftware.isProxy(software);
  }

  static supportsIgnoreJavaVersion(software) {
    return !FlagsSoftware.isProxy(software);
  }

  static presetsFor(software) {
    return FlagsSoftware.isProxy(software) ? FLAG_PRESETS_PROXY : FLAG_PRESETS_BUKKIT;
  }

  static normalizeState(state) {
    const next = { ...state };
    if (!next.flagPreset) {
      next.flagPreset = FlagsSoftware.isProxy(next.software) ? 'proxy' : 'aikars';
    }
    if (FlagsSoftware.isProxy(next.software) && !FLAG_PRESETS_PROXY.includes(next.flagPreset)) {
      next.flagPreset = 'proxy';
    }
    if (!FlagsSoftware.isProxy(next.software) && next.flagPreset === 'proxy') {
      next.flagPreset = 'aikars';
    }
    return FlagsSoftware.clampMemory(next);
  }

  static patchForSoftwareChange(state, software) {
    const patch = { software };
    if (FlagsSoftware.isProxy(software) && !FLAG_PRESETS_PROXY.includes(state.flagPreset)) {
      patch.flagPreset = 'proxy';
    }
    if (!FlagsSoftware.isProxy(software) && state.flagPreset === 'proxy') {
      patch.flagPreset = 'aikars';
    }
    return FlagsSoftware.clampMemory({ ...state, ...patch });
  }
}
