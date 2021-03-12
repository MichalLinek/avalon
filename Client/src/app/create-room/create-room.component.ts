import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { GameRoom } from '../../../../Common/models/game-room.model';
import { ISubscription } from 'rxjs/Subscription';
import { CharacterCard } from '../../../../Common/db/CharacterCard';
import { MessageType } from '../../../../Common/constants/Enums/MessageType';
import { Mission } from '../../../../Common/models/mission.model';
import { NavigationPaths } from '../helpers/navigation-paths';
import { GameDetailsResponse } from "../../../../Common/responses/game-details-response.model";
import { GameRoomCreateResponse } from "../../../../Common/responses/game-room-create-response.model";
import { Campaign } from '../../../../Common/models/campaign.model';

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
  public numberOfPlayers: number;

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
          if (createRoomResponse.isRoomCreated)
            this.router.navigate([NavigationPaths.waitingRoom]);
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
}
