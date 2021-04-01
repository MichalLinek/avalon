import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AlignmentType, MessageType, NavigationPaths } from '../../enums';
import { UserGlobal } from '../../globals';
import { Player } from '../../models/game';
import { EndGameResultsResponse } from '../../models/responses';
import { NotificationService, SocketService } from '../../services';

@Component({
  selector: 'end-game',
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['name', 'character', 'alignment', 'score'];
  public win: boolean = false;
  public players: Player[];
  public hasGoodWon: boolean;
  private subscription: ISubscription;
  public alignmentType: AlignmentType;
  
  constructor(private chat: SocketService, 
    private router: Router,
    private notificationService: NotificationService) {
  }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.END_GAME_SUMMARY) {
        let data = msg as EndGameResultsResponse;
        this.players = data.players;
        this.hasGoodWon = data.goodAlignmentWon;
        let playerCard = this.players.find(x => x.userName === this.getPlayerName());
        let win = (playerCard.characterCard.alignment == AlignmentType.Good && this.hasGoodWon)
        || (playerCard.characterCard.alignment == AlignmentType.Evil && !this.hasGoodWon)
        this.notificationService.emitChange(win ? 'You have won' : 'You have lost')
      }
    });

    this.chat.getGameSummary();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public goBack() {
    UserGlobal.room = null;
    this.router.navigate([NavigationPaths.selectRoom]);
  }

  public getPlayerName() {
    return UserGlobal.userName;
  }

  public getScoreForPlayer(player: Player): string {
    let playerCard = player.characterCard;
    let win = (playerCard.alignment == AlignmentType.Good && this.hasGoodWon)
        || (playerCard.alignment == AlignmentType.Evil && !this.hasGoodWon);
      
    return win ? 'Winner' : 'Loser';
  }

  public translateEnum(type: AlignmentType) {
    return type == AlignmentType.Good ? "Good" : "Evil";
  }
}
