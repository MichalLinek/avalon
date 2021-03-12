import { CharacterCard } from './../db/CharacterCard';
import { Campaign } from './campaign.model';

export class GameSettings {
    public numberOfGood: number;
    public numberOfEvil: number;
    public excaliburEnabled: boolean;
    public ladyOfTheLakeEnabled: boolean;
    public numberOfPlayers: number;
    public specialCharacters: CharacterCard[] = [];
    public campaign: Campaign = new Campaign(0, 0, 0, []);
}
