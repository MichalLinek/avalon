export class Player {
    public Name: string;
    public Ready: boolean;
    public Room: string;
    public IsLeader: boolean;
    public IsGoingOnAMission: boolean;
    public hasVoted: boolean;
    public voteValue? : boolean;

    constructor(name: string = '', ready: boolean = false) {
        this.Name = name;
        this.Ready = ready;
    }
}
