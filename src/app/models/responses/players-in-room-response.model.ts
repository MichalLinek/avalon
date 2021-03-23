import { MessageType } from "../../enums";
import { Player } from "../game";

export class PlayersInRoomResponse {
    public players: Player[] = [];
    public type: string = MessageType.PLAYERS_IN_ROOM;
}
