'use client';
import React from 'react';
import { isMeaningfulBedrockVersionName } from './bedrockPing';
import { MotdFormatter } from './MotdFormatter';
const sharePathUrl = (origin, address) => `${origin}/tools/ping?s=${encodeURIComponent(address)}`;
export class ServerCard extends React.Component {
    refreshTimer = null;
    constructor(props) {
        super(props);
        this.state = {
            debugExpanded: false,
            dnsExpanded: false,
            motdExpanded: false,
            copiedIndex: null,
            linkCopied: false,
            refreshCooldown: 0,
        };
    }
    componentWillUnmount() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }
    formatMotd(motd) {
        if (!motd?.html || motd.html.length === 0) {
            return <span>Нет описания</span>;
        }
        return (<>
        {motd.html.map((line, index) => (<div key={index} dangerouslySetInnerHTML={{ __html: line }}/>))}
      </>);
    }
    renderFavicon() {
        const status = this.props.server.getStatus();
        if (!status?.favicon) {
            return <div className="server-icon-placeholder"></div>;
        }
        return (<img src={status.favicon} alt="Server Icon" className="server-icon"/>);
    }
    openRawData = () => {
        const address = this.props.server.getFullAddress();
        const url = `/api/minecraft/query?s=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };
    openPlayersList = () => {
        const address = this.props.server.getFullAddress();
        const url = `/api/minecraft/players?s=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };
    stripMinecraftCodes(text) {
        return text.replace(/§[0-9a-fk-or]/gi, '');
    }
    toggleDebug = () => {
        this.setState({ debugExpanded: !this.state.debugExpanded });
    };
    toggleDns = () => {
        this.setState({ dnsExpanded: !this.state.dnsExpanded });
    };
    toggleMotd = () => {
        this.setState({ motdExpanded: !this.state.motdExpanded });
    };
    copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        this.setState({ copiedIndex: index });
        setTimeout(() => {
            this.setState({ copiedIndex: null });
        }, 2000);
    };
    getServerLink() {
        const address = this.props.server.getFullAddress();
        const origin = typeof window === 'undefined' ? 'https://ping.modrinth.black' : window.location.origin;
        return sharePathUrl(origin, address);
    }
    copyServerLink = () => {
        const link = this.getServerLink();
        navigator.clipboard.writeText(link);
        this.setState({ linkCopied: true });
        setTimeout(() => {
            this.setState({ linkCopied: false });
        }, 2000);
    };
    handleRefresh = () => {
        if (this.state.refreshCooldown > 0)
            return;
        this.props.onRefresh();
        this.setState({ refreshCooldown: 5 });
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.refreshTimer = setInterval(() => {
            this.setState(prevState => {
                const newCooldown = prevState.refreshCooldown - 1;
                if (newCooldown <= 0) {
                    if (this.refreshTimer) {
                        clearInterval(this.refreshTimer);
                        this.refreshTimer = null;
                    }
                    return { refreshCooldown: 0 };
                }
                return { refreshCooldown: newCooldown };
            });
        }, 1000);
    };
    renderMotdCodes() {
        const status = this.props.server.getStatus();
        if (!status || !status.motd?.raw || status.motd.raw.length === 0)
            return null;
        const { motdExpanded } = this.state;
        const rawMotd = status.motd.raw.join('\n');
        const vanillaMotd = MotdFormatter.toVanilla(rawMotd);
        const spigotMotd = MotdFormatter.toSpigot(rawMotd);
        const bungeeMotd = MotdFormatter.toBungee(rawMotd);
        const slpMotd = MotdFormatter.toServerListPlus(rawMotd);
        return (<div className="debug-section">
        <button className="debug-toggle" onClick={this.toggleMotd} aria-expanded={motdExpanded}>
          <span className="debug-icon">▶</span>
          Коды MOTD для разных серверов
        </button>
        {motdExpanded && (<div className="debug-content">
            <div className="motd-code-block">
              <div className="motd-code-header">
                <span className="motd-code-title">Vanilla server.properties</span>
                <button className="motd-copy-btn" onClick={() => this.copyToClipboard(vanillaMotd, 0)}>
                  {this.state.copiedIndex === 0 ? (<svg className="copy-check" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#55FF55" clipRule="evenodd" d="m20.6136 5.64877c.4199.36742.458 1.00751.0845 1.42204l-10.5139 11.66979c-.37544.4167-1.02006.4432-1.42843.0588l-6.08403-5.7276c-.37942-.3572-.41574-.9524-.09021-1.3593.3592-.449 1.02811-.5108 1.4556-.1263l4.72039 4.2459c.41022.369 1.04179.336 1.41138-.0737l9.0435-10.02691c.3659-.40576.99-.44254 1.4012-.08272z" fillRule="evenodd"></path>
                    </svg>) : (<svg className="copy-icon" height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>)}
                </button>
              </div>
              <div className="motd-code-wrapper">
                <div className="motd-code-content">
                  <span className="motd-code-prefix">motd=</span>
                  <code>{vanillaMotd}</code>
                </div>
              </div>
              <div className="motd-code-note">Не поддерживает RGB/HEX цвета.</div>
            </div>

            <div className="motd-code-block">
              <div className="motd-code-header">
                <span className="motd-code-title">Spigot server.properties</span>
                <button className="motd-copy-btn" onClick={() => this.copyToClipboard(spigotMotd, 1)}>
                  {this.state.copiedIndex === 1 ? (<svg className="copy-check" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#55FF55" clipRule="evenodd" d="m20.6136 5.64877c.4199.36742.458 1.00751.0845 1.42204l-10.5139 11.66979c-.37544.4167-1.02006.4432-1.42843.0588l-6.08403-5.7276c-.37942-.3572-.41574-.9524-.09021-1.3593.3592-.449 1.02811-.5108 1.4556-.1263l4.72039 4.2459c.41022.369 1.04179.336 1.41138-.0737l9.0435-10.02691c.3659-.40576.99-.44254 1.4012-.08272z" fillRule="evenodd"></path>
                    </svg>) : (<svg className="copy-icon" height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>)}
                </button>
              </div>
              <div className="motd-code-wrapper">
                <div className="motd-code-content">
                  <span className="motd-code-prefix">motd=</span>
                  <code>{spigotMotd}</code>
                </div>
              </div>
            </div>

            <div className="motd-code-block">
              <div className="motd-code-header">
                <span className="motd-code-title">BungeeCord config.yml</span>
                <button className="motd-copy-btn" onClick={() => this.copyToClipboard(`"${bungeeMotd}"`, 2)}>
                  {this.state.copiedIndex === 2 ? (<svg className="copy-check" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#55FF55" clipRule="evenodd" d="m20.6136 5.64877c.4199.36742.458 1.00751.0845 1.42204l-10.5139 11.66979c-.37544.4167-1.02006.4432-1.42843.0588l-6.08403-5.7276c-.37942-.3572-.41574-.9524-.09021-1.3593.3592-.449 1.02811-.5108 1.4556-.1263l4.72039 4.2459c.41022.369 1.04179.336 1.41138-.0737l9.0435-10.02691c.3659-.40576.99-.44254 1.4012-.08272z" fillRule="evenodd"></path>
                    </svg>) : (<svg className="copy-icon" height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>)}
                </button>
              </div>
              <div className="motd-code-wrapper">
                <div className="motd-code-content">
                  <span className="motd-code-prefix">motd: </span>
                  <code>"{bungeeMotd}"</code>
                </div>
              </div>
            </div>

            <div className="motd-code-block">
              <div className="motd-code-header">
                <span className="motd-code-title">ServerListPlus ServerListPlus.yml</span>
                <button className="motd-copy-btn" onClick={() => this.copyToClipboard(`- |-\n  ${slpMotd.replace(/\\n/g, '\n  ')}`, 3)}>
                  {this.state.copiedIndex === 3 ? (<svg className="copy-check" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#55FF55" clipRule="evenodd" d="m20.6136 5.64877c.4199.36742.458 1.00751.0845 1.42204l-10.5139 11.66979c-.37544.4167-1.02006.4432-1.42843.0588l-6.08403-5.7276c-.37942-.3572-.41574-.9524-.09021-1.3593.3592-.449 1.02811-.5108 1.4556-.1263l4.72039 4.2459c.41022.369 1.04179.336 1.41138-.0737l9.0435-10.02691c.3659-.40576.99-.44254 1.4012-.08272z" fillRule="evenodd"></path>
                    </svg>) : (<svg className="copy-icon" height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>)}
                </button>
              </div>
              <div className="motd-code-wrapper">
                <div className="motd-code-content">
                  <span className="motd-code-prefix">- |-{'\n  '}</span>
                  <code>{slpMotd.replace(/\\n/g, '\n  ')}</code>
                </div>
              </div>
            </div>
          </div>)}
      </div>);
    }
    renderDebugInfo() {
        const status = this.props.server.getStatus();
        if (!status)
            return null;
        const { debugExpanded } = this.state;
        return (<div className="debug-section">
        <button className="debug-toggle" onClick={this.toggleDebug} aria-expanded={debugExpanded}>
          <span className="debug-icon">▶</span>
          Техническая информация
        </button>
        {debugExpanded && (<div className="debug-content">
            <div className="debug-row">
              <span className="debug-label">Последняя проверка:</span>
              <span className="debug-value">{status.cacheTime || 'N/A'}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Домен:</span>
              <span className="debug-value">{status.hostname || this.props.server.getHost()}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">IP адрес:</span>
              <span className="debug-value">{status.resolvedIP || 'N/A'}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Порт:</span>
              <span className="debug-value">{status.port || this.props.server.getPort()}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Протокол:</span>
              <span className="debug-value">{status.version} ({status.protocol})</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">SRV запись:</span>
              <span className="debug-value">
                {status.srvRecord ? `${status.srvRecord.host}:${status.srvRecord.port}` : 'Нет'}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Query:</span>
              <span className="debug-value">
                {status.querySuccess ? 'Да' : 'Нет'}
              </span>
            </div>
          </div>)}
      </div>);
    }
    renderDnsInfo() {
        const status = this.props.server.getStatus();
        if (!status)
            return null;
        const { dnsExpanded } = this.state;
        const hasDnsRecords = status.dnsRecords && status.dnsRecords.length > 0;
        const hasSrvRecord = status.srvRecord;
        const isDefaultPort = (status.port || 25565) === 25565;
        if (!hasDnsRecords && !hasSrvRecord)
            return null;
        return (<div className="debug-section">
        <button className="debug-toggle" onClick={this.toggleDns} aria-expanded={dnsExpanded}>
          <span className="debug-icon">▶</span>
          DNS информация
        </button>
        {dnsExpanded && (<div className="debug-content">
            {isDefaultPort && hasSrvRecord && (<>
                <div className="dns-subtitle">SRV записи</div>
                <div className="dns-table-wrapper">
                  <table className="dns-table">
                    <thead>
                      <tr>
                        <th>Домен</th>
                        <th>Тип</th>
                        <th>Данные</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>_minecraft._tcp.{status.hostname}</td>
                        <td>SRV</td>
                        <td>{hasSrvRecord.host}:{hasSrvRecord.port}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>)}
            
            {hasDnsRecords && status.dnsRecords && (<>
                <div className="dns-subtitle">DNS записи</div>
                <div className="dns-table-wrapper">
                  <table className="dns-table">
                    <thead>
                      <tr>
                        <th>Домен</th>
                        <th>Тип</th>
                        <th>Данные</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.dnsRecords.map((record, idx) => (<tr key={idx}>
                          <td>{status.hostname}</td>
                          <td>{record.type}</td>
                          <td>{record.data}</td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </>)}
          </div>)}
      </div>);
    }
    renderBedrockDetails(bedrock, title) {
        const protocolTooltip = 'Номер сетевого протокола Bedrock. Его ещё нет в нашем справочнике — сервер, скорее всего, на свежей версии.';
        return (<div className="mc-detail-block mc-detail-full mc-bedrock-details">
        <div className="mc-detail-label">{title}</div>
        <div className="mc-bedrock-grid">
          {bedrock.editionLabel && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Издание</span>
              <span className="mc-bedrock-val">{bedrock.editionLabel}</span>
            </div>)}
          {isMeaningfulBedrockVersionName(bedrock.versionName) && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Версия клиента</span>
              <span className="mc-bedrock-val">{bedrock.versionName}</span>
            </div>)}
          {bedrock.mappedVersion && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">По справочнику</span>
              <span className="mc-bedrock-val">{bedrock.mappedVersion}</span>
            </div>)}
          {bedrock.protocol !== undefined && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Протокол</span>
              <span className={`mc-bedrock-val${bedrock.versionKnown === false ? ' mc-version-unknown' : ''}`} {...(bedrock.versionKnown === false
                ? { 'data-tooltip': protocolTooltip }
                : {})}>
                {bedrock.protocol}
                {bedrock.versionKnown === false ? ' · нет в справочнике' : ''}
              </span>
            </div>)}
          <div className="mc-bedrock-row">
            <span className="mc-bedrock-key">Игроки</span>
            <span className="mc-bedrock-val">
              {bedrock.players?.online ?? 0} / {bedrock.players?.max ?? 0}
            </span>
          </div>
          {bedrock.gamemode && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Режим</span>
              <span className="mc-bedrock-val">
                {bedrock.gamemode}
                {bedrock.gamemodeId !== null && bedrock.gamemodeId !== undefined
                    ? ` (${bedrock.gamemodeId})`
                    : ''}
              </span>
            </div>)}
          {bedrock.serverId && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">ID сервера</span>
              <span className="mc-bedrock-val mc-bedrock-mono">{bedrock.serverId}</span>
            </div>)}
          {(bedrock.bedrockPort || bedrock.port) && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Порт UDP</span>
              <span className="mc-bedrock-val">
                {bedrock.bedrockPort ?? bedrock.port}
                {bedrock.bedrockPortv6 ? ` · IPv6 ${bedrock.bedrockPortv6}` : ''}
              </span>
            </div>)}
          {bedrock.latency !== undefined && (<div className="mc-bedrock-row">
              <span className="mc-bedrock-key">Пинг</span>
              <span className="mc-bedrock-val">{bedrock.latency} мс</span>
            </div>)}
        </div>
        {bedrock.motd?.html && bedrock.motd.html.length > 0 && (<div className="mc-bedrock-motd">
            {bedrock.motd.html.map((line, idx) => (<div key={idx} dangerouslySetInnerHTML={{ __html: line }}/>))}
          </div>)}
      </div>);
    }
    renderServerLink() {
        const link = this.getServerLink();
        return (<div className="server-link-copy">
        <button className="server-link-copy-btn" onClick={this.copyServerLink}>
          <span className="server-link-url">{link}</span>
          {this.state.linkCopied ? (<svg className="copy-check" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
              <path fill="#55FF55" clipRule="evenodd" d="m20.6136 5.64877c.4199.36742.458 1.00751.0845 1.42204l-10.5139 11.66979c-.37544.4167-1.02006.4432-1.42843.0588l-6.08403-5.7276c-.37942-.3572-.41574-.9524-.09021-1.3593.3592-.449 1.02811-.5108 1.4556-.1263l4.72039 4.2459c.41022.369 1.04179.336 1.41138-.0737l9.0435-10.02691c.3659-.40576.99-.44254 1.4012-.08272z" fillRule="evenodd"></path>
            </svg>) : (<svg className="copy-icon" height="16" viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            </svg>)}
        </button>
      </div>);
    }
    render() {
        const { server, onRefresh } = this.props;
        const status = server.getStatus();
        const isOnline = server.isOnline();
        return (<div className={`server-card ${isOnline ? 'online' : 'offline'}`}>
        <div className={`minecraft-layout ${status?.isBedrock ? 'no-icon' : ''}`}>
          {!status?.isBedrock && (<div className="mc-icon">
              {this.renderFavicon()}
            </div>)}
          
          <div className="mc-info">
            <div className="mc-title">
              <span className="mc-name">{server.getFullAddress()}</span>
              {status?.version && (status.versionKnown === false ? (<span className="mc-version mc-version-unknown" data-tooltip={status.protocolReliable === false
                    ? 'Протокол ненадёжный: сервер вернул тот номер, который мы сами отправили'
                    : status.isBedrock
                        ? 'Сервер не сообщил версию клиента — показан номер сетевого протокола'
                        : 'Не удалось определить версию по протоколу: сервер сообщил неизвестный номер'}>
                    {status.version}
                  </span>) : (<span className="mc-version">{status.version}</span>))}
              {status?.isBedrock && (<span className="mc-bedrock-badge">BEDROCK</span>)}
              {!status?.isBedrock && status?.editions?.bedrock && (<span className="mc-bedrock-badge">JAVA + BEDROCK</span>)}
            </div>
            {status?.versionName && status.versionName !== status.version && (<div className="mc-version-custom">
                <span dangerouslySetInnerHTML={{
                    __html: MotdFormatter.parseToHtml(status.versionName)
                }}/>
              </div>)}
            
            <div className="mc-motd">
              {this.formatMotd(status?.motd)}
            </div>
          </div>
          
          <div className="mc-stats">
            {isOnline ? (<div className="mc-players">
                  <span className="mc-players-online">{status?.players?.online || 0}</span>
                  <span className="mc-players-sep">/</span>
                  <span className="mc-players-max">{status?.players?.max || 0}</span>
                </div>) : (<div className="mc-offline">ОФФЛАЙН</div>)}
          </div>
        </div>

        {isOnline && status && (() => {
                const bedrockPrimary = status.isBedrock ? status : null;
                const bedrockEdition = !status.isBedrock && status.bedrock ? status.bedrock : null;
                let hasRealPlayers = false;
                if (status.players?.sample && status.players.sample.length > 0) {
                    const realPlayers = status.players.sample
                        .filter(p => p.name && p.name.trim().length > 0)
                        .map(p => this.stripMinecraftCodes(p.name))
                        .filter(name => {
                        const lowerName = name.toLowerCase();
                        return !lowerName.includes('сервер') &&
                            !lowerName.includes('максимум') &&
                            !lowerName.includes('игрок') &&
                            !lowerName.includes('активен') &&
                            name.length > 0;
                    });
                    hasRealPlayers = realPlayers.length > 0;
                }
                if (!hasRealPlayers && !bedrockEdition && !bedrockPrimary)
                    return null;
                return (<div className="mc-details">
              {hasRealPlayers && status.players?.sample && (() => {
                        const realPlayers = status.players.sample
                            .filter(p => p.name && p.name.trim().length > 0)
                            .map(p => this.stripMinecraftCodes(p.name))
                            .filter(name => {
                            const lowerName = name.toLowerCase();
                            return !lowerName.includes('сервер') &&
                                !lowerName.includes('максимум') &&
                                !lowerName.includes('игрок') &&
                                !lowerName.includes('активен') &&
                                name.length > 0;
                        });
                        return (<div className="mc-detail-block mc-detail-full">
                <div className="mc-detail-label">Игроки онлайн</div>
                <div className="mc-detail-value">
                      {realPlayers.slice(0, 10).join(', ')}
                      {realPlayers.length > 10 && '...'}
                </div>
                <button onClick={this.openPlayersList} className="mc-players-all" data-tooltip="Данные об игроках могут быть неверны, так как это может быть прокси-сервер">
                  Посмотреть всех ({realPlayers.length})
                </button>
              </div>);
                    })()}

              {bedrockPrimary &&
                        this.renderBedrockDetails(bedrockPrimary, `Bedrock Edition (порт ${bedrockPrimary.bedrockPort ?? bedrockPrimary.port ?? 19132})`)}

              {bedrockEdition &&
                        this.renderBedrockDetails(bedrockEdition, `Bedrock Edition (порт ${bedrockEdition.port ?? bedrockEdition.bedrockPort ?? 19132})`)}
          </div>);
            })()}

        <div className="mc-actions">
          <button onClick={this.handleRefresh} className="btn btn-refresh" disabled={this.state.refreshCooldown > 0}>
            {this.state.refreshCooldown > 0 ? `Обновить (${this.state.refreshCooldown}с)` : 'Обновить'}
          </button>
          <button onClick={this.openRawData} className="btn btn-raw">
            JSON
          </button>
        </div>

        {isOnline && (<div className="server-debug-info">
            {this.renderMotdCodes()}
            {this.renderDebugInfo()}
            {this.renderDnsInfo()}
            {this.renderServerLink()}
          </div>)}
      </div>);
    }
}
