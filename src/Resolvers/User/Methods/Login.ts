import { compare } from "bcryptjs";
import { createRefreshToken, createAccessToken } from "../../../authentication/auth";
import { sendRefreshToken } from "../../../authentication/sendRefreshToken";
import { User } from "../../../entity/User";
import {Response} from "express";
import { LoginResponse } from "../LoginResponse";

export const Login = async (email:string, password:string, res:Response):Promise<LoginResponse> => {
    const user = await User.findOne({ where: { email } }); //find a user with this email
        if (!user) {
            throw new Error("Could not find user!");
        }

        const valid = await compare(password, user.password); //Check if teh password is valid using bcrypt
        if (!valid) {
            throw new Error("Invalid password!");
        }

        //Login successful
        //TODO: Note, this uses a DIFFERENT random string
        sendRefreshToken(res, createRefreshToken(user));

        //TODO: Give the user tokens here!
        return {
            accessToken: createAccessToken(user),
            user,
        };
}
