import { CharacterCard, Player } from "../game";

export class InitGameResponse {
    public type: string;
    public characterCard: CharacterCard;
    public players: Player[];
}
