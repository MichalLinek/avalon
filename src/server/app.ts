import { Room, Socket } from 'socket.io';
import { Game } from './game';
import { Player } from './models/player.model';
import { GameRoom } from '../common/models/game-room.model';
import { MessageType } from '../common/constants/Enums/MessageType';
import { GameRoomCreateRequest, InitGameRequestModel, JoinRoomRequestModel, LeaveRoomRequestModel, PlayerPlannedOnMissionRequestModel, StartVotingRequestModel, TeamVoteRequestModel, UserValidRequest, VoteMissionRequestModel, WaitingRomPlayerUpdateRequest } from '../common/requests';
import { 
    PlayersInRoomResponse,
    UserValidResponse,
    GameDetailsResponse,
    GameRoomCreateResponse,
    JoinRoomResponse,
    GameStartResponse,
    InitGameResponse,
    AvailableRoomsResponse,
    StartVotingResponse,
    PlayerPlannedOnMissionResponse,
    TeamVoteRequestResponse,
    VotingSuccessResponse,
    VotingFailResponse,
    AllMissionsCompletedResponse,
    MissionVotesResultResponse
 } from "../common/responses";
import { request } from 'http';
import { MissionResultType } from '../common/constants/Enums/MissionResultType';

let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

var dir = path.join(__dirname, '/images');
app.use('/images', express.static(dir));

export class Server { 
    private rooms = new Map<string, GameRoom>();
    private activeUsers = new Map<string, Player>();
    private nickNames = new Set();
    private roomPrefix = 'ROOM_';

    private getPlayerFromSocketId(socketId: string): Player | undefined {
        if (!this.activeUsers.has(socketId)) {
            return;
        }
        return this.activeUsers.get(socketId);
    }

    private getPlayersRoomId(socketId?: string): string | null {
        if (socketId == null) return null;
        let player = this.getPlayerFromSocketId(socketId);
        if (player && player.roomId && this.rooms.has(player.roomId)) {
            return player.roomId;
        }
        return null;
    }

    constructor() {
        io.on('reconnection', (socket: Socket) => {
            console.log('some reconnection performed');
        });

        io.on('connection', (socket: Socket) => {
            console.log('user connected');

            socket.on('disconnect', () =>  {
                let roomId = null;
                if (this.activeUsers.has(socket.id)) {
                    let user = this.activeUsers.get(socket.id);
                    roomId = this.getPlayersRoomId(socket.id);
                    this.activeUsers.delete(socket.id);
                    this.nickNames.delete(user!.userName.toLocaleLowerCase());
                } 
                console.log('user disconnected');

                
                if (roomId) {
                    this.playerInRoomsChanged(roomId);
                }
            });

            socket.on('reconnect', () => {
                console.log('reconnect fired');
            });

            socket.on(MessageType.AVAILABLE_ROOMS, () => {
                let rooms= [];
                console.log('sending available rooms');
                for(var roomName in io.sockets.adapter.rooms) {
                    if ((roomName.indexOf(this.roomPrefix) > -1)) {
                        let room = this.rooms.get(roomName);
                        if (!room.isStarted) {
                            let roomWithoutPrefix = roomName.replace(this.roomPrefix, "");
                            rooms.push(roomWithoutPrefix);
                        }
                    }
                }

                let response: AvailableRoomsResponse = {
                    type: MessageType.AVAILABLE_ROOMS,
                    roomIds: rooms
                }

                socket.emit(MessageType.AVAILABLE_ROOMS, response);
            });

            socket.on('message', (message) => {
                // let parsedMsg = JSON.parse(message);
                // let msg = parsedMsg.clientId + ' ' + parsedMsg.content;
                // socket["userName"] = parsedMsg.userName;
                // io.emit('message', msg);    
            });

            socket.on(MessageType.GET_GAME_DETAILS, () => {
                console.log('write output');
                let characters = Game.getSpecialCharacters();
                let campaigns = Game.getDefaultCampaigns();

                let response: GameDetailsResponse = {
                    defaultCampaigns: campaigns,
                    specialCharacters: characters,
                    type: MessageType.GET_GAME_DETAILS
                }
                socket.emit(MessageType.GET_GAME_DETAILS, response);
            });

            socket.on(MessageType.CREATE_ROOM, (request: string) => {
                console.log(request);
                let parsedRequest: GameRoomCreateRequest = JSON.parse(request);
                const roomId = this.roomPrefix + parsedRequest.gameRoom.name;
                let response: GameRoomCreateResponse = {
                    isRoomCreated: true,
                    type: MessageType.CREATE_ROOM
                }
                if (this.rooms.has(roomId)) {
                    response.isRoomCreated = false;
                }
                else {
                    this.rooms.set(roomId, parsedRequest.gameRoom);
                    let player = this.getPlayerFromSocketId(socket.id);
                    player!.roomId = roomId;
                    socket.join(roomId);
                }

                socket.emit(MessageType.CREATE_ROOM, response);
            });

            socket.on(MessageType.SET_USERNAME, (request: UserValidRequest) => {
                console.log(request);
                let uName = request.userName.toLowerCase();
                const valid = this.validateUser(uName);
                
                if (valid) {
                    this.nickNames.add(uName);
                    if (this.activeUsers.has(socket.id)) {
                        let player = this.activeUsers.get(socket.id);
                        this.nickNames.delete(player!.userName.toLowerCase());
                        player!.userName = request.userName;
                    }
                    else {
                        this.activeUsers.set(socket.id, new Player(socket.id, request.userName));
                    }
                }
                console.log(this.activeUsers);
                console.log(this.nickNames);
                console.log(socket.id);
                const response: UserValidResponse = { type: MessageType.SET_USERNAME, isUserValid : valid }
                socket.emit(MessageType.SET_USERNAME, response);
            });

            socket.on(MessageType.JOIN_ROOM, (request: string) => {
                let data: JoinRoomRequestModel = JSON.parse(request);
                let roomNameWithPrefix = this.roomPrefix + data.roomId;
                socket.join(roomNameWithPrefix);
                let player = this.getPlayerFromSocketId(socket.id);
                player!.roomId = roomNameWithPrefix;
                let response: JoinRoomResponse = {
                    gameRoom: this.rooms.get(roomNameWithPrefix),
                    type: MessageType.JOIN_ROOM
                }
                socket.emit(MessageType.JOIN_ROOM, response);
            });

            socket.on(MessageType.LEAVE_ROOM, (request: string) => {
                let data: LeaveRoomRequestModel = JSON.parse(request);
                let roomNameWithPrefix = this.roomPrefix + data.roomId;
                socket.leave(roomNameWithPrefix);
                let player = this.getPlayerFromSocketId(socket.id);
                player!.roomId = null;
                this.playerInRoomsChanged(roomNameWithPrefix);
            });

            socket.on(MessageType.GAME_START, (data) => {
                let player = this.getPlayerFromSocketId(socket.id);
                if (!player) return;
                let room = player.roomId;
                let response: GameStartResponse = {
                    type: MessageType.GAME_START
                }
                io.sockets.in(room).emit(MessageType.GAME_START, response);
                this.initGame(room);
            });

            // socket.on('playerUpdate', (data) => {
            //     let player = JSON.parse(data);
            //     let roomWithPrefix = this.roomPrefix + player.Room;
            //     let sockets = this.getUsersInRoom(roomWithPrefix);
            //     let foundSocket = sockets.filter(x => x.userName === player.Name)[0];
                
            //     if (foundSocket) {
            //         foundSocket.ready = player.ready;
            //         let updatedPlayers = [];
            //         for(let i = 0 ; i < sockets.length; i ++ ) {
            //             updatedPlayers.push(
            //             {
            //                 Name : sockets[i].userName,
            //                 Ready : sockets[i].ready
            //             });
            //         }

            //         let room = io.sockets.adapter.rooms[roomWithPrefix];
            //         if (room) {
            //             let socketsLimit = room["GameOptions"].playersLimit;
            //             let maxLimitOfPlayers = room["GameOptions"].numberOfGood + room["GameOptions"].numberOfEvil + room["GameOptions"].specialCharacters.length;
            //             let data = { players: updatedPlayers, availablePlayers: sockets.length, maxLimit: maxLimitOfPlayers};
            //             io.sockets.in(roomWithPrefix).emit('playersInRoom', data);
            //         }
            //     }
            // });

            socket.on(MessageType.WAITING_ROOM_PLAYER_UPDATE, (request) => {
                let data: WaitingRomPlayerUpdateRequest = JSON.parse(request);
                let roomWithPrefix = this.roomPrefix + data.roomId;
                let player = this.getPlayerFromSocketId(socket.id);
                if (!player) return;

                player.ready = data.ready;
                this.playerInRoomsChanged(roomWithPrefix);
            });

            socket.on(MessageType.PLAYERS_IN_ROOM, (room) => {
                let roomNameWithPrefix = this.roomPrefix + JSON.parse(room);
                this.playerInRoomsChanged(roomNameWithPrefix);
            });

             socket.on(MessageType.INIT_GAME, (request: string) => {
                let requestData: InitGameRequestModel = JSON.parse(request);
                let roomWithPrefix = this.roomPrefix + requestData.roomId;

                let sockets = this.getUsersInRoom(roomWithPrefix);
                let players: Player[] = [];

                for (let i = 0; i < sockets.length; i ++) {
                    players.push(this.getPlayerFromSocketId(sockets[i].id));
                }

                let player = this.getPlayerFromSocketId(socket.id);

                let data: InitGameResponse = {
                    type: MessageType.INIT_GAME,
                    characterCard: player.characterCard,
                    players: players
                }

                socket.emit(MessageType.INIT_GAME, data);
            });

            socket.on(MessageType.PLAYER_MISSION_CHANGE, (request: string) => {
                let requestData: PlayerPlannedOnMissionRequestModel = JSON.parse(request);
                let socketId = requestData.player.socketId;
                if (!socketId) return;

                let player = this.activeUsers.get(socketId);
                player.isGoingOnAMission = requestData.player.isGoingOnAMission;

                let response: PlayerPlannedOnMissionResponse = {
                    type: MessageType.PLAYER_MISSION_CHANGE,
                    player: player
                }
                io.sockets.in(player.roomId).emit(MessageType.PLAYER_MISSION_CHANGE, response);
            });

            socket.on(MessageType.VOTE_FOR_TEAM, (request: string) => {
                console.log('voteForTeam Start');
                let data: TeamVoteRequestModel = JSON.parse(request);
                if (!this.activeUsers.has(socket.id)) return;

                let player = this.getPlayerFromSocketId(socket.id);
                player.hasVoted = true;
                player.voteValue = data.voteValue;

                let roomWithPrefix = this.roomPrefix + data.roomId;
                let room = this.rooms.get(roomWithPrefix);
                
                let response: TeamVoteRequestResponse = {
                    type: MessageType.VOTE_FOR_TEAM,
                    player: player
                }
                io.sockets.in(roomWithPrefix).emit(MessageType.VOTE_FOR_TEAM, response);


                let users: Socket[] = this.getUsersInRoom(roomWithPrefix);
                let players: Player[] = [];
                for (let i = 0; i < users.length; i++ ) {
                    players.push(this.getPlayerFromSocketId(users[i].id))
                }
                let numberOfPlayersWhoVoted = players.filter(x => x.hasVoted);
                console.log('voted');
                console.log(numberOfPlayersWhoVoted.length);
                if (numberOfPlayersWhoVoted.length === users.length) {
                    let mission = room.campaign.missions[room.campaign.currentMission];
                    // Majority of accepts:
                    console.log('voting success');
                    let votedFor = numberOfPlayersWhoVoted.filter(x => x.voteValue);
                    let votedAgainst = numberOfPlayersWhoVoted.filter(x => !x.voteValue);
                    if (votedFor.length > votedAgainst.length) {
                        
                        let response: VotingSuccessResponse = {
                            type: MessageType.VOTING_SUCCESS
                        }

                        io.sockets.in(roomWithPrefix).emit(MessageType.VOTING_SUCCESS, response);
                    }
                    else {
                        // Majority didn't agree
                        console.log('voting Failed');
                        room.campaign.currentVotingFails += 1;
                        if (room.campaign.currentVotingFails === 5) {// TODO!!!
                            const outputData = { type: 'endGame', evilWin: true};
                            io.sockets.in(socket["roomName"]).emit('endGame', outputData);
                            return;
                        }
                        let leaderId = players.findIndex(x => x.isLeader);
                        players[leaderId].isLeader = false;

                        leaderId = (leaderId + 1) % players.length;
                        players[leaderId].isLeader = true;
                        console.log(players[leaderId].userName + ' is a leader');
                        for (let i = 0; i < players.length; i ++) {
                            players[i].hasVoted = false;
                            players[i].voteValue = null;
                        }

                        let response: VotingFailResponse = {
                            type: MessageType.VOTING_FAILED,
                            players: players
                        }
                        io.sockets.in(roomWithPrefix).emit(MessageType.VOTING_FAILED, response);
                    }
                }
            });

            socket.on(MessageType.VOTE_MISSION, (request: string) => {
                console.log('voteInMission Start');
                let data: VoteMissionRequestModel = JSON.parse(request);
                let player = this.getPlayerFromSocketId(socket.id);
                //let roomWithPrefix = this.roomPrefix + player.roomId;
                console.log('player room is ' + player.roomId);
                console.log(this.rooms.keys());
                let room = this.rooms.get(player.roomId);
                let mission = room.campaign.missions[room.campaign.currentMission];
                
                mission.currentVotes.push(data.missionSuccessVote ? MissionResultType.Success : MissionResultType.Fail);
                console.log('compare ' + mission.currentVotes.length + ' ' + mission.numberOfCompanions);
                if (mission.currentVotes.length === mission.numberOfCompanions) {
                    console.log('end of voting for mission');
                    let users: Socket[] = this.getUsersInRoom(player.roomId);
                    let players: Player[] = [];
                    for (let i = 0; i < users.length; i++ ) {
                        players.push(this.getPlayerFromSocketId(users[i].id))
                    }

                    let leaderId = players.findIndex(x => x.isLeader);
                    players[leaderId].isLeader = false;

                    leaderId = (leaderId + 1) % players.length;
                    players[leaderId].isLeader = true;
                    mission.isSuccess = mission.numberOfFailsToFailMission > mission.currentVotes.filter(x => x === MissionResultType.Fail).length;
                    room.campaign.currentMission += 1

                    for (let i = 0; i < players.length; i++ ) {
                        players[i].hasVoted = false;
                        players[i].voteValue = null;
                    }

                    let endGame = room.campaign.missions.length === room.campaign.currentMission;
                    console.log('end Game' + endGame);
                    if (endGame) {
                        console.log('Ending Game');
                        let evilWin = room.campaign.missions.filter(x => x.isSuccess).length < room.campaign.missions.filter(x => !x.isSuccess).length;
                        let response: AllMissionsCompletedResponse = {
                            type: MessageType.END_GAME,
                            goodWon: !evilWin
                        }
                        io.sockets.in(player.roomId).emit(MessageType.END_GAME, response);
                    }
                    else {
                        console.log("NOT ENDING GAME - " + room.campaign.currentMission);
                        let response: MissionVotesResultResponse = {
                            type: MessageType.MISSION_VOTES_RESULT,
                            lastMission: mission,
                            players: players
                        }
                        console.log('send mission results to room ' + player.roomId);
                        io.sockets.in(player.roomId).emit(MessageType.MISSION_VOTES_RESULT, response);
                    }
                }
            });

            socket.on(MessageType.START_VOTING, (request: string) => {
                console.log('started voting');
                let requestData: StartVotingRequestModel = JSON.parse(request);
                let roomWithPrefix = this.roomPrefix + requestData.roomId;
                if (this.rooms.has(roomWithPrefix)) {
                    let request: StartVotingResponse = {
                        type: MessageType.START_VOTING,
                        players: requestData.players
                    }
                    console.log(request);
                    io.sockets.in(roomWithPrefix).emit(MessageType.START_VOTING, request);
                }
            });
        }); 
    }

    public initGame(roomId: string): void {
        let sockets = this.getUsersInRoom(roomId);
        let players: Player[] = [];

        for (let i = 0; i < sockets.length; i ++) {
            players.push(this.getPlayerFromSocketId(sockets[i].id));
        }

        let gameRoom = this.rooms.get(roomId);
        gameRoom.isStarted = true;
        Game.attachCharactersToSockets(gameRoom.campaign, players);
        Game.addSpecialAbilitiesToCharacters(players);
        Game.setRandomPlayerAsLeader(players);
    }

    public validateUser(userName: string): boolean {
        return !this.nickNames.has(userName);
    }

    public getUsersInRoom(roomId: string): Socket[] {
        var outputlist: Socket[] = [];
        if (io.sockets.adapter.rooms[roomId]) {
            var clients_in_the_room = io.sockets.adapter.rooms[roomId].sockets; 
            for (var clientId in clients_in_the_room) {
                outputlist.push(io.sockets.connected[clientId]);
            }
        }
        return outputlist; 
    }

    public playerInRoomsChanged(roomId: string): void {
        let sockets = this.getUsersInRoom(roomId);
        let updatedPlayers: Player[] = [];
        if (!sockets || !sockets.length) return;

        for (let i = 0; i < sockets.length; i ++) {
            let player = this.getPlayerFromSocketId(sockets[i].id);    
            updatedPlayers.push(player);
        }

        let roomOptions = this.rooms.get(roomId);
        if (roomOptions) {
            let response: PlayersInRoomResponse = {
                players: updatedPlayers,
                type: MessageType.PLAYERS_IN_ROOM
            }
            io.sockets.in(roomId).emit(MessageType.PLAYERS_IN_ROOM, response);
        }
    }

    // public initGame(roomId: string) {
    //     let sockets = this.getUsersInRoom(roomId);
    //     let updatedPlayers = [];

    //     for(let i = 0 ; i < sockets.length; i ++ ) {
    //         updatedPlayers.push(
    //         {
    //             Name : sockets[i]["userName"],
    //             Ready : false,
    //             IsLeader : false,
    //             IsGoingOnAMission : false
    //         });
    //     }
    //     let randomPlayer = Math.floor(Math.random() * updatedPlayers.length);
    //     var pl = updatedPlayers[randomPlayer]
    //     if (pl) {
    //         pl.IsLeader = true;
    //     }

        //let foundRoom = io.sockets.adapter.rooms[room];
        
        // let mission = foundRoom["GameOptions"].Campaign.Missions[foundRoom["GameOptions"].MissionId];
        // foundRoom["GameOptions"].Campaign.Players = updatedPlayers;
        // mission.VotingFailed = 0;
        // mission.Votes = [];
        // mission.SuccessFailureVote = [];
        // let data = { type : 'initGame', players: updatedPlayers, mission : mission, campaign: foundRoom["GameOptions"].Campaign };
       // io.sockets.in(room).emit('initGame', data);
    // }

    public getSocketByUserName(userName) {
        var clients = io.sockets.clients; 
        for (var client in clients) {
            if (client["userName"] === userName) {
                return client;
            }
        }
    }

}


new Server();
http.listen(5000, () => {
    console.log('started on port 5000');
});