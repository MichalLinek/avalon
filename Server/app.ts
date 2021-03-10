import  { Request, Response } from 'express';
import ioserver, { Socket } from 'socket.io';
import { Game } from './game';
import { UserValidResponse } from "./../Common/responses/user-valid-reponse.model";
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

var dir = path.join(__dirname, 'images');
app.use('/images', express.static(dir));

let rooms = [];
let activeUsers = new Set();
let roomPrefix = 'ROOM_';

export class Server { 
// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', (req, res) => res.sendfile('../AvalonClient/src/index.html'))

// http.listen(3000, () => console.log('Example app listening on port 3000!'))

// //Whenever someone connects this gets executed
// io.on('connection', function(socket) {
//     console.log('A user connected');
 
//     //Send a message after a timeout of 4seconds
//    setTimeout(function() {
//         socket.send('Sent a message 4seconds after connection!');
//     }, 4000);

//     //Whenever someone disconnects this piece of code executed
//     socket.on('disconnect', function () {
//        console.log('A user disconnected');
//     });
//  });




constructor() {
    io.on('reconnection', (socket: Socket) => {
        console.log('some reconnection performed');
    });

    io.on('connection', (socket: Socket) => {
        console.log('user connected');

        socket.on('disconnect', function() {
            activeUsers.delete(socket['userName']);
            console.log('user disconnected');

            if (socket["roomName"]) {
                console.log('do something with room');
                this.playerInRoomsChanged(socket["roomName"]);
            }
        });

        socket.on('reconnect', function() {
            console.log('reconnect fired');
        });

        socket.on('availableRooms', function() {
            let rooms= [];
            console.log('sending available rooms');
            for(var roomName in io.sockets.adapter.rooms) {
                if (roomName.indexOf(roomPrefix) > -1) {
                    rooms.push(roomName);
                }
            }
            socket.emit('availableRooms', rooms);
        });

        // When we receive a 'message' event from our client, print out
        // the contents of that message and then echo it back to our client
        // using `io.emit()`
        socket.on('message', (message) => {
            let parsedMsg = JSON.parse(message);
            let msg = parsedMsg.clientId + ' ' + parsedMsg.content;
            socket["userName"] = parsedMsg.userName;
            io.emit('message', msg);    
        });

        socket.on('createRoom', (room) => {
            let roomParsed = JSON.parse(room);
            let roomNameWithPrefix = roomPrefix + roomParsed.name;
            socket.join(roomNameWithPrefix);
            socket["roomName"] = roomNameWithPrefix;
            let foundRoom = io.sockets.adapter.rooms[roomNameWithPrefix];
            foundRoom["GameOptions"] = roomParsed;
            io.sockets.in(roomNameWithPrefix).emit('New user connected to room');
        });

        socket.on('setUserName', (userName) => {
            const valid = this.validateUser(userName);
            if (valid) {
                let uName = ("" + userName).toLowerCase();
                activeUsers.add(uName);
                socket["userName"] = uName;
            }
            console.log(valid + 'isValid');
            const response: UserValidResponse = { type: 'setUserName', isUserValid : valid }

            socket.emit('setUserName', response);
        });

        socket.on('joinRoom', (data) => {
            let roomNameWithPrefix = roomPrefix + JSON.parse(data);
            socket.join(roomNameWithPrefix);
            socket["roomName"] = roomNameWithPrefix;
            let foundRoom = io.sockets.adapter.rooms[roomNameWithPrefix];
        });

        socket.on('gameStart', (data) => {
            let room = socket["roomName"];
            io.sockets.in(room).emit('gameStart', '');
                
            setTimeout(function() { this.sendCharacterCardsToSockets(room); }, 2000);
        });

        socket.on('playerUpdate', (data) => {
            let player = JSON.parse(data);
            let roomWithPrefix = roomPrefix + player.Room;
            let sockets = this.getUsersInRoom(roomWithPrefix);
            let foundSocket = sockets.filter(x => x.userName === player.Name)[0];
            
            if (foundSocket) {
                foundSocket.Ready = player.Ready;
                let updatedPlayers = [];
                for(let i = 0 ; i < sockets.length; i ++ ) {
                    updatedPlayers.push(
                    {
                        Name : sockets[i].userName,
                        Ready : sockets[i].Ready
                    });
                }

                let room = io.sockets.adapter.rooms[roomWithPrefix];
                if (room) {
                    let socketsLimit = room["GameOptions"].playersLimit;
                    let maxLimitOfPlayers = room["GameOptions"].NumberOfGood + room["GameOptions"].NumberOfEvil + room["GameOptions"].SpecialCharacters.length;
                    let data = { players: updatedPlayers, availablePlayers: sockets.length, maxLimit: maxLimitOfPlayers};
                    io.sockets.in(roomWithPrefix).emit('playersInRoom', data);
                }
            }
        });

        socket.on('playersInRoom', (room) => {
            
            let roomNameWithPrefix = roomPrefix + JSON.parse(room);
            this.playerInRoomsChanged(roomNameWithPrefix);
        });

        socket.on('initGame', (room) => {
            let roomNameWithPrefix = roomPrefix + JSON.parse(room);
            let foundRoom = io.sockets.adapter.rooms[roomNameWithPrefix];
            if (foundRoom) {
                foundRoom["GameOptions"].MissionId = 0;
                this.initGame(roomNameWithPrefix); 
            }
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

        socket.on('getSpecialCharacters', (data) => {
            let characters = Game.getSpecialCharacters();
            socket.emit('getSpecialCharacters', { Type: 'getSpecialCharacters', data : characters });
        });

        socket.on('getDefaultCampaign', (data) => {
            let numberOfPlayers = data;
            let campaign = Game.getDefaultCampaign(numberOfPlayers);
            socket.emit('getDefaultCampaign', { Type: 'getDefaultCampaign', data : campaign });
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
                    let sockets = players.filter(x => team.indexOf(x.userName) > -1);
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
                        sockets[i].emit('voteMission', { type: 'voteMission' });
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

public sendCharacterCardsToSockets(room) {
    let sockets = this.getUsersInRoom(room);
    let foundRoom = io.sockets.adapter.rooms[room];
    Game.attachCharactersToSockets(foundRoom["GameOptions"], sockets);
    Game.addSpecialAbilitiesToCharacters(sockets);
    
    for(let i = 0 ; i < sockets.length; i++ ) {
        let data = { type: 'sendingCharacterCard', characterCard: sockets[i].Character}
        io.to(sockets[i].id).emit('sendingCharacterCard', data);
    }
}

// Initialize our websocket server on port 5000


public validateUser(userName) {
    return !activeUsers.has(userName);
}

public getUsersInRoom(roomId) {
    var outputlist = [];
    if (io.sockets.adapter.rooms[roomId]) {
        var clients_in_the_room = io.sockets.adapter.rooms[roomId].sockets; 
        for (var clientId in clients_in_the_room) {
            outputlist.push(io.sockets.connected[clientId]);
        }
    }
    return outputlist; 
}

public playerInRoomsChanged(room) {
    let sockets = this.getUsersInRoom(room);
    let updatedPlayers = [];

    for(let i = 0 ; i < sockets.length; i ++ ) {
        updatedPlayers.push(
        {
            Name : sockets[i].userName,
            Ready : sockets[i].Ready
        });
    }

    let roomOptions = io.sockets.adapter.rooms[room];
    if (roomOptions) {
        let maxLimitOfPlayers = roomOptions["GameOptions"].NumberOfGood + roomOptions["GameOptions"].NumberOfEvil + roomOptions["GameOptions"].SpecialCharacters.length;
        let data = { players: updatedPlayers, availablePlayers: sockets.length, maxLimit: maxLimitOfPlayers};
        io.sockets.in(room).emit('playersInRoom', data);
    }
}

public initGame (room) {
    let sockets = this.getUsersInRoom(room);
    let updatedPlayers = [];

    for(let i = 0 ; i < sockets.length; i ++ ) {
        updatedPlayers.push(
        {
            Name : sockets[i].userName,
            Ready : false,
            IsLeader : false,
            IsGoingOnAMission : false
        });
    }
    let randomPlayer = Math.floor(Math.random() * updatedPlayers.length);
    var pl = updatedPlayers[randomPlayer]
    if (pl) {
        pl.IsLeader = true;
    }

    let foundRoom = io.sockets.adapter.rooms[room];
    
    let mission = foundRoom["GameOptions"].Campaign.Missions[foundRoom["GameOptions"].MissionId];
    foundRoom["GameOptions"].Campaign.Players = updatedPlayers;
    mission.VotingFailed = 0;
    mission.Votes = [];
    mission.SuccessFailureVote = [];
    let data = { type : 'initGame', players: updatedPlayers, mission : mission, campaign: foundRoom["GameOptions"].Campaign };
    io.sockets.in(room).emit('initGame', data);
}

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