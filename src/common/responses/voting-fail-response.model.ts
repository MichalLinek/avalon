import { Player } from "../../server/models/player.model";

export class VotingFailResponse {
    public type: string;
    public players: Player[];
}
