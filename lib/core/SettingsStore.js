export class SettingsStore {
  constructor(storage) {
    this.storage = storage;
  }

  read(key, fallback = null) {
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  write(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  readTool(toolId, fallback = {}) {
    return this.read(`server-tools.tool.${toolId}`, fallback);
  }

  writeTool(toolId, value) {
    this.write(`server-tools.tool.${toolId}`, value);
  }
}
