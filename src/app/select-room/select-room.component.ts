import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { NavigationPaths } from '../helpers/navigation-paths';
import { UserGlobal } from '../user-global.model';
import { MessageType } from '../../common/constants/Enums/MessageType';
import { AvailableRoomsResponse, JoinRoomResponse } from '../../common/responses';

@Component({
  selector: 'app-select-room',
  templateUrl: './select-room.component.html',
  styleUrls: ['./select-room.component.css']
})
export class SelectRoomComponent implements OnInit, OnDestroy {

  public availableRooms: string[] = [];

  private subscription: ISubscription;

  constructor(private chat: ChatService, private router: Router) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.JOIN_ROOM) {
        let data = msg as JoinRoomResponse;
        UserGlobal.room = data.gameRoom;
        this.router.navigate([NavigationPaths.waitingRoom]);
      }
      else if (msg.type === MessageType.AVAILABLE_ROOMS) {
        let data = msg as AvailableRoomsResponse;
        this.availableRooms = data.roomIds
      }
      (error) => console.log(error);
    });
    this.chat.sendRequestForRooms();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public createRoom(): void {
    this.router.navigate([NavigationPaths.createRoom]);
  }

  public goBack(): void {
    this.router.navigate([NavigationPaths.home]);
  }

  public joinRoom(roomName: string): void {
    this.chat.joinRoom(roomName);
  }
}
