import { AggregateId } from "../../../../shared/abstract";
import { OrangTuaEntity, OrangTuaProps, UserEntity, UserProps } from "../entity";
import { GuruEntity, GuruProps } from "../entity/guru.entity";

export interface IUserRepository {
    addUser(userData: UserEntity<UserProps>): Promise<void>;
    updateUser(userData: UserEntity<UserProps>): Promise<void>;
    updateUserLoginTime(userId: AggregateId, updateTime?: Date): Promise<void>;
    deleteUser(userId: AggregateId): Promise<void>;
    isUserIdExist(userId: AggregateId): Promise<UserProps | null>;
    isUserEmailExist(email: string): Promise<UserProps | null>;
    updatePassword(id: string, hashedPassword: string): Promise<void>;
    
    // this is for kinderfin
    getAllGuru(): Promise<GuruProps[]>;
    addGuru(guruData: GuruEntity<GuruProps>, userData: UserEntity<UserProps>): Promise<void>;
    addOrangTua(orangTuaData: OrangTuaEntity<OrangTuaProps>, userData: UserEntity<UserProps>): Promise<void>;
    
}