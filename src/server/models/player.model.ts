import { CharacterCard } from "../../common/db/CharacterCard";

export class Player {
    public socketId: string;
    public userName: string;
    public roomId?: string;
    public ready: boolean;
    public isLeader: boolean;
    public isGoingOnAMission: boolean;
    public hasVoted: boolean;
    public voteValue? : boolean;
    public characterCard?: CharacterCard;

    constructor(socketId: string, userName: string, roomId?: string) {
        this.socketId = socketId;
        this.userName = userName;
        this.roomId = roomId;
        this.ready = false;
        this.isLeader = false;
        this.isGoingOnAMission = false;
        this.hasVoted = false;
        this.voteValue = false;
    }   
}