import { Player } from "../../server/models/player.model";
import { Mission } from "../models/mission.model";

export class MissionVotesResultResponse {
    public type: string;
    public lastMission: Mission;
    public players: Player[];
}
