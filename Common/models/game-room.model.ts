import { GameSettings } from "./game-settings.model";

export class GameRoom {
    public roomId: string;
    public name: string;
    public gameSettings: GameSettings;

    constructor(roomId: string, name: string) {
        this.roomId = roomId;
        this.name = name;
        this.gameSettings = new GameSettings();
    }
}