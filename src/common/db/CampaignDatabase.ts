import { Campaign } from "../models/campaign.model";
import { Mission } from "../models/mission.model";

export class CampaignDatabase {
    static Campaigns: Campaign[] = [{
        numberOfPlayers: 5,
        numberOfEvil: 2,
        numberOfGood: 3,
        specialCharactersIds: [2, 9],
        missions: [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 2, 1),
            new Mission(4, 3, 1),
            new Mission(5, 3, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 6,
        numberOfEvil: 2,
        numberOfGood: 4,
        specialCharactersIds: [2, 9, 10],
        missions: [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 4, 1),
            new Mission(4, 3, 1),
            new Mission(5, 4, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 7,
        numberOfEvil: 3,
        numberOfGood: 4,
        specialCharactersIds: [2, 7, 9, 10],
        missions: [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 3, 1),
            new Mission(4, 4, 2),
            new Mission(5, 4, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 8,
        numberOfEvil: 3,
        numberOfGood: 5,
        specialCharactersIds: [2, 7, 9, 10],
        missions: [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 9,
        numberOfEvil: 4,
        numberOfGood: 5,
        specialCharactersIds: [2, 7, 8, 9, 10],
        missions: [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 10,
        numberOfEvil: 4,
        numberOfGood: 6,
        specialCharactersIds: [2, 7, 8, 9, 10],
        missions: [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    },
    {
        numberOfPlayers: 2,
        numberOfEvil: 1,
        numberOfGood: 1,
        specialCharactersIds: [],
        missions: [
            new Mission(1, 1, 1),
            new Mission(2, 1, 1),
            new Mission(3, 1, 1),
            new Mission(4, 1, 1),
            new Mission(5, 1, 1)
        ],
        excaliburEnabled: false,
        ladyOfTheLakeEnabled: false
    }
    ];
}