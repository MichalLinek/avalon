import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs/Rx';
import { MessageType } from '../enums';
import { SocketMessage } from '../models/communication';

@Injectable()
export class WebSocketService {

  private socket;

  constructor() {
  }

  public connect(): Subject<MessageEvent> {
    this.socket = io(environment.ws_url);
    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    const observable = new Observable(observer => {
      this.socket.on(MessageType.SET_USERNAME, (data) => {
        observer.next(data);
      });

        this.socket.on(MessageType.INCOMING_MESSAGE, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.AVAILABLE_ROOMS, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.PLAYERS_IN_ROOM, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.WAITING_ROOM_PLAYER_UPDATE, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.JOIN_ROOM, (data) => {
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

        this.socket.on(MessageType.VOTE_MISSION, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.START_VOTING, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTE_FOR_TEAM, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTE_COMPLETED, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTING_SUCCESS, (data) => {
          observer.next(data);
        });

        this.socket.on(MessageType.VOTING_FAILED, (data) => {
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
          if (data) {
            this.socket.emit(data.MessageType, JSON.stringify(data.Content));
          }
        },
        error: (errorMsg) => {
          this.socket.disconnect();
        },
        complete: (data) => {
          this.socket.disconnect();
        }
    };

    return Subject.create(observer, observable);
  }
}
