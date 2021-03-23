import { AlignmentType, CharacterType } from "./../enums";
import { CharacterCard } from "./../models/game";

const relativePath = "/assets/characters/";

export const CharactersDatabase: Array<CharacterCard> = new Array<CharacterCard>({
        id: 1,
        name: 'Mordred',
        imageUrl: relativePath + 'evil/Mordred.png',
        alignment: AlignmentType.Evil,
        description: 'Unknown to Merlin',
        type: CharacterType.Mordred,
        additionalInfo: ''
    }, {
        id: 2,
        name: 'Assassin',
        imageUrl: relativePath + 'evil//Assassin.png',
        alignment: AlignmentType.Evil,
        description: 'Minion of Mordred',
        type: CharacterType.Assassin,
        additionalInfo: ''
    }, {
        id: 3,
        name: 'Lancelot',
        imageUrl: relativePath + 'evil/Lancelot.png',
        alignment: AlignmentType.Evil,
        description: 'Minion of Mordred',
        type: CharacterType.LancelotEvil,
        additionalInfo: ''
    }, {
        id: 4,
        name: 'Minion #1',
        imageUrl: relativePath + 'evil/Minion1.png',
        alignment: AlignmentType.Evil,
        description: 'Minion of Mordred',
        type: CharacterType.CommonEvil,
        additionalInfo: ''
    },{
        id: 5,
        name: 'Minion #2',
        imageUrl: relativePath + 'evil/Minion2.png',
        alignment: AlignmentType.Evil,
        description: 'Minion of Mordred',
        type: CharacterType.CommonEvil,
        additionalInfo: ''
    },{
        id: 6,
        name: 'Minion #3',
        imageUrl: relativePath + 'evil/Minion3.png',
        alignment: AlignmentType.Evil,
        description: 'Minion of Mordred',
        type: CharacterType.CommonEvil,
        additionalInfo: ''
    },
    {
        id: 7,
        name: 'Morgana',
        imageUrl: relativePath + 'evil/Morgana.png',
        alignment: AlignmentType.Evil,
        description: 'Appears as Merlin',
        type: CharacterType.Morgana,
        additionalInfo: ''
    }, {
        id: 8,
        name: 'Oberon',
        imageUrl: relativePath + 'evil/Oberon.png',
        alignment: AlignmentType.Evil,
        description: 'Unknown to Evil',
        type: CharacterType.Oberon,
        additionalInfo: ''
    }, {
        id: 9,
        name: 'Merlin',
        imageUrl: relativePath + 'good/Merlin.png',
        alignment: AlignmentType.Good,
        description: 'Knows evil, must remain hidden',
        type: CharacterType.Merlin,
        additionalInfo: ''
    }, {
        id: 10,
        name: 'Lancelot',
        imageUrl: relativePath + 'good/Lancelot.png',
        alignment: AlignmentType.Good,
        description: 'Loyal servant of Arthur',
        type: CharacterType.LancelotGood,
        additionalInfo: ''
    }, {
        id : 11,
        name : 'Minion #1',
        imageUrl : relativePath + 'good/Minion1.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type: CharacterType.CommonGood,
        additionalInfo: ''
    },{
        id : 12,
        name : 'Minion #2',
        imageUrl : relativePath + 'good/Minion2.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type: CharacterType.CommonGood,
        additionalInfo: ''
    },{
        id : 13,
        name : 'Minion #3',
        imageUrl : relativePath + 'good/Minion3.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type: CharacterType.CommonGood,
        additionalInfo: ''
    },{
        id : 14,
        name : 'Minion #4',
        imageUrl : relativePath + 'good/Minion4.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type: CharacterType.CommonGood,
        additionalInfo: ''
    },{
        id : 15,
        name : 'Minion #5',
        imageUrl : relativePath + 'good/Minion5.png',
        alignment : AlignmentType.Good,
        description : 'Loyal servant of Arthur',
        type: CharacterType.CommonGood,
        additionalInfo: ''
    }, {
        id: 16,
        name: 'Percival',
        imageUrl: relativePath + 'good/Percival.png',
        alignment: AlignmentType.Good,
        description: 'Loyal servant of Arthur',
        type: CharacterType.Percival,
        additionalInfo: ''
    });
