import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { Room } from '../Models/Room';
import { ISubscription } from 'rxjs/Subscription';
import { CharacterCard } from '../../../../Common/db/CharacterCard';
import { MessageType } from '../../../../Common/constants/Enums/MessageType';
import { Mission } from '../Models/Mission';
import { NavigationPaths } from '../helpers/navigation-paths';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['id', 'companions', 'failures'];
  public specialCharacters: CharacterCard[] = [];
  public room: Room = new Room();

  private subscription: ISubscription;
  private numberOfPlayers: number;

  constructor(private chat: ChatService, private router: Router) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg) {
        if (msg.Type === MessageType.GET_SPECIAL_CHARACTERS) {
          this.specialCharacters = msg.data;
        } else if (msg.Type === MessageType.GET_DEFAULT_CAMPAIGN) {
        this.room.Campaign = msg.data;
        }
      }
    });

    this.chat.getSpecialCharacters();
  }

  public createRoom(): void {
    this.room.NumberOfPlayers = 1;
    this.chat.createNewRoom(this.room);
    this.router.navigate([NavigationPaths.waitingRoom]);
  }

  public goBack(): void {
    this.router.navigate([NavigationPaths.selectRoom]);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onNgModelChange($event): void {
    console.log($event);
    this.setNumberOfPlayers();
  }

  public setNumberOfPlayers(): void {
    this.numberOfPlayers = this.room.SpecialCharacters.length + this.room.NumberOfEvil + this.room.NumberOfGood;
      this.chat.getDefaultCampaign(this.numberOfPlayers);
  }

  public decreaseCompanions(mission: Mission): void {
    if (mission.NumberOfCompanions > 1) {
      mission.NumberOfCompanions--;
    }
  }

  public increaseCompanions(mission: Mission): void {
    if (mission.NumberOfCompanions < 5) {
      mission.NumberOfCompanions++;
    }
  }

  public decreaseFailures(mission: Mission): void {
    if (mission.NumberOfFailsToFailMission > 1) {
      mission.NumberOfFailsToFailMission--;
    }
  }

  public increaseFailures(mission: Mission): void {
    if (mission.NumberOfFailsToFailMission < 3) {
      mission.NumberOfFailsToFailMission++;
    }
  }
}
