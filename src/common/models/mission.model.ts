export class Mission {
    public id: number;
    public numberOfCompanions: number; 
    public numberOfFailsToFailMission: number;
    public isSuccess?: boolean;

    constructor(id: number, numberOfCompanions: number, numberOfFailsToFailMission: number) {
        this.id = id;
        this.numberOfCompanions = numberOfCompanions;
        this.numberOfFailsToFailMission = numberOfFailsToFailMission;
    }   
}