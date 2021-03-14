import { Player } from "../../server/models/player.model";

export class TeamVoteRequestResponse {
    public type: string;
    public player: Player;
}
