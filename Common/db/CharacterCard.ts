import { AlignmentType } from '../constants/Enums/AlignmentType';
import { CharacterType } from '../constants/Enums/CharacterType';

export class CharacterCard {
    public Id: number;
    public Name: string;
    public ImageUrl: string;
    public Alignment: AlignmentType;
    public Description: string;
    public Type: CharacterType;
    public AdditionalInfo: string;
}
