import { User } from "../../../entity/User";
import {addSocketUser, getSocketUsers} from "../../../index";
import { SocketUser } from "../SocketUser";

/**
 * Creates a new socket user and pushes it to the socket user array
 * @param payload of the socket user data
 * @param socketId to bind the user to
 * @returns the new socket user
 */
export const createSocketUser = async (payload:any, socketId:string):Promise<SocketUser> => { ///TODO: Type this
    console.log("Authorized to create a socket user");
    //if the socket id is bad, throw an error
    if(!socketId || socketId.length === 0){
        throw Error("Malformed socket id!");
    }
    const user = await User.findOne({ where: { email: payload.email } });

    //if we didn't find a matching user, throw an error
    if(!user){
        throw new Error("No user found!");
    }

    //if the user already exists  in the socket user array, throw an error
    const userExists = getSocketUsers().find((usr) => usr.email === user.email);
    if(userExists){
        throw new Error("User already exists on this account!");
    }

    const socketUser = dbUserToSocketUser(user, socketId)
    addSocketUser(socketUser);
    return socketUser;
}

/**
 * Convert a DB user to a socket user
 * @param user from the database
 * @param socketId to bind the user to
 * @returns a socket user with the database users properties
 */
export const dbUserToSocketUser = (user:User, socketId:string):SocketUser => {
    return {
        email: user.email,
        xp: user.xp,
        xpNeeded: user.xpNeeded,
        coins: user.coins,
        level: user.level,
        damage: user.damage,
        mobHP: user.mobHP,
        mobMaxHP: user.mobMaxHP,
        socketId,
    }
}
