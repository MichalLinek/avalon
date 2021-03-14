import { AlignmentType } from "../common/constants/Enums/AlignmentType";
import { CharacterType } from "../common/constants/Enums/CharacterType";
import { CampaignDatabase } from "../common/db/CampaignDatabase";
import { CharactersDB } from "../common/db/CharactersDB";
import { Campaign } from "../common/models/campaign.model";
import { Player } from "./models/player.model";

export class Game {
    public static attachCharactersToSockets(campaign: Campaign, players: Player[]) {
        let specialCharacterIds = campaign.specialCharactersIds;
        let commonEvil = CharactersDB.filter(x => x.type === CharacterType.CommonEvil).map(x => x.id);
        let commonGood = CharactersDB.filter(x => x.type === CharacterType.CommonGood).map(x => x.id);
        let randomNormalGoodCharacterIds = [];
        let randomNormalEvilCharacterIds = [];

        let numberOfCommonEvil = campaign.numberOfEvil;
        let numberOfCommonGood = campaign.numberOfGood;

        for (let i = 0; i < campaign.specialCharactersIds.length; i ++) {
            let character = CharactersDB.find(x => x.id === campaign.specialCharactersIds[i]);
            if (character.alignment === AlignmentType.Good) numberOfCommonGood -= 1;
            else numberOfCommonEvil -= 1
        }

        while(numberOfCommonEvil > 0) {
            let id = Math.floor(Math.random() * commonEvil.length);
            randomNormalEvilCharacterIds.push(commonEvil[id]);
            commonEvil.splice(commonEvil[id], 1);
            numberOfCommonEvil--;
        }

        while(numberOfCommonGood > 0) {
            let id = Math.floor(Math.random() * commonGood.length);
            randomNormalGoodCharacterIds.push(commonGood[id]);
            commonGood.splice(commonGood[id], 1);
            numberOfCommonGood--;
        }

        let allIds = specialCharacterIds.concat(randomNormalEvilCharacterIds, randomNormalGoodCharacterIds);
        
        for (let i = 0 ; i < players.length; i++) {
            let selectedId = Math.floor(Math.random() * allIds.length);
            let selectedCharacter = CharactersDB.filter(x => x.id === allIds[selectedId])[0];
            
            players[i].characterCard = selectedCharacter;
            allIds.splice(selectedId, 1);
        }
    };

    public static addSpecialAbilitiesToCharacters(players: Player[]) {
        for (let i = 0 ; i < players.length; i++) {
            let otherSockets = players.filter(x => x.socketId != players[i].socketId);

            switch(players[i].characterCard.type) {
                case CharacterType.CommonEvil: {
                    let friends = otherSockets.filter(x => [0,2,3,4,5,6].indexOf(x.characterCard.type) > -1).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "You are common evil. You're friends are " + friends.join();
                    break;
                }
                case CharacterType.CommonGood: {
                    players[i].characterCard.additionalInfo = "Unfortunatelly , you know nothing Jon Snow :(";
                    break;
                }
                case CharacterType.Mordred: {
                    let friends = otherSockets.filter(x => x.characterCard.type === 0).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "You are unknown to Merlin. You're friends are " + friends.join();
                    break;
                }
                case CharacterType.Assassin: {
                    let friends = otherSockets.filter(x => x.characterCard.type === 0).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "You have to kill Merlin at the end of the game. You're friends are " + friends.join();
                    break;
                }
                case CharacterType.LancelotEvil: {
                    players[i].characterCard.additionalInfo = "You don't know your friends. Watch out for Lancelot changing cards";
                    break;
                }
                case CharacterType.Morgana: {
                    let friends = otherSockets.filter(x => x.characterCard.type === 0).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "You are reveiled to Percival with Merlin. You're friends are " + friends.join();
                    break;
                }
                case CharacterType.Oberon: {
                    players[i].characterCard.additionalInfo = "You are evil but you don't know your friends";
                    break;
                }
                case CharacterType.Merlin: {
                    let enemies = otherSockets.filter(x => [0,3,4,5,6].indexOf(x.characterCard.type) > -1).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "Your enemies are " + enemies.join();
                    break;
                }
                case CharacterType.LancelotGood: {
                    players[i].characterCard.additionalInfo = "You don't know your friends. Watch out for Lancelot changing cards";
                    break;
                }
                case CharacterType.Percival: {
                    let merlinAndMorgana = otherSockets.filter(x => [5,7].indexOf(x.characterCard.type) > -1).map(x => x.userName);
                    players[i].characterCard.additionalInfo = "One of those is Merlin and Morgana: " + merlinAndMorgana.join();
                    break;
                }
            }
        }
    }

    public static setRandomPlayerAsLeader(players: Player[]): void {
        const len = players.length;
        players[Math.floor(Math.random() * len)].isLeader = true;

    }

    public static getSpecialCharacters() {
        return CharactersDB.filter(x => x.type > 1);
    }

    public static getDefaultCampaign(numberOfPlayers: number): Campaign | undefined {
        let campaign = CampaignDatabase.Campaigns.find(x => x.numberOfPlayers == numberOfPlayers);
        return campaign;
    }

    public static getDefaultCampaigns(): Campaign[] {
        return CampaignDatabase.Campaigns;
    }
}