import { pt } from './pingText';
const FORBIDDEN_PORTS = new Set([
  1433,
  1434,
  2049,
  2375,
  2376,
  2379,
  2380,
  3306,
  3389,
  4243,
  5432,
  5601,
  5672,
  5900,
  5901,
  5902,
  5903,
  5904,
  5905,
  5906,
  6379,
  6443,
  8080,
  8086,
  8443,
  8500,
  9001,
  9042,
  9090,
  9092,
  9200,
  9300,
  10250,
  10255,
  11211,
  15672,
  27017,
]);
export class PortValidator {
    static parse(port) {
        let value;
        if (typeof port === 'number') {
            value = port;
        }
        else if (typeof port === 'string' && /^\d{1,5}$/.test(port.trim())) {
            value = Number(port.trim());
        }
        else {
            return { valid: false, error: pt('badPort') };
        }
        if (!Number.isInteger(value) || value < 1 || value > 65535) {
            return { valid: false, error: pt('badPort') };
        }
        if (PortValidator.isForbidden(value)) {
            return {
                valid: false,
                error: pt('blockedPort'),
            };
        }
        return { valid: true, port: value };
    }
    static isForbidden(port) {
        if (!Number.isInteger(port)) {
            return true;
        }
        if (port <= 1023) {
            return true;
        }
        return FORBIDDEN_PORTS.has(port);
    }
    static validate(port) {
        const parsed = PortValidator.parse(port);
        if (!parsed.valid) {
            return { valid: false, error: parsed.error };
        }
        return { valid: true };
    }
    static canonicalizeAddress(address) {
        let raw = address.trim();
        raw = raw.replace(/^https?:\/\//i, '');
        raw = raw.replace(/^minecraft:\/\//i, '');
        const cut = (value, token) => {
            const index = value.indexOf(token);
            return index === -1 ? value : value.slice(0, index);
        };
        raw = cut(raw, '/');
        raw = cut(raw, '?');
        raw = cut(raw, '#');
        raw = raw.replace(/\.+$/, '');
        return raw.trim();
    }
    static formatAddress(host, port) {
        return port === 25565 ? host : `${host}:${port}`;
    }
    static parseAddress(address, fallbackPort = 25565) {
        if (typeof address !== 'string' || !address.trim()) {
            return { valid: false, error: pt('badServer') };
        }
        const raw = PortValidator.canonicalizeAddress(address);
        let host;
        let portRaw = fallbackPort;
        if (raw.startsWith('[')) {
            const end = raw.indexOf(']');
            if (end <= 1) {
                return { valid: false, error: pt('badServer') };
            }
            host = raw.slice(1, end);
            const rest = raw.slice(end + 1);
            if (rest.startsWith(':')) {
                portRaw = rest.slice(1);
            }
            else if (rest.length > 0) {
                return { valid: false, error: pt('badServer') };
            }
        }
        else if (/^[^[\s/\\]+:\d{1,5}$/.test(raw)) {
            const colon = raw.lastIndexOf(':');
            host = raw.slice(0, colon);
            portRaw = raw.slice(colon + 1);
        }
        else {
            host = raw;
        }
        if (!host || /[/\s\\]/.test(host)) {
            return { valid: false, error: pt('badServer') };
        }
        const parsedPort = PortValidator.parse(portRaw);
        if (!parsedPort.valid) {
            return parsedPort;
        }
        return { valid: true, host, port: parsedPort.port };
    }
    static getForbiddenPorts() {
        return Array.from(FORBIDDEN_PORTS);
    }
}
