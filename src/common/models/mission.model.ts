import { MissionResultType } from "../constants/Enums/MissionResultType";

export class Mission {
    public id: number;
    public numberOfCompanions: number; 
    public numberOfFailsToFailMission: number;
    public isSuccess?: boolean;
    public currentVotes: MissionResultType[] = [];

    constructor(id: number, numberOfCompanions: number, numberOfFailsToFailMission: number) {
        this.id = id;
        this.numberOfCompanions = numberOfCompanions;
        this.numberOfFailsToFailMission = numberOfFailsToFailMission;
        this.currentVotes = [];
    }   
}