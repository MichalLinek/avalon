import { AlignmentType } from '../constants/Enums/AlignmentType';
import { CharacterType } from '../constants/Enums/CharacterType';

export class CharacterCard {
    public id: number;
    public name: string;
    public imageUrl: string;
    public alignment: AlignmentType;
    public description: string;
    public type: CharacterType;
    public additionalInfo: string;
}
