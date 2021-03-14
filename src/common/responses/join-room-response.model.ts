import { GameRoom } from "../models/game-room.model";

export class JoinRoomResponse {
    public gameRoom: GameRoom;
    public type: string;
}
