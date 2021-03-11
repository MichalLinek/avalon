import { Mission } from "./mission.model";

export class Campaign {
    public numberOfPlayers: number;
    public recommendedMordredMinions: number;
    public votingFailedLimit: number;
    public missions: Mission[] = [];

    constructor(numberOfPlayers: number, recommendedMordredMinions: number, votingFailedLimit: number, missions: Mission[]) {
        this.numberOfPlayers = numberOfPlayers;
        this.recommendedMordredMinions = recommendedMordredMinions;
        this.votingFailedLimit = votingFailedLimit;
        this.missions = missions;
    }
}