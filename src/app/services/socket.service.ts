import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs/Rx';

import { SocketMessage } from '../models/communication';
import { MessageType } from '../enums';
import { GameRoomCreateRequest, InitGameRequestModel, JoinRoomRequestModel, LeaveRoomRequestModel, PlayerPlannedOnMissionRequestModel, StartVotingRequestModel, TeamVoteRequestModel, UserValidRequest, VoteMissionRequestModel, WaitingRomPlayerUpdateRequest } from '../models/requests';
import { GameRoom, Player } from '../models/game';
import { UserGlobal } from '../globals';

@Injectable()
export class SocketService {

  public messages: Subject<any>;
 
  constructor(wsService: WebSocketService) {
    this.messages = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });
   }

  public validateUserName(userName: string): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.VALIDATE_USERNAME;
    socketMessage.Content = userName;
    this.messages.next(socketMessage);
  }

  public setUserName(userName: string): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.SET_USERNAME;
    let request =  new UserValidRequest();
    request.userName = userName;
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public sendMsg(msg): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.INCOMING_MESSAGE;
    socketMessage.Content = msg;
    this.messages.next(socketMessage);
  }

  public sendRequestForRooms(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.AVAILABLE_ROOMS;
    this.messages.next(socketMessage);
  }

  public sendRequestForPlayersInRooms(roomId: string): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.PLAYERS_IN_ROOM;
    socketMessage.Content = roomId;
    this.messages.next(socketMessage);
  }

  public createNewRoom(room: GameRoom): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.CREATE_ROOM;
    let request = new GameRoomCreateRequest();
    request.gameRoom = room;
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public joinRoom(roomName: string): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.JOIN_ROOM;
    let request: JoinRoomRequestModel = {
      roomId: roomName
    };
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public leaveRoom(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.LEAVE_ROOM;
    let request: LeaveRoomRequestModel = {
      roomId: UserGlobal.room.name
    };
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public sendWaitingRoomPlayerUpdate(isReady: boolean): void {
    const socketMessage = new SocketMessage();
    let request: WaitingRomPlayerUpdateRequest = {
      userName: UserGlobal.userName,
      roomId: UserGlobal.room.name,
      ready: isReady
    }
    socketMessage.MessageType = MessageType.WAITING_ROOM_PLAYER_UPDATE;
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public startGame(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.GAME_START;
    this.messages.next(socketMessage);
  }

  public initGame(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.INIT_GAME;
    let request: InitGameRequestModel = {
      roomId: UserGlobal.room.name
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public onMissionApplyUpdate(player: Player): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.PLAYER_MISSION_CHANGE;

    let request: PlayerPlannedOnMissionRequestModel = {
      player: player
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public getGameDetails(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.GET_GAME_DETAILS;
    this.messages.next(socketMessage);
  }

  public getGameSummary(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.END_GAME_SUMMARY;
    let request: InitGameRequestModel = {
      roomId: UserGlobal.room.name
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public startVoting(players: Player[]): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.START_VOTING;
    let request: StartVotingRequestModel = {
      players: players,
      roomId: UserGlobal.room.name
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }
  
  public voteForPlayer(voteFor: boolean): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.VOTE_FOR_TEAM;
    let request: TeamVoteRequestModel = {
      roomId: UserGlobal.room.name,
      voteValue: voteFor
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }

  public voteForMission(voteFor: boolean): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.VOTE_MISSION;
    let request: VoteMissionRequestModel = {
      missionSuccessVote: voteFor
    }
    socketMessage.Content = request;
    this.messages.next(socketMessage);
  }
}
