import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { NavigationPaths } from '../helpers/navigation-paths';

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
      console.log('SelectRoomComponent: ' + msg);
      this.availableRooms = msg.map(x => x.substring('ROOM_'.length)),
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
    this.router.navigate([NavigationPaths.waitingRoom]);
  }
}
