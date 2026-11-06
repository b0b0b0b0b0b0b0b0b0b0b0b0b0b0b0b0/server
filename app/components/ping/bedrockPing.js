const BEDROCK_GAMEMODE_NAMES = {
    0: 'Survival',
    1: 'Creative',
    2: 'Adventure',
    3: 'Survival',
    4: 'Creative',
    5: 'Spectator',
    6: 'Spectator',
};
const BEDROCK_EDITION_NAMES = {
    MCPE: 'Pocket / Bedrock',
    MCEE: 'Education',
    MCCF: 'China',
};
export function isMeaningfulBedrockVersionName(name) {
    if (!name || !name.trim()) {
        return false;
    }
    const lower = name.trim().toLowerCase();
    return lower !== 'unknown' && lower !== 'неизвестно' && lower !== '?' && lower !== 'n/a';
}
export function parseBedrockPingString(data, fallbackPort) {
    const parts = data.split(';');
    if (parts.length < 6) {
        return null;
    }
    const gamemodeId = Number.parseInt(parts[9] ?? '', 10);
    const gamemodeNameRaw = (parts[8] ?? '').trim();
    const gamemodeName = gamemodeNameRaw ||
        (Number.isFinite(gamemodeId) ? BEDROCK_GAMEMODE_NAMES[gamemodeId] ?? '' : '');
    const editionId = (parts[0] ?? '').trim();
    const portv4 = Number.parseInt(parts[10] ?? '', 10);
    const portv6 = Number.parseInt(parts[11] ?? '', 10);
    return {
        editionId,
        editionLabel: BEDROCK_EDITION_NAMES[editionId] ?? editionId,
        motd: parts[1] ?? '',
        submotd: (parts[7] ?? '').trim(),
        protocol: Number.parseInt(parts[2] ?? '', 10) || 0,
        versionName: (parts[3] ?? '').trim(),
        playersOnline: Number.parseInt(parts[4] ?? '', 10) || 0,
        playersMax: Number.parseInt(parts[5] ?? '', 10) || 0,
        serverId: parts[6] ?? '',
        gamemodeName,
        gamemodeId: Number.isFinite(gamemodeId) ? gamemodeId : null,
        portv4: Number.isFinite(portv4) ? portv4 : fallbackPort,
        portv6: Number.isFinite(portv6) ? portv6 : null,
    };
}
export function getBedrockDisplayVersion(versionName, mappedVersion, protocol) {
    if (isMeaningfulBedrockVersionName(versionName)) {
        return versionName.trim();
    }
    if (mappedVersion) {
        return mappedVersion;
    }
    return `протокол ${protocol}`;
}
