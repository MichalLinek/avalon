import { Campaign } from "./models/campaign.model";
import { Mission } from "./models/mission.model";

export class CampaignDatabase {
    static Campaigns = [
        new Campaign(5, 2, 5, [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 2, 1),
            new Mission(4, 3, 1),
            new Mission(5, 3, 1)]
        ),
        new Campaign(6, 2, 5, [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 4, 1),
            new Mission(4, 3, 1),
            new Mission(5, 4, 1)
        ]),
        new Campaign(7, 3, 5, [
            new Mission(1, 2, 1),
            new Mission(2, 3, 1),
            new Mission(3, 3, 1),
            new Mission(4, 4, 2),
            new Mission(5, 4, 1)
        ]),
        new Campaign(8, 3, 5, [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ]),
        new Campaign(9, 3, 5, [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ]),
        new Campaign(10, 4, 5, [
            new Mission(1, 3, 1),
            new Mission(2, 4, 1),
            new Mission(3, 4, 1),
            new Mission(4, 5, 2),
            new Mission(5, 5, 1)
        ]),
        //Tests only
        new Campaign(2, 5, 1, [
            new Mission(1, 1, 1),
            new Mission(2, 1, 1)
        ]),
        new Campaign(3, 5, 1, [
            new Mission(1, 1, 1),
            new Mission(2, 1, 1)
        ]),
        new Campaign(4, 5, 1, [
            new Mission(1, 1, 1),
            new Mission(2, 1, 1)
        ]),
        new Campaign(1, 5, 1, [
            new Mission(1, 1, 1),
            new Mission(2, 1, 1)
        ])
    ];
}