import { CharacterCard } from '../../../../Common/db/CharacterCard';
import { Campaign } from './Campaign';

export class Room {
    public name: string;
    public NumberOfGood: number;
    public NumberOfEvil: number;
    public ExcaliburEnabled: boolean;
    public LadyOfTheLakeEnabled: boolean;
    public NumberOfPlayers: number;
    public SpecialCharacters: CharacterCard[];
    public Campaign: Campaign;
}
