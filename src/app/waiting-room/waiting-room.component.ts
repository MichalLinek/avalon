import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { NavigationPaths } from '../helpers/navigation-paths';
import { MessageType } from '../../common/constants/Enums/MessageType';
import { UserGlobal } from '../user-global.model';
import { Player } from '../../server/models/player.model';
import { PlayersInRoomResponse } from '../../common/responses';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {

  public ready: boolean = false;
  public maxLimit: number = 10;
  public availablePlayers: number = 0;
  private subscription: ISubscription;
  public players: Player[] = [];
  public displayedColumns: string[] = ['id', 'name', 'ready'];

  constructor(private chat: ChatService, private router: Router, private notificationService: NotificationService) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.GAME_START) {
        this.startGame();
        this.notificationService.emitChange('Game Starting');
      } 
      else if (msg.type === MessageType.PLAYERS_IN_ROOM) {
        let request = msg as PlayersInRoomResponse;
        this.players = request.players;
        this.maxLimit = UserGlobal.room.campaign.numberOfPlayers;
        this.availablePlayers = request.players.length;
      }
    }), (error) => console.log('Error' + error);

    this.chat.sendRequestForPlayersInRooms(UserGlobal.room.name);
  }

  public readyClicked(): void {
    this.ready = !this.ready;
    this.chat.sendWaitingRoomPlayerUpdate(this.ready);
  }

  public requestStartGame() {
    this.chat.startGame();
  }

  public startGame(): void {
    this.router.navigate([NavigationPaths.gameRoom]);
  }

  public goBack(): void {
    this.chat.leaveRoom();
    UserGlobal.room = null;
    this.router.navigate([NavigationPaths.selectRoom]);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public isStartActive(): boolean {
    return this.players.filter(x => x.ready).length === this.maxLimit;
  }
}
