import { Campaign } from "./campaign.model";
import { Mission } from "./mission.model";

export class GameRoom {
    public roomId: string;
    public name: string;
    public campaign: Campaign;

    constructor(roomId: string, name: string) {
        this.roomId = roomId;
        this.name = name;
        this.campaign = {
            numberOfPlayers: 5,
            numberOfEvil:2,
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
        };
    }
}