import { Player } from "../../server/models/player.model";

export class StartVotingResponse {
    public type: string;
    public players: Player[];
}
