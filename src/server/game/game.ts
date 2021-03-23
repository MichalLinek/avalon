import { AlignmentType, CharacterType } from "./../../app/enums/index";
import { CampaignDatabase, CharactersDatabase } from "./../../app/db/index";
import { Campaign, Player } from "./../../app/models/game";

export class Game {
    public static attachCharactersToSockets(campaign: Campaign, players: Player[]) {
        let specialCharacterIds = campaign.specialCharactersIds;
        let commonEvil = CharactersDatabase.filter(x => x.type === CharacterType.CommonEvil).map(x => x.id);
        let commonGood = CharactersDatabase.filter(x => x.type === CharacterType.CommonGood).map(x => x.id);
        let randomNormalGoodCharacterIds = [];
        let randomNormalEvilCharacterIds = [];

        let numberOfCommonEvil = campaign.numberOfEvil;
        let numberOfCommonGood = campaign.numberOfGood;

        for (let i = 0; i < campaign.specialCharactersIds.length; i ++) {
            let character = CharactersDatabase.find(x => x.id === campaign.specialCharactersIds[i]);
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
            let selectedCharacter = CharactersDatabase.filter(x => x.id === allIds[selectedId])[0];
            
            players[i].characterCard = selectedCharacter;
            allIds.splice(selectedId, 1);
        }
    };

    public static addSpecialAbilitiesToCharacters(players: Player[]) {
        for (let i = 0 ; i < players.length; i++) {
            let otherSockets = players.filter(x => x.socketId != players[i].socketId);

            switch(players[i].characterCard.type) {
                case CharacterType.CommonEvil: {
                    let friends = otherSockets.filter(x => x.characterCard.alignment === AlignmentType.Evil && x.characterCard.type !== CharacterType.Oberon).map(x => x.userName);
                    let additionalMessage = friends.length ? 'Your accomplices are ' + friends.join() : 'You are alone.';
                    players[i].characterCard.additionalInfo = "You are common evil. " + additionalMessage;
                    break;
                }
                case CharacterType.CommonGood: {
                    players[i].characterCard.additionalInfo = "Your role doesn't give you any advantages";
                    break;
                }
                case CharacterType.Mordred: {
                    let friends = otherSockets.filter(x => x.characterCard.alignment === AlignmentType.Evil && x.characterCard.type !== CharacterType.Oberon).map(x => x.userName);
                    let additionalMessage = friends.length ? 'Your accomplices are ' + friends.join() : 'You are alone.';
                    players[i].characterCard.additionalInfo = "You are unknown to Merlin. " + additionalMessage;
                    break;
                }
                case CharacterType.Assassin: {
                    let friends = otherSockets.filter(x => x.characterCard.alignment === AlignmentType.Evil && x.characterCard.type !== CharacterType.Oberon).map(x => x.userName);
                    let additionalMessage = friends.length ? 'Your accomplices are ' + friends.join() : 'You are alone.';
                    players[i].characterCard.additionalInfo = "You have to kill Merlin at the end of the game. " + additionalMessage;
                    break;
                }
                case CharacterType.LancelotEvil: {
                    players[i].characterCard.additionalInfo = "You don't know your friends. Watch out for Lancelot changing cards";
                    break;
                }
                case CharacterType.Morgana: {
                    let friends = otherSockets.filter(x => x.characterCard.alignment === AlignmentType.Evil && x.characterCard.type !== CharacterType.Oberon)
                    .map(x => x.userName);
                    let additionalMessage = friends.length ? 'Your accomplices are ' + friends.join() : 'You are alone.';
                    players[i].characterCard.additionalInfo = "You are reveiled to Percival with Merlin. " + additionalMessage;
                    break;
                }
                case CharacterType.Oberon: {
                    players[i].characterCard.additionalInfo = "You are evil but you don't know your accomplices.";
                    break;
                }
                case CharacterType.Merlin: {
                    let enemies = otherSockets.filter(x => x.characterCard.alignment === AlignmentType.Evil &&
                        x.characterCard.type !== CharacterType.Mordred && 
                        x.characterCard.type !== CharacterType.Oberon)
                    .map(x => x.userName);
                    players[i].characterCard.additionalInfo = enemies.length ?  "Your enemies are " + enemies.join() : "You don't know your enemies.";
                    break;
                }
                case CharacterType.LancelotGood: {
                    players[i].characterCard.additionalInfo = "You don't know your accomplices. Watch out for Lancelot changing cards.";
                    break;
                }
                case CharacterType.Percival: {
                    let isMerlinPresent = otherSockets.find(x => [CharacterType.Merlin].indexOf(x.characterCard.type) > - 1);
                    let isMorganaPresent = otherSockets.find(x => [CharacterType.Morgana].indexOf(x.characterCard.type) > - 1);

                    let additionalMessage = "";
                    if (!isMerlinPresent && !isMorganaPresent)
                        additionalMessage = "Your role doesn't give you any advantage";
                    else if (isMerlinPresent && isMerlinPresent) {
                        let merlinAndMorgana = [isMerlinPresent, isMorganaPresent];
                        let chooseOne = merlinAndMorgana[Math.floor(Math.random() * 2)];
                        let chooseTwo = merlinAndMorgana.filter(x => x !== chooseOne)[0];
                        additionalMessage = "One of those is Merlin and Morgana: " + chooseOne.userName + ", " + chooseTwo.userName;
                    }
                    else {
                        if (isMerlinPresent)
                            additionalMessage = "Merlin is : " + isMerlinPresent.userName;
                        else
                            additionalMessage = "Morgana is : " + isMorganaPresent.userName;
                    }

                    players[i].characterCard.additionalInfo = additionalMessage;
                    
                    break;
                }
            }
        }
    }

    public static setRandomPlayerAsLeader(players: Player[]): void {
        const len = players.length;
        let randomPlayer = players[Math.floor(Math.random() * len)];
        randomPlayer.isLeader = true;
    }

    public static getSpecialCharacters() {
        return CharactersDatabase.filter(x => x.type > 1);
    }

    public static getDefaultCampaign(numberOfPlayers: number): Campaign | undefined {
        let campaign = CampaignDatabase.Campaigns.find(x => x.numberOfPlayers == numberOfPlayers);
        return campaign;
    }

    public static getDefaultCampaigns(): Campaign[] {
        return CampaignDatabase.Campaigns;
    }
}