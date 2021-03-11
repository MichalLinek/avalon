import { CharacterCard } from '../../../../Common/db/CharacterCard';
import { Campaign } from './../../../../Common/models/campaign.model';

export class Room {
    public name: string;
    public numberOfGood: number;
    public numberOfEvil: number;
    public excaliburEnabled: boolean;
    public ladyOfTheLakeEnabled: boolean;
    public numberOfPlayers: number;
    public specialCharacters: CharacterCard[] = [];
    public campaign: Campaign = new Campaign(0, 0, 0, []);
}
