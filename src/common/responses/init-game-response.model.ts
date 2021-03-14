import { Player } from "../../server/models/player.model";
import { CharacterCard } from "../db/CharacterCard";

export class InitGameResponse {
    public type: string;
    public characterCard: CharacterCard;
    public players: Player[];
}
