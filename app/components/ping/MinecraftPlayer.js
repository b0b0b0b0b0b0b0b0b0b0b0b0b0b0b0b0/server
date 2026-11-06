export class MinecraftPlayer {
    username;
    data = null;
    constructor(username) {
        this.username = username;
    }
    getUsername() {
        return this.username;
    }
    getData() {
        return this.data;
    }
    async fetch() {
        try {
            const response = await fetch(`/api/minecraft/skin/${encodeURIComponent(this.username)}`);
            if (!response.ok) {
                throw new Error('Player not found');
            }
            const data = await response.json();
            this.data = data;
            return data;
        }
        catch (error) {
            throw error;
        }
    }
}
