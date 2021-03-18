import {Request, Response} from "express";
import {verify} from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from "../entity/User";
import { sendRefreshToken } from "./sendRefreshToken";

export const refreshToken = async (req:Request, res:Response) => {
    const token = req.cookies.jid;
    if(!token){
        return res.json({ok: false, accessToken: ""});
    }

    let payload:any = null;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch(err) {
        console.log(err);
        return res.json({ok: false, accessToken: ""});
    }

    //token is valid here 
    // & we can send back an access token
    const user = await User.findOne({id: payload.userId});

    //if there was no user for some reason, send back no access token
    if(!user){
        return res.json({ok: false, accessToken: ""});
    }

    //if the token version is not the same as the users token version, kill it
    if(user.tokenVersion !== payload.tokenVersion){
        return res.json({ok: false, accessToken: ""});
    }

    //refresh the refresh token
    sendRefreshToken(res, createRefreshToken(user));
    return res.json({ok: true, accessToken: createAccessToken(user)});
}