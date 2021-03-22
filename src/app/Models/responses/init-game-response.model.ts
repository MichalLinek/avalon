import { CharacterCard, Player } from "../game/index";

export class InitGameResponse {
    public type: string;
    public characterCard: CharacterCard;
    public players: Player[];
}
