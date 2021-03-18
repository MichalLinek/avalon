# BoardGame 'Avalon'
The project is a mobile implementation of the famous BoardGame called "Avalon". 
The application is divided into two parts server and client.
The connection between the two is based on the sockets.

# Client Application
Run "npm run run-client" in order to build a client in an angular app. By default application runs on http://localhost:4200.

# Server Application
Run "npm run run-server" in order to build a server based on Node.js technology. By default the server runs on http://localhost:5000.

# Currently the application supports the following features:
* Connecting to the server
* Creating rooms with the following configuration
  * Number of players
  * Number of Good alignment characters
  * Number of Evil alignment characters
  * Special characters (Mordred, Morgana, Merlin, Percival, Lancelot, Oberon, Assassin)
  * Mission configuration (Number of commpanions required on the mission / Number of 'fails' to fail the mission)
* Game Process
  * Choosing the Leader
  * As a Leader choosing the requred companions on the current mission
  * Players can vote whether they agree on the team or disagree
  * If the team is accepted the players have the ability to mark the mission as Fail or Success
  * If the team is not accepted, another Leader is chosen
  * Players have the ability to view their cards and check what's their special features (if they have any)


# Planned features:
* "Lady of the Lake" expansion
* "Excalibur" expansion
* End Game Assassination of Merlin
* Lancelots changing sides based on the "Loyalty" tokens
