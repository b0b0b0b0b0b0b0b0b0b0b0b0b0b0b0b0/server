export class CapeRenderer {
    canvas;
    ctx;
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }
    async renderCape(url, scale = 4) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const width = 20 * scale;
                const height = 32 * scale;
                this.canvas.width = width;
                this.canvas.height = height;
                this.ctx.clearRect(0, 0, width, height);
                this.ctx.drawImage(img, 1, 1, 10, 16, 0, 0, 10 * scale, 16 * scale);
                this.ctx.drawImage(img, 12, 1, 10, 16, 10 * scale, 0, 10 * scale, 16 * scale);
                resolve(this.canvas.toDataURL());
            };
            img.onerror = reject;
            img.src = url;
        });
    }
}
