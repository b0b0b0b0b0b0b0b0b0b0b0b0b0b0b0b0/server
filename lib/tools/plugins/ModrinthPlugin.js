import { getModrinthVersionLoaders } from '@/lib/tools/plugins/PluginLoaders';
import { getModrinthPluginUrl, toModrinthBlackUrl } from '@/lib/tools/plugins/pluginUtils';
import { normalizePluginFetchOptions } from '@/lib/tools/plugins/PluginFetchOptions';

function mapModrinthVersion(version) {
  return {
    id: version.id,
    name: version.version_number || version.name,
    releaseDate: new Date(version.date_published),
  };
}

function mapModrinthFile(version) {
  if (!version?.files?.length) return undefined;
  const file = version.files[0];
  return {
    name: file.filename,
    type: file.file_type,
    size: Math.round((file.size / (1024 * 1024)) * 100) / 100,
    sizeUnit: 'MB',
    url: file.url,
  };
}

function buildModrinthVersionQuery(software, gameVersion, { allVersions = false } = {}) {
  const params = new URLSearchParams();
  params.set('loaders', JSON.stringify(getModrinthVersionLoaders(software)));
  if (!allVersions && gameVersion) {
    params.set('game_versions', JSON.stringify([gameVersion]));
  }
  return params.toString();
}

async function fetchModrinthVersions(projectId, query) {
  const suffix = query ? `?${query}` : '';
  const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version${suffix}`);
  if (!response.ok) throw new Error(`Modrinth versions failed (${response.status})`);
  return response.json();
}

function buildModrinthSearchFacets(loaders, gameVersion) {
  const facets = [];
  if (loaders?.length) {
    facets.push(loaders.map((loader) => `categories:${loader}`));
  }
  if (gameVersion) {
    facets.push([`versions:${gameVersion}`]);
  }
  return facets;
}

export class ModrinthPlugin {
  static async search(query, loaders, gameVersion) {
    const params = new URLSearchParams({ query, limit: '8' });
    const facets = buildModrinthSearchFacets(loaders, gameVersion);
    if (facets.length) {
      params.set('facets', JSON.stringify(facets));
    }
    const response = await fetch(`https://api.modrinth.com/v2/search?${params}`);
    if (!response.ok) throw new Error(`Modrinth search failed (${response.status})`);
    const data = await response.json();
    return data.hits ?? [];
  }

  constructor(plugin) {
    this.type = 'modrinth';
    Object.assign(this, plugin);
  }

  fromData(data) {
    this.name = data.title ?? data.name;
    this.description = data.description;
    this.url = toModrinthBlackUrl(
      data.url ?? getModrinthPluginUrl(data.slug ?? data.project_id ?? this.id),
    );
    this.iconUrl = data.icon_url;
    this.mcVersions = data.game_versions;
    this.releaseDate = data.published ? new Date(data.published) : undefined;
    this.updateDate = data.updated ? new Date(data.updated) : undefined;
    this.sourceCodeLink = data.source_url;
    return this;
  }

  async fetchData() {
    const response = await fetch(`https://api.modrinth.com/v2/project/${this.id}`);
    if (!response.ok) throw new Error(`Modrinth project not found (${response.status})`);
    const data = await response.json();
    return this.fromData(data);
  }

  async fetchVersions(fetchOptions) {
    const { software, gameVersion, allVersions } = normalizePluginFetchOptions(fetchOptions);
    let query = buildModrinthVersionQuery(software, gameVersion, { allVersions });
    let versions = await fetchModrinthVersions(this.id, query);

    if (!versions.length && allVersions) {
      versions = await fetchModrinthVersions(this.id, '');
    }

    this.targetGameVersion = allVersions ? undefined : gameVersion;
    this.versions = versions.map(mapModrinthVersion);
    this.noBuildForGameVersion = Boolean(!allVersions && gameVersion && !versions.length);
    this.latestVersion = this.versions[0];
    this.file = versions[0] ? mapModrinthFile(versions[0]) : undefined;
    return this;
  }

  async fetch(fetchOptions) {
    await this.fetchData();
    await this.fetchVersions(fetchOptions);
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
      targetGameVersion: this.targetGameVersion,
      noBuildForGameVersion: this.noBuildForGameVersion,
    };
  }
}
