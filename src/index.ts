import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Socket } from "socket.io";
import { Server } from "http";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./Resolvers/User/UserResolver";
import { createConnection } from "typeorm";
import { refreshToken } from "./authentication/refreshToken";
import { SocketUser } from "./Resolvers/User/SocketUser";
import { saveUserData } from "./saveUserData";

//TODO: Split this project up into a nice class structure.
const socketUsers: SocketUser[] = [];

(async () => {
    const app = express();
    app.use(cors({
        credentials: true,
        origin: ["http://localhost:3000"] //TODO: Change cors when going into production or sum.
    }));

    //Express routes
    app.use(cookieParser());
    app.post("/refresh_token", async (req, res) => refreshToken(req, res));

    await createConnection(); //typeorm connection

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res }),
    });
    //apply middleware to the apollo server
    apolloServer.applyMiddleware({ app, cors: false });

    const server = new Server(app);
    const io = require("socket.io")(server, { cors: { origin: "http://localhost:3000" } });
    //Start the express app
    server.listen(4000, () => {
        console.log("express server listening!");
    });

    //Socketio methods
    //TODO: Give all this it's own file... tomorrow....
    io.on("connection", (socket: Socket) => {
        console.log("Got new socket connection @" + socket.id);

        //bind the socket to a user
        let bound = true; //whether this socket is bound
        let user: SocketUser | undefined = undefined; //the user for this socket

        socket.on("bind", () => {
            bound = true;
            user = getSocketUserFromId(socket.id);
        });

        socket.on("click", () => {
            if (!user) return;
            user.mobHP -= user.damage;

            //if the mob would die, process the event
            if (user.mobHP <= 0) {
                user.xp += user.mobMaxHP;
                user.coins += user.mobMaxHP;
                //if we are supposed to level up
                if (user.xp >= user.xpNeeded) {
                    user.level++;
                    user.xp = user.xp - user.xpNeeded;
                    user.mobMaxHP += 5;
                    socket.emit("levelUpEvent", { 
                        xp: user.xp, 
                        level: user.level, 
                        xpNeeded: user.xpNeeded, 
                        mobMaxHP: user.mobMaxHP 
                    });
                }
                user.mobHP = user.mobMaxHP;

                socket.emit("mobDeathEvent", { xp: user.xp, coins: user.coins });
            }

            socket.emit("clickReceived", { mobHP: user.mobHP });
        });

        socket.on("fetchPlayerData", () => {
            if(!user) return;
            console.log("asked for player data");
            socket.emit("fetchPlayerDataResponse", user);
        })
        //when the socket disconnects, if it's bound then remove the socket user
        socket.on("disconnect", () => {
            saveUserData(user);
            if (bound) {
                removeSocketuser(socket.id);
            }
        })
    });
})();


//setup the apollo server
export const addSocketUser = (socketUser: SocketUser): void => {
    socketUsers.push(socketUser);
    console.log("Added socket user with email", socketUser.email);
}

export const getSocketUsers = (): SocketUser[] => {
    return socketUsers;
}

export const getSocketUserFromId = (socketId: string): SocketUser | undefined => {
    return getSocketUsers().find((usr) => usr.socketId === socketId);
}

export const removeSocketuser = (socketId: string): void => {
    const index = socketUsers.findIndex((usr) => usr.socketId === socketId);
    //if we didnt find if, remove it
    if (index === -1) {
        return;
    }
    const user = socketUsers[index];
    console.log("Removed socket user", user.email);
    //delete the socket user @ that index
    socketUsers.splice(index, 1);
}