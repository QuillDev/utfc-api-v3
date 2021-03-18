import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../MyContext";

// token format
// bearer 4i1095i1290552915
export const isAuth:MiddlewareFn<MyContext> = ({context}, next) => {
    const authorization = context.req.headers.authorization;

    if(!authorization){
        throw new Error("Not authenticated!");
    }
    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!)
        context.payload = payload as any;
    } catch(err) {
        console.error(err);
        throw new Error("Not authenticated!");

    }
    return next();
}