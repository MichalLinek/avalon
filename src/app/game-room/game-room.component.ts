import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { ISubscription } from 'rxjs/Subscription';
import { MatDialog } from '@angular/material';
import { MissionVoteDialog } from '../mission-vote-dialog/mission-vote-dialog.component';
import { CompanionVoteDialog } from '../companion-vote.dialog/companion-vote-dialog.component';
import { Mission } from '../../common/models/mission.model';
import { CharacterCard } from '../../common/db/CharacterCard';
import { MessageType } from '../../common/constants/Enums/MessageType';
import { UserGlobal } from '../user-global.model';
import { Player } from '../../server/models/player.model';
import { InitGameResponse } from '../../common/responses';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['id', 'name', 'leader', 'onMission', 'vote', 'voteValue'];
  public missionDisplayedColumns: string[] = ['id', 'numberOfCompanions', 'numberOfFailsToFailMission', 'missionSuccess'];
  public characterCard: CharacterCard = new CharacterCard();
  public missions: Mission[] = UserGlobal.room.campaign.missions;
  public players: Player[] = [];
  public selectedPlayers = [];
  public votingActive: boolean;
  public afterSelectingCompanions: boolean;
  public allPlayersVoted: boolean = false;
  public gameLog = ' GAME LOGGER '; 
  public currentMission: number;
  public imageUrl: string;

  private subscription: ISubscription;

  constructor(private chat: ChatService, 
              private router: Router,
              public dialog: MatDialog) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.INIT_GAME) {
        let data = msg as InitGameResponse;
        this.characterCard = data.characterCard;
        this.players = data.players;
        this.currentMission = 0;
        this.imageUrl = this.getImageUrl();
      } else if (msg.type === MessageType.PLAYER_MISSION_CHANGE) {
        const user = msg.userName;
        const isOnMission = msg.onMission;

        this.players.find(x => x.userName === user).isGoingOnAMission = isOnMission;
      } else if (msg.type === MessageType.START_VOTING) {
        this.openCompanionVoteDialog();
        this.afterSelectingCompanions = true;
      } else if (msg.type === MessageType.VOTE_FOR_TEAM) {
        const voteOwner = msg.voteOwner;
        const player = this.players.find(x => x.userName === voteOwner);
        player.hasVoted = true;
        player.voteValue = msg.voteValue;

        if (this.players.filter(x => x.hasVoted).length === this.players.length) {
          this.allPlayersVoted = true;
        }
      } else if (msg.type === 'voteMission') {
        this.openMissionVoteDialog();
      } else if (msg.type === 'resetMission') {
        this.gameLog = 'Team didn\'t have enough votes';
        this.players = [];
        this.selectedPlayers = [];
        let players = msg.players;
        for (let i = 0 ; i < players.length; i++) {
          this.players.push(
            {
              userName: players[i].Name,
              isGoingOnAMission: false,
              isLeader: players[i].IsLeader,
              ready : false,
              roomId: '',
              hasVoted: false,
              socketId: ""
            }
          );
        }
        this.afterSelectingCompanions = false;
        this.allPlayersVoted = false;
      } else if (msg.type === MessageType.END_GAME) {
        if (msg.evilWin) {
          this.gameLog = 'EVIL WON';
        } else {
          this.gameLog = 'GOOD WON';
        }
      } else if (msg.type === 'missionVotesResult') {
        this.missions[this.currentMission].isSuccess = msg.IsMissionASuccess;
        this.currentMission++;
        this.players = [];
        this.selectedPlayers = [];
        let players = msg.players;
        for (let i = 0 ; i < players.length; i++) {
          this.players.push(
            {
              userName: players[i].userName,
              isGoingOnAMission: false,
              isLeader: players[i].IsLeader,
              ready : false,
              roomId: '',
              hasVoted: false,
              socketId: ""
            }
          );
        }
        this.afterSelectingCompanions = false;
        this.allPlayersVoted = false;
      } else {
        console.error('What kind of message is that ?');
        console.error(msg);
      }
    }), (error) => console.log('Error' + error);

    this.chat.initGame();
  }

  public getImageUrl(): string {
    return 'http://localhost:5000' + this.characterCard.imageUrl;
  }

  public readyClicked($event, playerName: string): void {
    const isPlayerOnMission = $event.checked;
    let playerId = this.selectedPlayers.indexOf(playerName);
    if (playerId === -1 && isPlayerOnMission) {
      this.selectedPlayers.push(playerName);
    }

    if (playerId > -1  && !isPlayerOnMission) {
      this.selectedPlayers.splice(playerId, 1);
    }
    this.chat.onMissionApplyUpdate(playerName, isPlayerOnMission);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public CheckboxEnabled(playerName: string): boolean {
    if (!this.afterSelectingCompanions) {
      if (this.players && this.players.length > 0) {
        const player = this.getPlayer();
        return player.isLeader && (this.selectedPlayers.indexOf(playerName) > -1 || this.selectedPlayers.length < this.missions[this.currentMission].numberOfCompanions);
      }
    }
    
    return false;
  }

  public IsVoteButtonActive() : boolean {
    if (!this.afterSelectingCompanions) {
      if (this.missions[this.currentMission]) {
        return this.selectedPlayers.length === this.missions[this.currentMission].numberOfCompanions;
      }
    }
    return false;
  }

  private getPlayer(): Player {
    const userName = UserGlobal.userName;
    return this.players.find(x => x.userName  === userName); 
  }

  public confirmTeam(): void {
    let team = this.selectedPlayers;
    this.chat.startVoting(team);
  }

  public openMissionVoteDialog(): void {
    const dialogRef = this.dialog.open(MissionVoteDialog, {
      width: '250px',
      data: {
        VoteFor : null,
        Character : this.characterCard
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result != null) {
        console.log('sending to service' + result);
        this.chat.voteForMission(result);
      }
    });
  }

  public openCompanionVoteDialog(): void {
    const dialogRef = this.dialog.open(CompanionVoteDialog, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result != null) {
        this.chat.voteForPlayer(result);
      }
    });
  }

  public playerVoted(): boolean {
    if (this.afterSelectingCompanions) {
      if (this.players && this.players.length) {
        return this.players.find(x => x.userName === UserGlobal.userName).hasVoted;
      }
    }

    return true;
  }
}
