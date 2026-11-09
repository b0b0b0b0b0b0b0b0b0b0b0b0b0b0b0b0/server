import { yieldToMain } from '@/lib/core/yieldToMain';
import { readJarPluginYml } from '@/lib/tools/plugins/readJarPluginYml';

function isJarFile(file) {
  return file.name.toLowerCase().endsWith('.jar');
}

async function scanJar(file) {
  if (!isJarFile(file)) {
    return {
      fileName: file.name,
      status: 'failed',
      reason: 'notJar',
    };
  }

  try {
    const parsed = await readJarPluginYml(file);
    if (!parsed.ok) {
      return {
        fileName: file.name,
        status: 'failed',
        reason: parsed.reason,
      };
    }

    return {
      fileName: file.name,
      status: 'parsed',
      name: parsed.name,
      version: parsed.version,
      manifest: parsed.manifest,
    };
  } catch {
    return {
      fileName: file.name,
      status: 'failed',
      reason: 'readError',
    };
  }
}

export async function scanPluginJars(files, { onProgress, onItem } = {}) {
  const jarFiles = [...files].filter(isJarFile);
  const results = [];

  for (let index = 0; index < jarFiles.length; index += 1) {
    await yieldToMain();
    const result = await scanJar(jarFiles[index]);
    results.push(result);
    onItem?.(result, index + 1, jarFiles.length);
    onProgress?.(index + 1, jarFiles.length);
    await yieldToMain();
  }

  const parsed = results.filter((item) => item.status === 'parsed');
  const failed = results.filter((item) => item.status === 'failed');

  return {
    total: jarFiles.length,
    parsed,
    failed,
    results,
  };
}
