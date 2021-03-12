import { MessageType } from "../constants/Enums/MessageType";
import { Campaign } from "../models/campaign.model";

export class GameDetailsResponse {
    public specialCharacters: any[] = [];
    public defaultCampaigns: Campaign[] = [];
    public type: string = MessageType.GET_GAME_DETAILS;
}
