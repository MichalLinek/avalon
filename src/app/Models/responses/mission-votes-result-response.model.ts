import { Mission, Player } from "../game";

export class MissionVotesResultResponse {
    public type: string;
    public lastMission: Mission;
    public players: Player[];
}
