import { GameRoom } from "../common/models/game-room.model";

export class UserGlobal {
    public static userName: string = "";
    public static room: GameRoom = new GameRoom("", "");
    public static win?: boolean = null; 
}