import { Player } from "../game";

export class EndGameResultsResponse {
    public type: string;
    public players: Player[];
    public goodAlignmentWon: boolean;
}
