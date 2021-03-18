import { Field, Int, ObjectType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

//NOTE TO VIEW DATA YOU NEED TO DISPLAY IT AS A FIELD, OTHERWISE IT CANNOT BE ACCESSED!
@ObjectType()
@Entity("users")
export class User extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column("text")
    email: string;

    @Column("text")
    password: string;
    
    @Column("int", {default: 0})
    tokenVersion: number;

//Game related stats 
    //General game info
    @Field()
    @Column("int", {default: 0})
    xp: number;
    @Field()
    @Column("int", {default: 200})
    xpNeeded: number;
    @Field()
    @Column("int", {default: 0})
    coins: number;
    @Field()
    @Column("int", {default: 1})
    level: number;

    //Combat Related
    @Field()
    @Column("int", {default: 1})
    damage: number;
    @Field()
    @Column("int", {default: 20})
    mobHP: number;
    @Field()
    @Column("int", {default: 20})
    mobMaxHP: number;
}
