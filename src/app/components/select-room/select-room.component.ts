import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { MessageType, NavigationPaths } from '../../enums';
import { UserGlobal } from '../../globals';
import { GameRoomAvailability } from '../../models/game';
import { AvailableRoomsResponse, JoinRoomResponse } from '../../models/responses';
import { SocketService } from '../../services';

@Component({
  selector: 'app-select-room',
  templateUrl: './select-room.component.html',
  styleUrls: ['./select-room.component.css']
})
export class SelectRoomComponent implements OnInit, OnDestroy {

  public availableRooms: GameRoomAvailability[] = [];

  private subscription: ISubscription;

  constructor(private chat: SocketService, private router: Router) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.JOIN_ROOM) {
        let data = msg as JoinRoomResponse;
        UserGlobal.room = data.gameRoom;
        this.router.navigate([NavigationPaths.waitingRoom]);
      }
      else if (msg.type === MessageType.AVAILABLE_ROOMS) {
        let data = msg as AvailableRoomsResponse;
        this.availableRooms = data.rooms
      }
      else if (msg.type === MessageType.PLAYER_DISCONNECTED) {
        this.router.navigate([NavigationPaths.home]);
      }
      (error) => {};
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
