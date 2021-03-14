import { Player } from "../../server/models/player.model";
import { MessageType } from "../constants/Enums/MessageType";

export class PlayersInRoomResponse {
    public players: Player[] = [];
    public type: string = MessageType.PLAYERS_IN_ROOM;
}
