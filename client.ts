import { Server } from "./src/server/server";

declare var require: any;
declare var __dirname: any;
declare var process: any;

let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

var dir = path.join(__dirname, '/images');
app.use('/images', express.static(dir));
app.use(express.static(__dirname + '/client'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname+'/client/index.html'));
});

new Server(io);
http.listen(process.env.PORT || 5000, () => {
  console.log("Running on the port " + process.env.PORT);
});
