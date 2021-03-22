import { AlignmentType, CharacterType } from '../../enums/index';

export class CharacterCard {
    public id: number;
    public name: string;
    public imageUrl: string;
    public alignment: AlignmentType;
    public description: string;
    public type: CharacterType;
    public additionalInfo: string;
}
