import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../../entity/User";
import { MyContext } from "../../MyContext";
import { isAuth } from "../../authentication/isAuth";
import { sendRefreshToken } from "../../authentication/sendRefreshToken";
import { getConnection } from "typeorm";
import { MeQuery } from "./Methods/MeQuerty";
import { RegisterUser } from "./Methods/RegisterUser";
import { Login } from "./Methods/Login";
import { LoginResponse } from "./LoginResponse";
import { createSocketUser} from "./Methods/socketUserHelper";
import { SocketUser } from "./SocketUser";

@Resolver()
export class UserResolver {


    //Get information about the current user.
    @Query(() => User, { nullable: true })
    me(@Ctx() context: MyContext) {return MeQuery(context)}

    //Get the users ID and Email in a printed string
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(@Ctx() { payload }: MyContext) { return JSON.stringify(payload); }

    //This query gets all users in the DB
    @Query(() => [User])
    users() { return User.find(); }

    //TODO: Remove this after some testing, only call this from server side!
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
        await getConnection()
            .getRepository(User)
            .increment({ id: userId }, "tokenVersion", 1);
        return true;
    }

    //Register a new user
    @Mutation(() => Boolean)
    async register(
        @Arg("email") email: string,
        @Arg("password") password: string,
    ) {return await RegisterUser(email, password)}

    //Log the user in
    @Mutation(() => LoginResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { res }: MyContext //TODO: Rename this to something more fitting?
    ):Promise<LoginResponse> { return await Login(email, password, res)}

    //Log the user out
    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) { sendRefreshToken(res, ""); return true;}

    @Mutation(() => SocketUser, {nullable: true})
    @UseMiddleware(isAuth)
    async createSocketUser(
        @Ctx() { payload }: MyContext,
        @Arg("socketId") socketId: string,
        ):Promise<SocketUser> { return await createSocketUser(payload, socketId); }
}