// tenantCache.js

if (!globalThis._prismaClientCache) {
  globalThis._prismaClientCache = new Map();
}

export function getClient(projectId) {
  return globalThis._prismaClientCache.get(projectId) || null;
}

export function setClient(projectId, client) {
  globalThis._prismaClientCache.set(projectId, client);
}
