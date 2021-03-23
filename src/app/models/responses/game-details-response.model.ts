import { MessageType } from "../../enums";
import { Campaign } from "../game";

export class GameDetailsResponse {
    public specialCharacters: any[] = [];
    public defaultCampaigns: Campaign[] = [];
    public type: string = MessageType.GET_GAME_DETAILS;
}
