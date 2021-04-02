import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Campaign, CharacterCard, GameRoom, Mission } from '../../models/game';
import { ISubscription } from 'rxjs/Subscription';
import { NotificationService, SocketService } from '../../services';
import { CreateRoomDialog } from '../../dialog-components';
import { AlignmentType, MessageType, NavigationPaths } from '../../enums';
import { UserGlobal } from '../../globals';
import { GameDetailsResponse, GameRoomCreateResponse } from '../../models/responses';

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
  public numberOfPlayers: number = 2;

  constructor(
    private chat: SocketService,
    private router: Router, private notificationService: NotificationService, public dialog: MatDialog) { }

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
            this.notificationService.emitChange('The room has been created.');
          } else if (msg.type === MessageType.PLAYER_DISCONNECTED) {
            this.router.navigate([NavigationPaths.home]);
          }
          else
            this.notificationService.emitChange('The room with this name already exists.');
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

  public toggleExcalibur(): void {
    this.room.campaign.excaliburEnabled = !this.room.campaign.excaliburEnabled;
  }

  public toggleLadyOfTheLake(): void {
    this.room.campaign.ladyOfTheLakeEnabled = !this.room.campaign.ladyOfTheLakeEnabled
  }

  public setDefaultCampaign(): void {
    let campaign = this.defaultCampaigns.find(x => x.numberOfPlayers == this.room.campaign.numberOfPlayers);
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

  public openRoomSummary(): void {
    let validationErrors = this.validate();
    if (!validationErrors) {
      const dialogRef = this.dialog.open(CreateRoomDialog, {
        width: '400px',
        data: {
          campaign: this.room.campaign,
          specialCharacters: this.specialCharacters
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (!validationErrors) {
            this.createRoom();
          }
        }
      });
    }
    else {
      this.notificationService.emitChange(validationErrors);
    }
  }

  public validate(): string {
    let moreFailsThanCompanionsError = this.room.campaign.missions.find(x => x.numberOfCompanions < x.numberOfFailsToFailMission);
    if (moreFailsThanCompanionsError)
      return `Mission ${moreFailsThanCompanionsError.id} has more fails than companions`;

    let moreCompanionsThanPlayersError = this.room.campaign.missions.find(x => x.numberOfCompanions > this.room.campaign.numberOfPlayers);
    if (moreCompanionsThanPlayersError)
      return `Mission ${moreCompanionsThanPlayersError.id} has more companions than total number players`;

    let moreEvilSpecialThanTotalEvil = this.specialCharacters.filter(
      x => x.alignment === AlignmentType.Evil && this.room.campaign.specialCharactersIds.indexOf(x.id) > -1).length > this.room.campaign.numberOfEvil;
    if (moreEvilSpecialThanTotalEvil)
      return "There are more special evil characters than total evil players";

    let moreGoodSpecialThanTotalGood = this.specialCharacters.filter(
      x => x.alignment === AlignmentType.Good && this.room.campaign.specialCharactersIds.indexOf(x.id) > -1).length > this.room.campaign.numberOfGood;
    if (moreGoodSpecialThanTotalGood)
      return "There are more special good characters than total good players";
    
    return "";
  }
}
