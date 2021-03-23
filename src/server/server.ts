import { MessageType, MissionResultType } from "../app/enums";
import { GameRoom, GameRoomAvailability, Player } from "../app/models/game";
import { GameRoomCreateRequest, InitGameRequestModel, JoinRoomRequestModel, LeaveRoomRequestModel, PlayerPlannedOnMissionRequestModel, StartVotingRequestModel, TeamVoteRequestModel, UserValidRequest, VoteMissionRequestModel, WaitingRomPlayerUpdateRequest } from "../app/models/requests";
import { AllMissionsCompletedResponse, AvailableRoomsResponse, GameDetailsResponse, GameRoomCreateResponse, GameStartResponse, InitGameResponse, JoinRoomResponse, MissionVotesResultResponse, PlayerPlannedOnMissionResponse, PlayersInRoomResponse, StartVotingResponse, TeamVoteRequestResponse, UserValidResponse, VotingFailResponse, VotingSuccessResponse } from "../app/models/responses";
import { Game } from "./game";
import { Socket } from 'socket.io';

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

    constructor(private io: any) {
        this.io.on('reconnection', (socket: Socket) => {
        });

        this.io.on('connection', (socket: Socket) => {

            socket.on('disconnect', () =>  {
                let roomId = null;
                if (this.activeUsers.has(socket.id)) {
                    let user = this.activeUsers.get(socket.id);
                    roomId = this.getPlayersRoomId(socket.id);
                    this.activeUsers.delete(socket.id);
                    this.nickNames.delete(user!.userName.toLocaleLowerCase());
                } 

                
                if (roomId) {
                    this.playerInRoomsChanged(roomId);
                }
            });

            socket.on('reconnect', () => {
            });

            socket.on(MessageType.AVAILABLE_ROOMS, () => {
                this.refreshRoomInfo(socket);
            });

            socket.on('message', (message) => {
                // let parsedMsg = JSON.parse(message);
                // let msg = parsedMsg.clientId + ' ' + parsedMsg.content;
                // socket["userName"] = parsedMsg.userName;
                // this.io.emit('message', msg);    
            });
            socket.on(MessageType.GET_GAME_DETAILS, () => {
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
                let player = this.getPlayerFromSocketId(socket.id);
                if (!player) return;
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
                    player.roomId = roomId;
                    socket.join(roomId);
                }

                this.refreshRoomInfo(null);
                socket.emit(MessageType.CREATE_ROOM, response);
            });

            socket.on(MessageType.SET_USERNAME, (data: string) => {
                let request: UserValidRequest = JSON.parse(data)
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
                this.refreshRoomInfo(null);
                socket.emit(MessageType.JOIN_ROOM, response);
            });

            socket.on(MessageType.LEAVE_ROOM, (request: string) => {
                let data: LeaveRoomRequestModel = JSON.parse(request);
                let roomNameWithPrefix = this.roomPrefix + data.roomId;
                socket.leave(roomNameWithPrefix);
                let player = this.getPlayerFromSocketId(socket.id);
                if (!player) return;
                player.roomId = null;
                player.ready = false;
                this.refreshRoomInfo(null);
                this.playerInRoomsChanged(roomNameWithPrefix);
            });

            socket.on(MessageType.GAME_START, (data) => {
                let player = this.getPlayerFromSocketId(socket.id);
                if (!player) return;
                let room = player.roomId;
                let response: GameStartResponse = {
                    type: MessageType.GAME_START
                }
                this.io.sockets.in(room).emit(MessageType.GAME_START, response);
                this.initGame(room);
            });

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
                this.io.sockets.in(player.roomId).emit(MessageType.PLAYER_MISSION_CHANGE, response);
            });

            socket.on(MessageType.VOTE_FOR_TEAM, (request: string) => {
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
                this.io.sockets.in(roomWithPrefix).emit(MessageType.VOTE_FOR_TEAM, response);


                let users: Socket[] = this.getUsersInRoom(roomWithPrefix);
                let players: Player[] = [];
                for (let i = 0; i < users.length; i++ ) {
                    players.push(this.getPlayerFromSocketId(users[i].id))
                }
                let numberOfPlayersWhoVoted = players.filter(x => x.hasVoted);
                if (numberOfPlayersWhoVoted.length === users.length) {
                    let mission = room.campaign.missions[room.campaign.currentMission];
                    // Majority of accepts:
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
                let data: VoteMissionRequestModel = JSON.parse(request);
                let player = this.getPlayerFromSocketId(socket.id);
                let room = this.rooms.get(player.roomId);
                let mission = room.campaign.missions[room.campaign.currentMission];
                
                mission.currentVotes.push(data.missionSuccessVote ? MissionResultType.Success : MissionResultType.Fail);
                if (mission.currentVotes.length === mission.numberOfCompanions) {
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
                    if (endGame) {
                        let evilWin = room.campaign.missions.filter(x => x.isSuccess).length < room.campaign.missions.filter(x => !x.isSuccess).length;
                        let response: AllMissionsCompletedResponse = {
                            type: MessageType.END_GAME,
                            goodWon: evilWin
                        }
                        io.sockets.in(player.roomId).emit(MessageType.END_GAME, response);
                    }
                    else {
                        let response: MissionVotesResultResponse = {
                            type: MessageType.MISSION_VOTES_RESULT,
                            lastMission: mission,
                            players: players
                        }
                        io.sockets.in(player.roomId).emit(MessageType.MISSION_VOTES_RESULT, response);
                    }
                }
            });

            socket.on(MessageType.START_VOTING, (request: string) => {
                let requestData: StartVotingRequestModel = JSON.parse(request);
                let roomWithPrefix = this.roomPrefix + requestData.roomId;
                if (this.rooms.has(roomWithPrefix)) {
                    let request: StartVotingResponse = {
                        type: MessageType.START_VOTING,
                        players: requestData.players
                    }
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
        if (this.io.sockets.adapter.rooms[roomId]) {
            var clients_in_the_room = this.io.sockets.adapter.rooms[roomId].sockets; 
            for (var clientId in clients_in_the_room) {
                outputlist.push(this.io.sockets.connected[clientId]);
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
            this.io.sockets.in(roomId).emit(MessageType.PLAYERS_IN_ROOM, response);
        }
    }

    public getSocketByUserName(userName) {
        var clients = this.io.sockets.clients; 
        for (var client in clients) {
            if (client["userName"] === userName) {
                return client;
            }
        }
    }

    public refreshRoomInfo(socket: Socket) {
        var rooms: GameRoomAvailability[] = [];
        for (var roomName in this.io.sockets.adapter.rooms) {
            if ((roomName.indexOf(this.roomPrefix) > -1)) {
                let room = this.rooms.get(roomName);
                if (!room.isStarted && room.campaign.numberOfPlayers >= this.io.sockets.adapter.rooms[roomName].length) {
                    let roomWithoutPrefix = roomName.replace(this.roomPrefix, "");
                    
                    let gameRoomAvailability: GameRoomAvailability = {
                        current:  this.io.sockets.adapter.rooms[roomName].length,
                        total: room.campaign.numberOfPlayers,
                        roomId: roomWithoutPrefix
                    };
                    rooms.push(gameRoomAvailability);
                }
            }
        }

        let sendRoomsResponse: AvailableRoomsResponse = {
            type: MessageType.AVAILABLE_ROOMS,
            rooms: rooms
        }

        if (socket) {
            socket.emit(MessageType.AVAILABLE_ROOMS, sendRoomsResponse);
            return;
        }
        
        this.activeUsers.forEach((playerToInform) => {
            if (!playerToInform.roomId && this.io.sockets.sockets[playerToInform.socketId]) {
                let socketToInform = this.io.sockets.sockets[playerToInform.socketId];
                socketToInform.emit(MessageType.AVAILABLE_ROOMS, sendRoomsResponse);
            }
        });
    }
}
