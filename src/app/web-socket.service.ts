import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import { environment } from '../environments/environment';
import { SocketMessage } from './Models/SocketMessage';
import { MessageType } from '../common/constants/Enums/MessageType';
import { UserGlobal } from './user-global.model';

@Injectable()
export class WebSocketService {

  private socket;

  constructor() {
    console.log('WebSocket Service constructor');
  }

  connect(): Rx.Subject<MessageEvent> {
    console.log('WebSocket Service connect method run');
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
    this.socket = io(environment.ws_url);
    console.log(this.socket);
    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    const observable = new Observable(observer => {
      this.socket.on(MessageType.SET_USERNAME, (data) => {
        console.log('Received message from Websocket Server');
        observer.next(data);
      });

        this.socket.on(MessageType.INCOMING_MESSAGE, (data) => {
          console.log('Received message from Websocket Server');
          observer.next(data);
        });

        this.socket.on(MessageType.AVAILABLE_ROOMS, (data) => {
          console.log('Receiving rooms');
          observer.next(data);
        });

        this.socket.on(MessageType.PLAYERS_IN_ROOM, (data) => {
          console.log('Receiving players in room');
          observer.next(data);
        });

        this.socket.on(MessageType.WAITING_ROOM_PLAYER_UPDATE, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.JOIN_ROOM, (data) => {
          console.log('New Player Joined the room');
          observer.next(data);
        });

        this.socket.on(MessageType.LEAVE_ROOM, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.GAME_START, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.CREATE_ROOM, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.INIT_GAME, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.PLAYER_MISSION_CHANGE, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.GET_GAME_DETAILS, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.START_VOTING, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTE_FOR_TEAM, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTE_MISSION, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.RESET_MISSION, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.END_GAME, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.MISSION_VOTES_RESULT, (data) => {
          observer.next(data);
        });

        return () => {

        };
    });

    const observer = {
        next: (data: SocketMessage) => {
          console.log('socket used');
          console.log(this.socket);
          if (data) {
            switch (data.MessageType) {
              case MessageType.CREATE_ROOM: {
                this.socket.emit(MessageType.CREATE_ROOM, JSON.stringify(data.Content));
                break;
              }

              case MessageType.INCOMING_MESSAGE: {
                this.socket.emit(MessageType.INCOMING_MESSAGE,
                  JSON.stringify({ clientId: this.socket.id, content: data, userName: UserGlobal.userName}));
                this.socket.userName = data;
                break;
              }

              case MessageType.AVAILABLE_ROOMS: {
                this.socket.emit(MessageType.AVAILABLE_ROOMS);
                break;
              }
              case MessageType.JOIN_ROOM: {
                this.socket.emit(MessageType.JOIN_ROOM, JSON.stringify(data.Content));
                break;
              }
              case MessageType.SET_USERNAME: {
                this.socket.emit(MessageType.SET_USERNAME, data.Content);
                break;
              }

              case MessageType.PLAYERS_IN_ROOM: {
                this.socket.emit(MessageType.PLAYERS_IN_ROOM, JSON.stringify(data.Content));
                break;
              }

              case MessageType.LEAVE_ROOM: {
                this.socket.emit(MessageType.LEAVE_ROOM, JSON.stringify(data.Content));
                break;
              }

              case MessageType.WAITING_ROOM_PLAYER_UPDATE: {
                this.socket.emit(MessageType.WAITING_ROOM_PLAYER_UPDATE, JSON.stringify(data.Content));
                break;
              }

              case MessageType.PLAYER_UPDATE: {
                this.socket.emit(MessageType.PLAYER_UPDATE, JSON.stringify(data.Content));
                break;
              }
              case MessageType.GAME_START: {
                this.socket.emit(MessageType.GAME_START, '');
                break;
              }
              case MessageType.INIT_GAME: {
                this.socket.emit(MessageType.INIT_GAME, JSON.stringify(data.Content));
                break;
              }
              case MessageType.PLAYER_MISSION_CHANGE: {
                this.socket.emit(MessageType.PLAYER_MISSION_CHANGE, JSON.stringify(data.Content));
                break;
              }
              case MessageType.GET_GAME_DETAILS: {
                this.socket.emit(MessageType.GET_GAME_DETAILS, JSON.stringify(data.Content));
                break;
              }
              case MessageType.START_VOTING: {
                this.socket.emit(MessageType.START_VOTING, JSON.stringify(data.Content));
                break;
              }

              case MessageType.VOTE_FOR_TEAM: {
                this.socket.emit(MessageType.VOTE_FOR_TEAM, JSON.stringify(data.Content));
                break;
              }

              case MessageType.VOTE_MISSION: {
                this.socket.emit(MessageType.VOTE_MISSION, JSON.stringify(data.Content));
                break;
              }
            }

          }
        },
        error: (errorMsg) => {
          console.log(errorMsg);
          this.socket.disconnect();
        },
        complete: (data) => {
          this.socket.disconnect();
        }
    };

    // this.socket.on('connect', function () {
    //   alert('connect');
    // });
    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(observer, observable);
  }
}
