import { User } from "./entity/User";
import { SocketUser } from "./Resolvers/User/SocketUser";

export const saveUserData = async (socketUser:SocketUser|undefined) => {
    if(!socketUser) return;
    const user = await User.findOne({ where: { email: socketUser.email } });
    if(!user) return;

    user.coins = socketUser.coins;
    user.xp = socketUser.xp;
    user.xpNeeded = socketUser.xpNeeded;
    user.level = socketUser.level;
    user.mobHP = socketUser.mobHP;
    user.mobMaxHP = socketUser.mobMaxHP;
    user.save();
}
