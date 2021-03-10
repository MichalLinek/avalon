import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { Player } from '../Models/Player';
import { MessageType } from '../../../../Common/constants/Enums/MessageType';
import { NavigationPaths } from '../helpers/navigation-paths';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {

  ready: boolean = false;
  maxLimit: number = -1;
  availablePlayers: number = 0;
  private subscription: ISubscription;
  players: Player[] = [];
  displayedColumns: string[] = ['id', 'name', 'ready'];

  constructor(private chat: ChatService, private router: Router) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg === MessageType.GAME_START) {
        this.startGame();
      } else {
        this.players = [];
        this.maxLimit = msg.maxLimit;
        this.availablePlayers = msg.availablePlayers;
        const characters = msg.players;
        for (let i = 0 ; i < characters.length; i++) {
          this.players.push(new Player(characters[i].Name, characters[i].Ready));
        }
      }
    }), (error) => console.log('Error' + error);

    this.chat.sendRequestForPlayersInRooms();
    console.log(this.chat);
  }

  public readyClicked($event): void {
    this.ready = $event.checked;
    console.log('ready Clicked !' + this.ready);
    this.chat.sendPlayerUpdate(this.ready);
  }

  public requestStartGame() {
    this.chat.startGame();
  }

  public startGame(): void {
    this.router.navigate([NavigationPaths.gameRoom]);
  }

  public goBack(): void {
    this.router.navigate([NavigationPaths.selectRoom]);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public isStartActive(): boolean {
    return this.players.filter(x => x.Ready).length === this.maxLimit;
  }
}
