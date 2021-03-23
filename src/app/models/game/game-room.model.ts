import { Campaign } from "./campaign.model";
import { Mission } from "./mission.model";

export class GameRoom {
    public roomId: string;
    public name: string;
    public campaign: Campaign;
    public isStarted: boolean;

    constructor(roomId: string, name: string) {
        this.roomId = roomId;
        this.name = name;
        this.campaign = {
            currentMission: 0,
            numberOfPlayers: 5,
            numberOfEvil: 1,
            numberOfGood: 1,
            specialCharactersIds: [],
            missions: [
                new Mission(1, 2, 1),
                new Mission(2, 3, 1),
                new Mission(3, 2, 1),
                new Mission(4, 3, 1),
                new Mission(5, 3, 1)
            ],
            excaliburEnabled: false,
            ladyOfTheLakeEnabled: false,
            currentVotingFails: 0
        };
    }
}