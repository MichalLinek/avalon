import { MessageType } from "../../enums/index";
import { Player } from "../game/index";

export class PlayersInRoomResponse {
    public players: Player[] = [];
    public type: string = MessageType.PLAYERS_IN_ROOM;
}
