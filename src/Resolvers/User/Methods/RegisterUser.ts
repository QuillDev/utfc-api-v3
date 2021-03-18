import { hash } from "bcryptjs";
import { User } from "../../../entity/User";

export const RegisterUser = async (email:string, password:string) => {
    try {
        const hashedPassword = await hash(password, 12); //TODO: Better password hashing argon thing he mentioned?
        await User.insert({
            email,
            password: hashedPassword,
        })
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
