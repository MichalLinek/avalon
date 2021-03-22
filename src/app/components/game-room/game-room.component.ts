import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { MatDialog } from '@angular/material';
import { CharacterCard, Mission, Player } from '../../models/game';
import { NotificationService, SocketService } from '../../services';
import { AlignmentType, MessageType, NavigationPaths } from '../../enums';
import { UserGlobal } from '../../globals';
import { CompanionVoteDialog, MissionVoteDialog, ViewCardDialog } from '../../dialog-components';
import { InitGameResponse, MissionVotesResultResponse, PlayerPlannedOnMissionResponse, StartVotingResponse, TeamVoteRequestResponse, VotingFailResponse } from '../../models/responses';


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
  public votingActive: boolean;
  public afterSelectingCompanions: boolean;
  public currentMission: number;
  public IsVoteButtonActive: boolean;
  public playersOnTheMission: Player[] = [];

  private subscription: ISubscription;

  constructor(private chat: SocketService, 
              private router: Router,
              public dialog: MatDialog,
              private notificationService: NotificationService) { }

  public ngOnInit(): void {
    this.subscription = this.chat.messages.subscribe(msg => {
      if (msg.type === MessageType.INIT_GAME) {
        let data = msg as InitGameResponse;
        this.characterCard = data.characterCard;
        this.players = data.players;
        this.currentMission = 0;
      } else if (msg.type === MessageType.PLAYER_MISSION_CHANGE) {
        let data = msg as PlayerPlannedOnMissionResponse;
        let player = this.players.find(x => x.socketId === data.player.socketId);
        player.isGoingOnAMission = data.player.isGoingOnAMission;
      } else if (msg.type === MessageType.START_VOTING) {
        let data = msg as StartVotingResponse;
        this.playersOnTheMission = data.players;
        this.openCompanionVoteDialog();
        this.afterSelectingCompanions = true;
      } else if (msg.type === MessageType.VOTE_FOR_TEAM) {
        let data = msg as  TeamVoteRequestResponse;
        const player = this.players.find(x => x.socketId === data.player.socketId);
        player.hasVoted = true;
        player.voteValue = data.player.voteValue;
      } else if (msg.type === MessageType.VOTING_SUCCESS) {
        const mePlayer = this.getPlayer();
        if (mePlayer.isGoingOnAMission) {
          this.openMissionVoteDialog();
        }
        this.IsVoteButtonActive = false;
        this.notificationService.emitChange('Players agreed on the team');
      } else if (msg.type === 'voteMission') {
        const mePlayer = this.getPlayer();
        if (mePlayer.isGoingOnAMission) {
          this.openMissionVoteDialog();
        }
      } else if (msg.type === MessageType.VOTING_FAILED) {
        let data = msg as VotingFailResponse;
        this.notificationService.emitChange('Players disagree on the team');
        let players = data.players;
        for (let i = 0 ; i < players.length; i++) {
          let pl = this.players.find(x => x.socketId === players[i].socketId);
          if (pl) {
            pl.isLeader = players[i].isLeader;
            pl.hasVoted = players[i].hasVoted;
            pl.voteValue = players[i].voteValue;
            pl.isGoingOnAMission = false;
          }
        }
        this.afterSelectingCompanions = false;
        this.IsVoteButtonActive = false;
      } else if (msg.type === MessageType.END_GAME) {
          UserGlobal.win = this.characterCard.alignment === AlignmentType.Good && !msg.evilWin;
          this.router.navigate([NavigationPaths.endGame]);
      } else if (msg.type === MessageType.MISSION_VOTES_RESULT) {
        let data = msg as MissionVotesResultResponse;
        this.missions[this.currentMission].isSuccess = data.lastMission.isSuccess;
        if (data.lastMission.isSuccess) {
          this.notificationService.emitChange('Mission successful');
        }
        else {
          this.notificationService.emitChange('Mission failed');
        }
        this.currentMission += 1;
        let players = data.players;
        for (let i = 0 ; i < players.length; i++) {
          let pl = this.players.find(x => x.socketId === players[i].socketId);
          if (pl) {
            pl.isLeader = players[i].isLeader;
            pl.hasVoted = players[i].hasVoted;
            pl.voteValue = players[i].voteValue;
            pl.isGoingOnAMission = false;
          }
        }
        this.afterSelectingCompanions = false;
        this.IsVoteButtonActive = false;
      } else {
        console.error('What kind of message is that ?');
        console.error(msg);
      }
    }), (error) => {};

    this.chat.initGame();
  }

  public readyClicked($event, player: Player): void {
    const isPlayerOnMission = $event.checked;
    player.isGoingOnAMission = isPlayerOnMission;
    this.IsVoteButtonActive = this.players.filter(x => x.isGoingOnAMission).length == this.missions[this.currentMission].numberOfCompanions;
    this.chat.onMissionApplyUpdate(player);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public checkboxEnabled(player: Player): boolean {
    if (!this.afterSelectingCompanions) {
      if (this.players && this.players.length > 0) {
        const mePlayer = this.getPlayer();
        const partyMembers = this.players.filter(x => x.isGoingOnAMission);
        return mePlayer.isLeader && (partyMembers.indexOf(player) > -1 || partyMembers.length < this.missions[this.currentMission].numberOfCompanions);
      }
    }
    
    return false;
  }

  public isPlayerALeader() {
    let pl = this.getPlayer();
    return pl?.isLeader;
  }

  private getPlayer(): Player {
    const userName = UserGlobal.userName;
    return this.players.find(x => x.userName  === userName); 
  }

  public confirmTeam(): void {
    let players = this.players.filter(x => x.isGoingOnAMission);
    this.chat.startVoting(players);
  }

  public openMissionVoteDialog(): void {
    const dialogRef = this.dialog.open(MissionVoteDialog, {
      width: '400px',
      data: {
        character : this.characterCard
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.chat.voteForMission(result);
      }
    });
  }

  public openViewCardDialog(): void {
    this.dialog.open(ViewCardDialog, {
      width: '400px',
      data: {
        characterCard : this.characterCard
      }
    });
  }

  public openCompanionVoteDialog(): void {
    const dialogRef = this.dialog.open(CompanionVoteDialog, {
      width: '400px',
      data: { 
        players: this.playersOnTheMission
      }
    });

    dialogRef.afterClosed().subscribe(result => {
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
