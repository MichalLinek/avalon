import { Player } from "../game";

export class StartVotingRequestModel {
    public players: Player[];
    public roomId: string;
}