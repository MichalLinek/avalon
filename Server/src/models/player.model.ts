export class Player {
    public socketId: string;
    public userName: string;
    public roomId?: string;

    constructor(socketId: string, userName: string, roomId?: string) {
        this.socketId = socketId;
        this.userName = userName;
        this.roomId = roomId;
    }   
}