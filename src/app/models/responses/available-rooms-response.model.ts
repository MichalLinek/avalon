import { GameRoomAvailability } from "../game/index";

export class AvailableRoomsResponse {
    public type: string;
    public rooms: GameRoomAvailability[];
}
