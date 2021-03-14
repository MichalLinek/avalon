import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { NavigationPaths } from '../helpers/navigation-paths';
import { CharacterCard } from '../../common/db/CharacterCard';
import { Campaign } from '../../common/models/campaign.model';
import { GameRoom } from '../../common/models/game-room.model';
import { GameDetailsResponse } from '../../common/responses/game-details-response.model';
import { GameRoomCreateResponse } from '../../common/responses/game-room-create-response.model';
import { MessageType } from '../../common/constants/Enums/MessageType';
import { Mission } from '../../common/models/mission.model';
import { UserGlobal } from '../user-global.model';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['id', 'companions', 'failures'];
  public specialCharacters: CharacterCard[] = [];
  public defaultCampaigns: Campaign[] = [];
  public room: GameRoom = new GameRoom("", "");
  public error: boolean = false;
  private subscription: ISubscription;
  public numberOfPlayers: number = 5;

  constructor(private chat: ChatService, private router: Router) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe((msg) => {
      if (msg) {
        if (msg.type === MessageType.GET_GAME_DETAILS) {
          let gameDetailResponse = msg as GameDetailsResponse;
          this.specialCharacters = gameDetailResponse.specialCharacters;
          this.defaultCampaigns = gameDetailResponse.defaultCampaigns;
        }
        else if (msg.type === MessageType.CREATE_ROOM) {
          let createRoomResponse = msg as GameRoomCreateResponse;
          if (createRoomResponse.isRoomCreated) {
            UserGlobal.room = this.room;
            this.router.navigate([NavigationPaths.waitingRoom]);
          }
          else
            this.error = true;
        }
      }
    });

    this.chat.getGameDetails();
  }

  public createRoom(): void {
    this.chat.createNewRoom(this.room);
  }

  public goBack(): void {
    this.router.navigate([NavigationPaths.selectRoom]);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public decreaseCompanions(mission: Mission): void {
    if (mission.numberOfCompanions > 1) {
      mission.numberOfCompanions--;
    }
  }

  public increaseCompanions(mission: Mission): void {
    if (mission.numberOfCompanions < 5) {
      mission.numberOfCompanions++;
    }
  }

  public decreaseFailures(mission: Mission): void {
    if (mission.numberOfFailsToFailMission > 1) {
      mission.numberOfFailsToFailMission--;
    }
  }

  public increaseFailures(mission: Mission): void {
    if (mission.numberOfFailsToFailMission < 3) {
      mission.numberOfFailsToFailMission++;
    }
  }

  public setDefaultCampaign(): void {
    console.log(this.room.campaign.specialCharactersIds);
    let campaign = this.defaultCampaigns.find(x => x.numberOfPlayers == this.numberOfPlayers);
    console.log(campaign);
    if (campaign) {
      this.room.campaign = {...campaign};
    }
  }

  public getCharacterCardName(id: number): string {
    let value = this.specialCharacters.find(x => x.id == id);
    if (value)
      return value.name;
    return "";
  }
}
