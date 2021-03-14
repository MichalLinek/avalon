import { Player } from "../../server/models/player.model";

export class StartVotingRequestModel {
    public players: Player[];
    public roomId: string;
}