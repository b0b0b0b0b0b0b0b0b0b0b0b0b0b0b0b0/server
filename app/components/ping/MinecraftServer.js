import { PortValidator } from './PortValidator';
export class MinecraftServer {
    host;
    port;
    status = null;
    lastChecked = null;
    constructor(address) {
        const parsed = PortValidator.parseAddress(address);
        if (!parsed.valid) {
            throw new Error(parsed.error);
        }
        this.host = parsed.host;
        this.port = parsed.port;
    }
    getHost() {
        return this.host;
    }
    getPort() {
        return this.port;
    }
    getFullAddress() {
        return this.port === 25565 ? this.host : `${this.host}:${this.port}`;
    }
    getStatus() {
        return this.status;
    }
    getLastChecked() {
        return this.lastChecked;
    }
    isOnline() {
        return this.status?.online ?? false;
    }
    async ping() {
        try {
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    host: this.host,
                    port: this.port,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.error || 'Failed to ping server';
                this.status = { online: false, error: errorMessage };
                this.lastChecked = new Date();
                throw new Error(errorMessage);
            }
            if (data.error && !data.online) {
                this.status = { ...data, online: false };
                this.lastChecked = new Date();
                throw new Error(data.error);
            }
            this.status = data;
            this.lastChecked = new Date();
            return data;
        }
        catch (error) {
            if (error instanceof Error && error.message) {
                this.status = { online: false, error: error.message };
            }
            else {
                this.status = { online: false };
            }
            this.lastChecked = new Date();
            throw error;
        }
    }
    async refresh() {
        return await this.ping();
    }
}
export class ServerManager {
    servers = new Map();
    addServer(address) {
        const server = new MinecraftServer(address);
        this.servers.set(server.getFullAddress(), server);
        return server;
    }
    removeServer(address) {
        return this.servers.delete(address);
    }
    getServer(address) {
        return this.servers.get(address);
    }
    getAllServers() {
        return Array.from(this.servers.values());
    }
    hasServer(address) {
        return this.servers.has(address);
    }
    async pingAll() {
        const promises = Array.from(this.servers.values()).map(server => server.ping().catch(() => null));
        await Promise.all(promises);
    }
    clear() {
        this.servers.clear();
    }
}
