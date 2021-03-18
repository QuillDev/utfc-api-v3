import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class SocketUser {
    @Field()
    email: string
    @Field(() => Int)
    xp: number
    @Field(() => Int)
    xpNeeded: number
    @Field(() => Int)
    coins: number
    @Field(() => Int)
    level: number
    @Field(() => Int)
    damage: number
    @Field(() => Int)
    mobHP: number
    @Field(() => Int)
    mobMaxHP: number
    @Field()
    socketId:string
}