function mapSpigotVersion(version) {
  return {
    id: version.id,
    name: version.name,
    releaseDate: new Date(version.releaseDate),
  };
}

export class SpigotPlugin {
  static async search(query) {
    const params = new URLSearchParams({ size: '8' });
    const response = await fetch(
      `https://api.spiget.org/v2/search/resources/${encodeURIComponent(query)}?${params}`,
    );
    if (!response.ok) throw new Error(`Spigot search failed (${response.status})`);
    return response.json();
  }

  constructor(plugin) {
    this.type = 'spigot';
    Object.assign(this, plugin);
  }

  fromData(data) {
    this.name = data.name;
    this.description = data.tag;
    this.url = data.url ?? `https://www.spigotmc.org/resources/${data.id}`;
    this.iconUrl = data.icon?.url ? `https://www.spigotmc.org/${data.icon.url}` : undefined;
    this.mcVersions = data.testedVersions;
    this.releaseDate = data.releaseDate ? new Date(data.releaseDate) : undefined;
    this.updateDate = data.updateDate ? new Date(data.updateDate) : undefined;
    this.sourceCodeLink = data.sourceCodeLink;
    if (data.file) {
      this.file = {
        type: data.file.type,
        size: data.file.size,
        sizeUnit: data.file.sizeUnit,
        url: data.file.url,
        externalUrl: data.file.externalUrl,
      };
    }
    return this;
  }

  async fetchData() {
    const response = await fetch(`https://api.spiget.org/v2/resources/${this.id}`);
    if (!response.ok) throw new Error(`Spigot resource not found (${response.status})`);
    const data = await response.json();
    return this.fromData(data);
  }

  async fetchVersions() {
    const response = await fetch(
      `https://api.spiget.org/v2/resources/${this.id}/versions?size=100&sort=-releaseDate`,
    );
    if (!response.ok) throw new Error(`Spigot versions failed (${response.status})`);
    const versions = await response.json();
    this.versions = versions.map(mapSpigotVersion);
    this.latestVersion = this.versions[0];
    return this;
  }

  async fetch() {
    await this.fetchData();
    await this.fetchVersions();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      url: this.url,
      iconUrl: this.iconUrl,
      mcVersions: this.mcVersions,
      releaseDate: this.releaseDate,
      updateDate: this.updateDate,
      versions: this.versions,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
      file: this.file,
      sourceCodeLink: this.sourceCodeLink,
    };
  }
}

import { openPluginDownload } from '@/lib/tools/plugins/pluginUtils';

export async function downloadSpigotPlugin(plugin, rateLimit) {
  const result = openPluginDownload(plugin, rateLimit);
  if (result.opened) return;

  if (!result.deferred) return;

  await new Promise((resolve) => {
    setTimeout(resolve, rateLimit.resetTime - Date.now());
  });
  rateLimit.downloadCount = 0;

  openPluginDownload(plugin, rateLimit);
}
