import { Player } from "../game/index";

export class StartVotingRequestModel {
    public players: Player[];
    public roomId: string;
}