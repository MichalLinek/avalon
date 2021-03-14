import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs/Rx';
import { SocketMessage } from './Models/SocketMessage';
import { MessageType } from '../common/constants/Enums/MessageType';
import { GameRoom } from '../common/models/game-room.model';
import { GameRoomCreateRequest, InitGameRequestModel, JoinRoomRequestModel, LeaveRoomRequestModel, UserValidRequest, WaitingRomPlayerUpdateRequest } from '../common/requests';
import { UserGlobal } from './user-global.model';
import { Player } from '../server/models/player.model';

@Injectable()
export class ChatService {

  public messages: Subject<any>;
 
  constructor(private wsService: WebSocketService) {
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

  public setUserName(userName): void {
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

  public onMissionApplyUpdate(userName: string, isOnMission: boolean): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.PLAYER_MISSION_CHANGE;
    socketMessage.Content = { userName : userName, onMission : isOnMission};
    this.messages.next(socketMessage);
  }

  public getGameDetails(): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.GET_GAME_DETAILS;
    this.messages.next(socketMessage);
  }

  public startVoting(playerNames: Array<string>): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.START_VOTING;
    socketMessage.Content = playerNames;
    this.messages.next(socketMessage);
  }
  
  public voteForPlayer(voteFor: boolean): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.VOTE_FOR_TEAM;
    socketMessage.Content = { userName: UserGlobal.userName, voteFor: voteFor };
    this.messages.next(socketMessage);
  }

  public voteForMission(voteFor: boolean): void {
    const socketMessage = new SocketMessage();
    socketMessage.MessageType = MessageType.VOTE_MISSION;
    socketMessage.Content = { userName: UserGlobal.userName, voteFor: voteFor };
    this.messages.next(socketMessage);
  }
}
