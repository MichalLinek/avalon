import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { Subject } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-select-room',
  templateUrl: './select-room.component.html',
  styleUrls: ['./select-room.component.css']
})
export class SelectRoomComponent implements OnInit, OnDestroy {

  availableRooms: string[] = [];
  private subscription: ISubscription;

  constructor(private chat: ChatService, private router: Router) { }

  ngOnInit() {
    this.subscription = this.chat.messages.subscribe(msg => {
      console.log('SelectRoomComponent: ' + msg);
      this.availableRooms = msg.map(x => x.substring('ROOM_'.length)),
      (error) => console.log(error);
    });
    this.chat.sendRequestForRooms();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createRoom() {
    this.router.navigate(['createRoom']);
  }

  goBack() {
    this.router.navigate(['']);
  }

  joinRoom(roomName) {
    console.log(roomName);
    this.chat.joinRoom(roomName);
    this.router.navigate(['waitingRoom']);
  }
}
