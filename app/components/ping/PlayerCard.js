'use client';
import React from 'react';
import { SkinViewer3D } from './SkinViewer3D';
import { CapeRenderer } from './CapeRenderer';
export class PlayerCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            capeRendered: null,
            capeRaw: null,
            skinRaw: null,
            copiedField: null,
        };
    }
    async componentDidMount() {
        await this.loadPreviews();
    }
    async componentDidUpdate(prevProps) {
        if (prevProps.player !== this.props.player) {
            await this.loadPreviews();
        }
    }
    async loadPreviews() {
        const data = this.props.player.getData();
        if (data?.textures.cape.url) {
            try {
                const renderer = new CapeRenderer();
                const httpsCapeUrl = data.textures.cape.url.replace('http://', 'https://');
                const renderedCape = await renderer.renderCape(httpsCapeUrl, 4);
                const response = await fetch(httpsCapeUrl);
                const blob = await response.blob();
                const rawUrl = URL.createObjectURL(blob);
                this.setState({
                    capeRendered: renderedCape,
                    capeRaw: rawUrl
                });
            }
            catch (error) {
                console.error('Failed to load cape:', error);
            }
        }
        if (data?.textures.skin.url) {
            try {
                const httpsSkinUrl = data.textures.skin.url.replace('http://', 'https://');
                const response = await fetch(httpsSkinUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                this.setState({ skinRaw: url });
            }
            catch (error) {
                console.error('Failed to load skin:', error);
            }
        }
    }
    copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        this.setState({ copiedField: field });
        setTimeout(() => {
            this.setState({ copiedField: null });
        }, 1500);
    };
    openJsonData = () => {
        const username = this.props.player.getUsername();
        const url = `/api/minecraft/skin/${encodeURIComponent(username)}`;
        window.open(url, '_blank');
    };
    downloadSkin = async () => {
        const data = this.props.player.getData();
        if (!data?.textures.skin.url)
            return;
        try {
            const httpsSkinUrl = data.textures.skin.url.replace('http://', 'https://');
            const response = await fetch(httpsSkinUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.name}_skin.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Failed to download skin:', error);
        }
    };
    downloadCape = async () => {
        const data = this.props.player.getData();
        if (!data?.textures.cape.url)
            return;
        try {
            const httpsCapeUrl = data.textures.cape.url.replace('http://', 'https://');
            const response = await fetch(httpsCapeUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.name}_cape.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Failed to download cape:', error);
        }
    };
    render() {
        const { player } = this.props;
        const data = player.getData();
        const { capeRendered, capeRaw, skinRaw } = this.state;
        if (!data)
            return null;
        return (<div className="player-card">
        <div className="player-main-layout">
          <div className="player-3d-section">
          {data.textures.skin.url && (<SkinViewer3D skinUrl={data.textures.skin.url.replace('http://', 'https://')} capeUrl={data.textures.cape.url ? data.textures.cape.url.replace('http://', 'https://') : undefined} model={(data.textures.skin.model === 'slim' ? 'slim' : 'classic')} playerName={data.name}/>)}
          </div>

          <div className="player-info-section">
            <h3 className="player-name">{data.name}</h3>
            
            <div className="player-info-list">
              <div className="info-row copyable" onClick={() => this.copyToClipboard(data.uuid.full, 'uuid-full')}>
                <span className="info-label">UUID:</span>
                <span className="info-value">{data.uuid.full}</span>
                <span className={`copy-icon ${this.state.copiedField === 'uuid-full' ? 'copied' : ''}`}>
                  {this.state.copiedField === 'uuid-full' ? '✓' : (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>)}
                </span>
              </div>

              <div className="info-row copyable" onClick={() => this.copyToClipboard(data.uuid.short, 'uuid-short')}>
                <span className="info-label">UUID (короткий):</span>
                <span className="info-value uuid-mono">{data.uuid.short}</span>
                <span className={`copy-icon ${this.state.copiedField === 'uuid-short' ? 'copied' : ''}`}>
                  {this.state.copiedField === 'uuid-short' ? '✓' : (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>)}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Модель скина:</span>
                <span className="info-value">{data.textures.skin.model === 'slim' ? 'Alex (Slim)' : 'Steve (Classic)'}</span>
              </div>

              {data.textures.timestamp && (<div className="info-row">
                  <span className="info-label">Обновлено:</span>
                  <span className="info-value">
                    {new Date(data.textures.timestamp).toLocaleString('ru', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                  </span>
                </div>)}
            </div>
          </div>
        </div>

        <div className="player-textures-grid">
          {data.textures.cape.exists && capeRendered && capeRaw && (<div className="texture-block">
              <h4 className="texture-title">Плащ</h4>
              <div className="texture-images">
                <div className="texture-image-wrapper">
                  <div className="texture-label">Рендер</div>
                  <img src={capeRendered} alt="Cape Rendered" className="texture-preview cape-preview"/>
                </div>
                <div className="texture-image-wrapper">
                  <div className="texture-label">RAW</div>
                  <img src={capeRaw} alt="Cape Raw" className="texture-preview cape-raw"/>
                </div>
              </div>
            </div>)}

          {skinRaw && (<div className="texture-block">
              <h4 className="texture-title">Скин</h4>
              <div className="texture-images">
                <div className="texture-image-wrapper">
                  <div className="texture-label">RAW</div>
                  <img src={skinRaw} alt="Skin" className="texture-preview skin-preview"/>
                </div>
              </div>
            </div>)}
        </div>

        <div className="player-actions">
          <button onClick={this.downloadSkin} className="btn btn-download">
            Скачать скин
          </button>
          {data.textures.cape.exists && (<button onClick={this.downloadCape} className="btn btn-download">
              Скачать плащ
            </button>)}
          <button onClick={this.openJsonData} className="btn btn-raw">
            JSON
          </button>
        </div>
      </div>);
    }
}
