const COLOR_CODES = {
    '0': '#000000',
    '1': '#0000AA',
    '2': '#00AA00',
    '3': '#00AAAA',
    '4': '#AA0000',
    '5': '#AA00AA',
    '6': '#FFAA00',
    '7': '#AAAAAA',
    '8': '#555555',
    '9': '#5555FF',
    'a': '#55FF55',
    'b': '#55FFFF',
    'c': '#FF5555',
    'd': '#FF55FF',
    'e': '#FFFF55',
    'f': '#FFFFFF',
};
export class MotdFormatter {
    static parseToHtml(text) {
        if (!text)
            return '';
        const state = {
            color: '#FFFFFF',
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
        };
        let html = '';
        let currentSpan = '';
        let i = 0;
        const closeSpan = () => {
            if (currentSpan) {
                html += `</span>`;
                currentSpan = '';
            }
        };
        const openSpan = () => {
            closeSpan();
            const styles = [];
            styles.push(`color: ${state.color}`);
            if (state.bold)
                styles.push('font-weight: bold');
            if (state.italic)
                styles.push('font-style: italic');
            const decorations = [];
            if (state.underline)
                decorations.push('underline');
            if (state.strikethrough)
                decorations.push('line-through');
            if (decorations.length > 0) {
                styles.push(`text-decoration: ${decorations.join(' ')}`);
            }
            html += `<span style="${styles.join('; ')}">`;
            currentSpan = 'open';
        };
        while (i < text.length) {
            if ((text[i] === '§' || text[i] === '&') && i + 1 < text.length) {
                const code = text[i + 1];
                if (code === '#' && i + 7 < text.length) {
                    const hexColor = text.substring(i + 2, i + 8);
                    if (/^[0-9a-fA-F]{6}$/.test(hexColor)) {
                        state.color = '#' + hexColor.toUpperCase();
                        state.bold = false;
                        state.italic = false;
                        state.underline = false;
                        state.strikethrough = false;
                        openSpan();
                        i += 8;
                        continue;
                    }
                }
                const codeLower = code.toLowerCase();
                if (codeLower === 'x' && i + 13 < text.length) {
                    const hexParts = [];
                    let validHex = true;
                    for (let j = 0; j < 6; j++) {
                        const separator = text[i + 2 + j * 2];
                        if (separator === '§' || separator === '&') {
                            const hexChar = text[i + 3 + j * 2];
                            if (/[0-9a-fA-F]/.test(hexChar)) {
                                hexParts.push(hexChar);
                            }
                            else {
                                validHex = false;
                                break;
                            }
                        }
                        else {
                            validHex = false;
                            break;
                        }
                    }
                    if (validHex && hexParts.length === 6) {
                        state.color = '#' + hexParts.join('').toUpperCase();
                        state.bold = false;
                        state.italic = false;
                        state.underline = false;
                        state.strikethrough = false;
                        openSpan();
                        i += 14;
                        continue;
                    }
                }
                if (COLOR_CODES[codeLower]) {
                    state.color = COLOR_CODES[codeLower];
                    state.bold = false;
                    state.italic = false;
                    state.underline = false;
                    state.strikethrough = false;
                    openSpan();
                }
                else if (codeLower === 'l') {
                    state.bold = true;
                    openSpan();
                }
                else if (codeLower === 'o') {
                    state.italic = true;
                    openSpan();
                }
                else if (codeLower === 'n') {
                    state.underline = true;
                    openSpan();
                }
                else if (codeLower === 'm') {
                    state.strikethrough = true;
                    openSpan();
                }
                else if (codeLower === 'r') {
                    state.color = '#FFFFFF';
                    state.bold = false;
                    state.italic = false;
                    state.underline = false;
                    state.strikethrough = false;
                    openSpan();
                }
                else if (codeLower === 'k') {
                    i += 2;
                    continue;
                }
                i += 2;
            }
            else {
                if (!currentSpan) {
                    openSpan();
                }
                const char = text[i];
                if (char === '<') {
                    html += '&lt;';
                }
                else if (char === '>') {
                    html += '&gt;';
                }
                else if (char === '&') {
                    html += '&amp;';
                }
                else {
                    html += char;
                }
                i++;
            }
        }
        closeSpan();
        return html;
    }
    static stripCodes(text) {
        return text
            .replace(/\u00C2\u00A7/g, '§')
            .replace(/§#[0-9a-fA-F]{6}/g, '')
            .replace(/§x(§[0-9a-fA-F]){6}/gi, '')
            .replace(/&#[0-9a-fA-F]{6}/g, '')
            .replace(/&x(&[0-9a-fA-F]){6}/gi, '')
            .replace(/[§&][0-9a-fk-orx]/gi, '')
            .replace(/[§\u00A7]/g, '');
    }
    static toVanilla(text) {
        return text
            .replace(/§#[0-9a-fA-F]{6}/g, '')
            .replace(/§x(§[0-9a-fA-F]){6}/g, '')
            .replace(/§/g, '\\u00A7')
            .replace(/\n/g, '\\n');
    }
    static toSpigot(text) {
        return text.replace(/§#([0-9a-fA-F]{6})/g, (_match, hex) => {
            return '§x' + hex.toUpperCase().split('').map((c) => '§' + c).join('');
        }).replace(/§/g, '\\u00A7').replace(/\n/g, '\\n');
    }
    static toBungee(text) {
        return text.replace(/§#([0-9a-fA-F]{6})/g, (_match, hex) => {
            return '&x' + hex.toUpperCase().split('').map((c) => '&' + c).join('');
        }).replace(/§/g, '&').replace(/\n/g, '\\n');
    }
    static toServerListPlus(text) {
        return text.replace(/§#([0-9a-fA-F]{6})/g, (_match, hex) => {
            return '&#' + hex.toUpperCase();
        }).replace(/§/g, '&');
    }
}
