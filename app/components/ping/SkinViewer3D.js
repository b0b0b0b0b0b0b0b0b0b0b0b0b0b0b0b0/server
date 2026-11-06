'use client';
import React from 'react';
const BACKGROUNDS = [
    { id: 'checkered', name: 'Клетка', css: 'linear-gradient(135deg, #1a1a1a 25%, #262626 25%, #262626 50%, #1a1a1a 50%, #1a1a1a 75%, #262626 75%, #262626)', size: '20px 20px' },
    { id: 'dark', name: 'Темный', css: '#0d0d0d', size: 'auto' },
    { id: 'gradient1', name: 'Градиент 1', css: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', size: 'auto' },
    { id: 'gradient2', name: 'Градиент 2', css: 'linear-gradient(180deg, #262626, #0d0d0d)', size: 'auto' },
    { id: 'gradient3', name: 'Градиент 3', css: 'linear-gradient(45deg, #0d0d0d, #1a1a1a)', size: 'auto' },
    { id: 'gradient4', name: 'Градиент 4', css: 'radial-gradient(circle, #262626, #0d0d0d)', size: 'auto' },
    { id: 'gradient5', name: 'Градиент 5', css: 'linear-gradient(90deg, #1a1a1a, #0d0d0d, #1a1a1a)', size: 'auto' },
    { id: 'gradient6', name: 'Градиент 6', css: 'conic-gradient(from 90deg, #0d0d0d, #262626, #0d0d0d)', size: 'auto' },
    { id: 'dots', name: 'Точки', css: 'radial-gradient(circle, #262626 1px, #0d0d0d 1px)', size: '10px 10px' },
    { id: 'lines', name: 'Линии', css: 'repeating-linear-gradient(90deg, #1a1a1a, #1a1a1a 10px, #262626 10px, #262626 20px)', size: 'auto' },
    { id: 'carbon', name: 'Карбон', css: 'linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px, linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px, linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px, linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px, linear-gradient(90deg, #1b1b1b 10px, transparent 10px), linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)', size: '20px 20px' },
    { id: 'mesh', name: 'Сетка', css: 'repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 1px, #0d0d0d 1px, #0d0d0d 10px), repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 1px, #0d0d0d 1px, #0d0d0d 10px)', size: 'auto' },
    { id: 'diagonal', name: 'Диагонали', css: 'repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #262626 10px, #262626 20px)', size: 'auto' },
    { id: 'cross', name: 'Крест', css: 'repeating-conic-gradient(#1a1a1a 0deg 90deg, #262626 90deg 180deg)', size: '20px 20px' },
];
export class SkinViewer3D extends React.Component {
    canvasRef;
    containerRef;
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.containerRef = React.createRef();
        this.state = {
            isAnimating: true,
            viewer: null,
            background: 'checkered',
            animation: 'walk',
            showAnimationDropdown: false,
        };
    }
    async componentDidMount() {
        if (typeof window === 'undefined')
            return;
        const skinview3d = await import('skinview3d');
        const { SkinViewer } = skinview3d;
        if (!this.canvasRef.current)
            return;
        const viewer = new SkinViewer({
            canvas: this.canvasRef.current,
            width: 300,
            height: 400,
            skin: this.props.skinUrl,
            model: this.props.model === 'slim' ? 'slim' : 'default',
            preserveDrawingBuffer: true,
        });
        viewer.background = null;
        viewer.scene.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        if (viewer.playerObject.shadow) {
            viewer.playerObject.shadow.scale.set(2, 2, 2);
            viewer.playerObject.shadow.material.opacity = 0.8;
        }
        viewer.camera.rotation.x = -0.2;
        viewer.camera.rotation.y = 0.6;
        viewer.camera.rotation.z = 0;
        viewer.camera.position.x = 0;
        viewer.camera.position.y = 0;
        viewer.camera.position.z = 50;
        viewer.zoom = 0.8;
        viewer.fov = 50;
        if (this.props.capeUrl) {
            viewer.loadCape(this.props.capeUrl);
        }
        const { WalkingAnimation } = skinview3d;
        const walkAnimation = new WalkingAnimation();
        walkAnimation.speed = 0.5;
        viewer.animation = walkAnimation;
        this.setState({ viewer });
        let isDragging = false;
        let previousMouseX = 0;
        this.canvasRef.current.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMouseX;
                viewer.camera.rotation.y += deltaX * 0.01;
                previousMouseX = e.clientX;
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        this.canvasRef.current.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            viewer.zoom *= delta;
            viewer.zoom = Math.max(0.5, Math.min(1.5, viewer.zoom));
        });
    }
    componentWillUnmount() {
        if (this.state.viewer) {
            this.state.viewer.dispose();
        }
    }
    toggleAnimation = () => {
        if (!this.state.viewer || !this.state.viewer.animation)
            return;
        this.state.viewer.animation.paused = !this.state.viewer.animation.paused;
        this.setState({ isAnimating: !this.state.isAnimating });
    };
    changeBackground = (bgId) => {
        this.setState({ background: bgId });
    };
    toggleDropdown = () => {
        this.setState({ showAnimationDropdown: !this.state.showAnimationDropdown });
    };
    selectAnimation = (type) => {
        this.setAnimation(type);
        this.setState({ showAnimationDropdown: false });
    };
    setAnimation = async (type) => {
        if (!this.state.viewer)
            return;
        const skinview3d = await import('skinview3d');
        const hasCape = !!this.props.capeUrl;
        let newAnimation = null;
        let AnimationClass = null;
        let speed = 0.5;
        let useElytra = false;
        switch (type) {
            case 'walk':
                AnimationClass = skinview3d.WalkingAnimation;
                speed = 0.5;
                break;
            case 'run':
                AnimationClass = skinview3d.RunningAnimation;
                speed = 0.7;
                break;
            case 'fly':
                AnimationClass = skinview3d.FlyingAnimation;
                speed = 0.5;
                useElytra = true;
                break;
            case 'idle':
                AnimationClass = skinview3d.IdleAnimation;
                speed = 0.3;
                break;
            case 'hit':
                AnimationClass = skinview3d.HitAnimation;
                speed = 1;
                break;
        }
        if (AnimationClass) {
            try {
                newAnimation = new AnimationClass();
                if (newAnimation && typeof newAnimation.speed !== 'undefined') {
                    newAnimation.speed = speed;
                }
                this.state.viewer.animation = newAnimation;
                if (hasCape) {
                    if (useElytra) {
                        this.state.viewer.loadCape(this.props.capeUrl, { backEquipment: 'elytra' });
                    }
                    else {
                        this.state.viewer.loadCape(this.props.capeUrl);
                    }
                }
                this.setState({ animation: type });
            }
            catch (error) {
                console.error(`Animation ${type} not available:`, error);
            }
        }
    };
    takeScreenshot = () => {
        if (!this.canvasRef.current)
            return;
        const link = document.createElement('a');
        link.download = `${this.props.playerName}_screenshot.png`;
        link.href = this.canvasRef.current.toDataURL('image/png');
        link.click();
    };
    render() {
        const currentBg = BACKGROUNDS.find(bg => bg.id === this.state.background) || BACKGROUNDS[0];
        return (<div ref={this.containerRef} className="skin-viewer-container">
        <div className="skin-viewer-canvas-wrapper" style={{
                background: currentBg.css,
                backgroundSize: currentBg.size,
            }}>
          <canvas ref={this.canvasRef} className="skin-viewer-canvas"/>
          <div className="skin-viewer-controls">
            <button onClick={this.toggleAnimation} className="viewer-control-btn" title={this.state.isAnimating ? 'Пауза' : 'Играть'}>
              {this.state.isAnimating ? (<svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <g>
                    <path d="m12 5a5 5 0 0 0 -5 5v28a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-28a5 5 0 0 0 -5-5zm7 5v28a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3-3v-28a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3z"></path>
                    <path d="m32 43h4a5 5 0 0 0 5-5v-28a5 5 0 0 0 -5-5h-4a5 5 0 0 0 -5 5v28a5 5 0 0 0 5 5zm-3-33a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v28a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3-3z"></path>
                  </g>
                </svg>) : (<svg height="20" viewBox="0 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="m468.8 235.008-401.364-231.73a24.24 24.24 0 0 0 -36.359 20.993v463.458a24.189 24.189 0 0 0 36.36 20.993l401.363-231.73a24.239 24.239 0 0 0 0-41.984zm-405.723 239.281v-436.578l378.086 218.289z"></path>
                </svg>)}
            </button>
            <button onClick={this.takeScreenshot} className="viewer-control-btn" title="Скриншот">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
                <path d="M27.348,7H23.054l-.5-1.5A3.645,3.645,0,0,0,19.089,3H12.911A3.646,3.646,0,0,0,9.447,5.5L8.946,7H4.652A3.656,3.656,0,0,0,1,10.652v14.7A3.656,3.656,0,0,0,4.652,29h22.7A3.656,3.656,0,0,0,31,25.348v-14.7A3.656,3.656,0,0,0,27.348,7ZM29,25.348A1.654,1.654,0,0,1,27.348,27H4.652A1.654,1.654,0,0,1,3,25.348v-14.7A1.654,1.654,0,0,1,4.652,9H9.667a1,1,0,0,0,.948-.684l.729-2.187A1.65,1.65,0,0,1,12.911,5h6.178a1.649,1.649,0,0,1,1.567,1.13l.729,2.186A1,1,0,0,0,22.333,9h5.015A1.654,1.654,0,0,1,29,10.652Z"></path>
                <path d="M16,10a7.5,7.5,0,1,0,7.5,7.5A7.508,7.508,0,0,0,16,10Zm0,13a5.5,5.5,0,1,1,5.5-5.5A5.506,5.506,0,0,1,16,23Z"></path>
                <circle cx="26" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
        <div className="skin-viewer-settings">
          <div className="settings-group">
            <label className="settings-label">Фон</label>
            <div className="skin-viewer-backgrounds">
              {BACKGROUNDS.map(bg => (<button key={bg.id} onClick={() => this.changeBackground(bg.id)} className={`bg-preset ${this.state.background === bg.id ? 'active' : ''}`} title={bg.name} style={{
                    background: bg.css,
                    backgroundSize: bg.size,
                }}/>))}
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">Анимация</label>
            <div className="custom-dropdown">
              <button onClick={this.toggleDropdown} className="dropdown-toggle">
                {this.state.animation === 'walk' && 'Прогулочка'}
                {this.state.animation === 'run' && 'Мчится'}
                {this.state.animation === 'fly' && 'В полёте'}
                {this.state.animation === 'idle' && 'На месте'}
                {this.state.animation === 'hit' && 'Добывает'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {this.state.showAnimationDropdown && (<div className="dropdown-menu">
                  <div onClick={() => this.selectAnimation('walk')} className="dropdown-item">Прогулочка</div>
                  <div onClick={() => this.selectAnimation('run')} className="dropdown-item">Мчится</div>
                  <div onClick={() => this.selectAnimation('fly')} className="dropdown-item">В полёте</div>
                  <div onClick={() => this.selectAnimation('idle')} className="dropdown-item">На месте</div>
                  <div onClick={() => this.selectAnimation('hit')} className="dropdown-item">Добывает</div>
                </div>)}
            </div>
          </div>
        </div>
        
        <div className="skin-viewer-hint">
          Зажмите ЛКМ и двигайте мышью для вращения
        </div>
      </div>);
    }
}
