import { Player } from "../../server/models/player.model";

export class PlayerPlannedOnMissionResponse {
    public type: string;
    public player: Player;
}
