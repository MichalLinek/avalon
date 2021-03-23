import { MessageType } from "../../enums/index";
import { Campaign } from "../game/index";

export class GameDetailsResponse {
    public specialCharacters: any[] = [];
    public defaultCampaigns: Campaign[] = [];
    public type: string = MessageType.GET_GAME_DETAILS;
}
