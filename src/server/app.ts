import { Room, Socket } from 'socket.io';
import { Game } from './game';
import { Player } from './models/player.model';
import { GameRoom } from '../common/models/game-room.model';
import { MessageType } from '../common/constants/Enums/MessageType';
import { GameRoomCreateRequest, InitGameRequestModel, JoinRoomRequestModel, LeaveRoomRequestModel, UserValidRequest, WaitingRomPlayerUpdateRequest } from '../common/requests';
import { 
    PlayersInRoomResponse,
    UserValidResponse,
    GameDetailsResponse,
    GameRoomCreateResponse,
    JoinRoomResponse,
    GameStartResponse,
    InitGameResponse
 } from "../common/responses";

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

            socket.on('availableRooms', () => {
                let rooms= [];
                console.log('sending available rooms');
                for(var roomName in io.sockets.adapter.rooms) {
                    if (roomName.indexOf(this.roomPrefix) > -1) {
                        rooms.push(roomName);
                    }
                }
                socket.emit('availableRooms', rooms);
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

            socket.on('missionChanged', (playerMission) => {
                
                if (socket["roomName"]) {
                    let parsedPlayerMission = JSON.parse(playerMission);
                    let roomName = socket["roomName"];
                    let data = parsedPlayerMission;
                    data.type = "missionChanged";
                    io.sockets.in(roomName).emit('missionChanged', data);
                }
            });

            

            socket.on('voteForTeam', (data) => {
                console.log('voteForTeam Start');
                const voteData = JSON.parse(data);
                const voteOwner = voteData.userName;
                const voteValue = voteData.voteFor;
                let room = io.sockets.adapter.rooms[socket["roomName"]];
                
                let mission = room["GameOptions"].Campaign.Missions[room["GameOptions"].MissionId];
                
                if (mission.Votes.indexOf(x => x.user === -1)) {
                    mission.Votes.push({user:voteOwner, voteValue: voteValue});
                }
                else {
                    mission.Votes[voteOwner] = voteValue;
                    //UPDATE vote...
                    //mission.Votes
                }
                

                let outputData = { type: 'voteForTeam', voteOwner : voteOwner, voteValue: voteValue};
                io.sockets.in(socket["roomName"]).emit('voteForTeam', outputData);

                if (mission.Votes.length === room["GameOptions"].Campaign.NumberOfPlayers) {
                    // Majority of accepts:
                    if (mission.Votes.filter(x => x.voteValue) > mission.Votes.filter(x => !x.voteValue)) {
                        console.log('enough votes ! Let\'s go');
                        let team = room["Team"];
                        let players = this.getUsersInRoom(socket["roomName"]);
                        let sockets = players.filter(x => team.indexOf(x["userName"]) > -1);
                        // room.GameOptions.MissionId ++;
                        // let mission = room.GameOptions.Campaign.Missions[room.GameOptions.MissionId];
                        // const campaign = room.GameOptions.Campaign;
                        // let previousLeader = campaign.Players.find(x => x.IsLeader);
                        // previousLeader.IsLeader = false;
                        // let leaderId = campaign.Players.indexOf(previousLeader);
                        // leaderId++;
                        // if (!campaign.Players[leaderId]) {
                        //     campaign.Players[0].IsLeader = true;
                        // }
                        // else {
                        //     campaign.Players[leaderId].IsLeader = true;
                        // }
                        //outputData = { type : 'resetMission', players: campaign.Players, mission : mission };
                        for (let i = 0 ; i < sockets.length; i++) {
                            //sockets[i].emit('voteMission', { type: 'voteMission' });
                        }
                        mission.Votes = [];
                        mission.SuccessFailureVote = [];
                    }
                    else {
                        console.log('not enough votes');
                        const campaign = room["GameOptions"].Campaign;
                        let previousLeader = campaign.Players.find(x => x.IsLeader);
                        previousLeader.IsLeader = false;
                        let leaderId = campaign.Players.indexOf(previousLeader);
                        leaderId++;
                        if (!campaign.Players[leaderId]) {
                            campaign.Players[0].IsLeader = true;
                        }
                        else {
                            campaign.Players[leaderId].IsLeader = true;
                        }
                        console.log(leaderId);
                        mission.VotingFailed ++;

                        if (mission.VotingFailed === 5) {
                            const outputData = { type: 'endGame', evilWin: true};
                            io.sockets.in(socket["roomName"]).emit('endGame', outputData);
                        }
                        mission.Votes = [];
                        mission.SuccessFailureVote = [];
                        const outputData = { type : 'resetMission', players: campaign.Players, mission : mission };
                        io.sockets.in(socket["roomName"]).emit('resetMission', outputData);
                    }
                }
            });

            socket.on('voteMission', (data) => {
                console.log('voteInMission Start');
                const voteData = JSON.parse(data);
                const voteOwner = voteData.userName;
                const voteValue = voteData.voteFor;
                let room = io.sockets.adapter.rooms[socket["roomName"]];
                let mission = room["GameOptions"].Campaign.Missions[room["GameOptions"].MissionId];
                
                if (mission.SuccessFailureVote.indexOf(x => x.user === -1)) {
                    mission.SuccessFailureVote.push({user: voteOwner, voteValue: voteValue});
                }
                else {
                    mission.SuccessFailureVote[voteOwner] = voteValue;
                    //UPDATE vote...
                    //mission.Votes
                }
                console.log(mission.SuccessFailureVote.length);
                console.log(mission.NumberOfCompanions);
                if (mission.SuccessFailureVote.length === mission.NumberOfCompanions) {
                    console.log('end of voting for mission');
                    const campaign = room["GameOptions"].Campaign;
                    let previousLeader = campaign.Players.find(x => x.IsLeader);
                    previousLeader.IsLeader = false;
                    let leaderId = campaign.Players.indexOf(previousLeader);
                    leaderId++;
                    if (!campaign.Players[leaderId]) {
                        campaign.Players[0].IsLeader = true;
                    }
                    else {
                        campaign.Players[leaderId].IsLeader = true;
                    }
                    room["GameOptions"].MissionId++;
                    
                    mission.Success = mission.SuccessFailureVote.filter(x => !x.voteValue).length < mission.NumberOfFailsToFailMission;
                    console.log("success : "+ mission.Success);
                    let endGame = room["GameOptions"].Campaign.Missions.length === room["GameOptions"].MissionId;
                    console.log('end Game' + endGame);
                    if (endGame) {
                        console.log('Ending Game');
                        let evilWin = campaign.Missions.filter(x => x.Success).length < campaign.Missions.filter(x => !x.Success.length);
                        let outputData = { type: 'endGame', evilWin : evilWin}
                        io.sockets.in(socket["roomName"]).emit('endGame', outputData);
                    }
                    else {
                        console.log("NOT ENDING GAME - " + room["GameOptions"].MissionId)
                        let nextMission = room["GameOptions"].Campaign.Missions[room["GameOptions"].MissionId];
                        nextMission.Votes = [];
                        nextMission.SuccessFailureVote = [];

                        if (!mission.Success) {
                            let outputData = { type: 'missionVotesResult', IsMissionASuccess : false, players: campaign.Players, mission: nextMission};
                            io.sockets.in(socket["roomName"]).emit('missionVotesResult', outputData);

                        } else {
                            let outputData = { type: 'missionVotesResult', IsMissionASuccess : true, players: campaign.Players, mission: nextMission};
                            io.sockets.in(socket["roomName"]).emit('missionVotesResult', outputData);
                        }
                    }
                }
            });

            socket.on('startVoting', (data) => {
                if (socket["roomName"]) {
                    let team = JSON.parse(data);
                    let room = io.sockets.adapter.rooms[socket["roomName"]];
                    room["Team"] = team;
                    io.sockets.in(socket["roomName"]).emit('startVoting', { type: 'startVoting'});
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