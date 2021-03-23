import { GameRoomAvailability } from "../game";

export class AvailableRoomsResponse {
    public type: string;
    public rooms: GameRoomAvailability[];
}
