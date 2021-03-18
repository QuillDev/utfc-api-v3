import { verify } from "jsonwebtoken";
import { User } from "../../../entity/User";
import { MyContext } from "src/MyContext";

export const MeQuery = async (context:MyContext) => {
    const authorization = context.req.headers["authorization"];
    
    if (!authorization) {
        return null;
    }
    try {
        const token = authorization.split(" ")[1];
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        return User.findOne(payload.userId);
    }
    catch (err) {
        console.log(err);
        return null;
    }
}