import { GameRoom } from "../models/game";

export class UserGlobal {
    public static userName: string = "";
    public static room: GameRoom = new GameRoom("", "");
    public static win?: boolean = null; 
    public static serverUrl: string = "";
}