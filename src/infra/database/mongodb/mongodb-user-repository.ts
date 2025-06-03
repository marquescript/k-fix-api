import { User } from "src/domain/@types/user";
import { UserRepository } from "src/domain/repository/user-repository";
import { Model } from "mongoose";
import UserModel, { UserDocument } from "./schemas/user";

export class MongoDBUserRepository implements UserRepository {

    private readonly user: Model<UserDocument>

    constructor(){
        this.user = UserModel
    }

    async create(user: User): Promise<User> {
        return await this.user.create(user)
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.user.findOne({ email })
    }

    async findById(id: string): Promise<User | null> {
        return await this.user.findById(id)
    }

}