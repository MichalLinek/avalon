import { Mission } from "./mission.model";

export class Campaign {
    public numberOfPlayers: number;
    public missions: Mission[] = [];
    public specialCharactersIds: number[] = [];
    public numberOfGood: number;
    public numberOfEvil: number;
    public excaliburEnabled: boolean;
    public ladyOfTheLakeEnabled: boolean;
    public currentMission: number = 0;
    public currentVotingFails: number = 0;
}