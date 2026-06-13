import { FLAG_DEFAULTS, FLAG_RESTART, FLAG_UTF8_ENCODING } from '@/lib/config/flags.js';
import { MEMORY_OVERHEAD_MIN_MIB } from '@/lib/config/constants.js';
import { FlagPresets } from '@/lib/tools/flags/FlagPresets.js';
import { FlagsSoftware } from '@/lib/tools/flags/FlagsSoftware.js';

export class FlagsGenerator {
  constructor(settings = {}) {
    this.state = FlagsSoftware.normalizeState({ ...FLAG_DEFAULTS, ...settings });
  }

  patch(values) {
    this.state = { ...this.state, ...values };
  }

  snapshot() {
    return { ...this.state };
  }

  memoryMiB() {
    const base = Math.round(Number(this.state.memory) * 1024);
    if (!this.state.calculateOverhead) {
      return base;
    }
    const adjusted = Math.ceil(((11 * base) / 12 - 1200) / 100) * 100;
    return Math.max(MEMORY_OVERHEAD_MIN_MIB, adjusted);
  }

  script() {
    const state = this.state;

    if (state.environment === 'windows') {
      return this.windows(state);
    }
    if (state.environment === 'pterodactyl' || state.environment === 'command') {
      return this.javaCommand(state, { variables: false });
    }
    return this.unix(state);
  }

  usesScriptVariables(state) {
    return state.useVariables;
  }

  javaCommand(state, options = {}) {
    const memory = this.memoryMiB();
    const flags = FlagPresets.build(state.flagPreset, Number(state.memory));
    const noGui = FlagsSoftware.supportsGui(state.software) && state.noGui;
    const variables = options.variables ?? this.usesScriptVariables(state);
    const parts = ['java'];

    if (state.utf8Encoding) {
      parts.push(FLAG_UTF8_ENCODING);
    }

    if (variables) {
      if (options.windows) {
        parts.push('-Xms%memory%M', '-Xmx%memory%M');
      } else {
        parts.push('-Xms"$memory"M', '-Xmx"$memory"M');
      }
    } else {
      parts.push(`-Xms${memory}M`, `-Xmx${memory}M`);
    }

    if (flags) {
      parts.push(flags);
    }

    parts.push('-jar');

    if (variables) {
      parts.push(options.windows ? '%fileName%' : '"$fileName"');
    } else {
      parts.push(state.fileName);
    }

    if (noGui) {
      parts.push('--nogui');
    }

    return parts.join(' ');
  }

  unix(state) {
    const lines = ['#!/usr/bin/env bash', ''];

    if (this.usesScriptVariables(state)) {
      lines.push(
        `fileName="${state.fileName}"`,
        `memory=${this.memoryMiB()}`,
        '',
        'declare -i memory',
        '',
      );
    }

    const java = this.javaCommand(state);

    if (state.autoRestart) {
      lines.push('while true; do');
      lines.push(java);
      lines.push('');
      lines.push(`echo "${FLAG_RESTART.restartingMessage}"`);
      lines.push(`echo "${FLAG_RESTART.cancelMessage}"`);
      lines.push(`sleep ${FLAG_RESTART.sleepSeconds}`);
      lines.push('done');
      return lines.join('\n');
    }

    lines.push(java);
    return lines.join('\n');
  }

  windows(state) {
    const lines = ['@echo off'];

    if (this.usesScriptVariables(state)) {
      lines.push(
        `set fileName="${state.fileName}"`,
        `set /A memory=${this.memoryMiB()}`,
        '',
      );
    }

    const java = this.javaCommand(state, { variables: this.usesScriptVariables(state), windows: true });

    if (state.autoRestart) {
      lines.push(':restart');
      lines.push(java);
      lines.push(`echo ${FLAG_RESTART.restartingMessage}`);
      lines.push(`echo ${FLAG_RESTART.cancelMessage}`);
      lines.push(`timeout /t ${FLAG_RESTART.sleepSeconds}`);
      lines.push('goto restart');
      return lines.join('\n');
    }

    lines.push(java);
    if (state.windowsPause) {
      lines.push('pause');
    }
    return lines.join('\n');
  }
}
