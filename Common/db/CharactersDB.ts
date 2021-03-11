import { CharacterCard } from './CharacterCard';
import { AlignmentType } from '../constants/Enums/AlignmentType';
import { CharacterType } from '../constants/Enums/CharacterType';

const relativePath = "../../Common/images/characters/";

export const CharactersDB: Array<CharacterCard> = new Array<CharacterCard>({
        // EVIL Characters :
        id : 1,
        name : 'Mordred',
        imageUrl : relativePath + 'evil/Mordred.png',
        alignment : AlignmentType.Evil,
        description : 'Unknown to Merlin',
        type : CharacterType.Mordred,
        additionalInfo : ''
    }, {
        id : 2,
        name : 'Assassin',
        imageUrl : relativePath + 'evil//Assassin.png',
        alignment : AlignmentType.Evil,
        description : 'Minion of Mordred',
        type : CharacterType.Assassin,
        additionalInfo : ''
    }, {
        id : 3,
        name : 'Lancelot',
        imageUrl : relativePath + 'evil/Lancelot.png',
        alignment : AlignmentType.Evil,
        description : 'Minion of Mordred',
        type : CharacterType.LancelotEvil,
        additionalInfo : ''
    }, {
        id : 7,
        name : 'Morgana',
        imageUrl : relativePath + 'evil/Morgana.png',
        alignment : AlignmentType.Evil,
        description : 'Appears as Merlin',
        type : CharacterType.Morgana,
        additionalInfo : ''
    }, {
        id : 8,
        name : 'Oberon',
        imageUrl : relativePath + 'evil/Oberon.png',
        alignment : AlignmentType.Evil,
        description : 'Unknown to Evil',
        type : CharacterType.Oberon,
        additionalInfo : ''
    }, {
        // GOOD Characters :
        id : 9,
        name : 'Merlin',
        imageUrl : relativePath + 'good/Merlin.png',
        alignment : AlignmentType.Good,
        description : 'Knows evil, must remain hidden',
        type : CharacterType.Merlin,
        additionalInfo : ''
    }, {
        id : 10,
        name : 'Lancelot',
        imageUrl : relativePath + 'good/Lancelot.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type : CharacterType.LancelotGood,
        additionalInfo : ''
    }, {
        id : 16,
        name : 'Percival',
        imageUrl : relativePath + 'good/Percival.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type : CharacterType.Percival,
        additionalInfo : ''
    });
